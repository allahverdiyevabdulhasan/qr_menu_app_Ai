from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from restaurants.models import Restaurant
from restaurants.serializers import RestaurantSettingsSerializer
from menu.models import Category, Product
from menu.serializers import CategorySerializer, ProductSerializer
from orders.models import Order, OrderItem
from django.db import transaction

class PublicMenuAPIView(APIView):
    permission_classes = [] # Public, no auth required
    authentication_classes = []

    def get(self, request, slug):
        restaurant = get_object_or_404(Restaurant, slug=slug, status='active')
        categories = Category.objects.filter(restaurant=restaurant)
        products = Product.objects.filter(restaurant=restaurant, is_active=True)
        
        # Serialize settings if they exist
        settings_data = None
        if hasattr(restaurant, 'settings'):
            settings_data = RestaurantSettingsSerializer(restaurant.settings).data
            
        # Check for active Happy Hour
        from django.utils import timezone
        import datetime
        now = timezone.localtime()
        current_time = now.time()
        current_weekday = now.weekday() # 0 = Monday, 6 = Sunday
        
        # Map weekday to HappyHour boolean field
        day_fields = {0: 'monday', 1: 'tuesday', 2: 'wednesday', 3: 'thursday', 4: 'friday', 5: 'saturday', 6: 'sunday'}
        day_field = day_fields[current_weekday]
        
        from campaigns.models import HappyHour
        active_happy_hour = HappyHour.objects.filter(
            restaurant=restaurant, 
            is_active=True,
            start_time__lte=current_time,
            end_time__gte=current_time,
            **{day_field: True}
        ).first()

        serialized_products = ProductSerializer(products, many=True, context={'request': request}).data
        
        if active_happy_hour:
            discount_multiplier = (100 - active_happy_hour.discount_percent) / 100
            for prod in serialized_products:
                prod['original_price'] = prod['price']
                discounted_price = float(prod['price']) * float(discount_multiplier)
                prod['price'] = f"{discounted_price:.2f}"
                prod['is_happy_hour'] = True
        
        return Response({
            'restaurant': {
                'id': restaurant.id,
                'name': restaurant.name,
                'slug': restaurant.slug,
                'logo': request.build_absolute_uri(restaurant.logo.url) if restaurant.logo else None,
                'active_campaign': f"{active_happy_hour.title} (%{active_happy_hour.discount_percent} İndirim)" if active_happy_hour else None
            },
            'settings': settings_data,
            'categories': CategorySerializer(categories, many=True, context={'request': request}).data,
            'products': serialized_products
        })

from rest_framework_simplejwt.authentication import JWTAuthentication

class PublicOrderAPIView(APIView):
    permission_classes = []
    authentication_classes = [JWTAuthentication]

    @transaction.atomic
    def post(self, request):
        data = request.data
        slug = data.get('restaurant_slug')
        table_number = data.get('table_number')
        items = data.get('items')
        order_type = data.get('order_type', 'DINE_IN')
        payment_method = data.get('payment_method', 'UNPAID')
        customer_note = data.get('note', '')
        
        if not slug or not items:
            return Response({"error": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
            
        if order_type == 'DINE_IN' and not table_number:
            return Response({"error": "Masa numarası gereklidir"}, status=status.HTTP_400_BAD_REQUEST)
            
        restaurant = Restaurant.objects.filter(slug=slug, status='active').first()
        if not restaurant:
            return Response({"error": "Restaurant not found or inactive"}, status=status.HTTP_400_BAD_REQUEST)
        
        customer_user = request.user if request.user and request.user.is_authenticated else None
        
        delivery_address_id = data.get('delivery_address_id')
        tip_amount = float(data.get('tip_amount', 0))
        is_gift = data.get('is_gift', False)
        gift_recipient_name = data.get('gift_recipient_name', '')
        gift_message = data.get('gift_message', '')
        scheduled_time = data.get('scheduled_time') # string datetime
        
        full_note = customer_note
        if table_number:
            full_note = f"Masa: {table_number} | {customer_note}"
            
        order = Order.objects.create(
            restaurant=restaurant,
            order_type=order_type,
            payment_status=payment_method,
            status='NEW',
            customer=customer_user,
            note=full_note,
            delivery_address_id=delivery_address_id,
            tip_amount=tip_amount,
            is_gift=is_gift,
            gift_recipient_name=gift_recipient_name,
            gift_message=gift_message,
            scheduled_time=scheduled_time
        )
        
        total_amount = 0
        for item in items:
            product_id = item.get('product_id')
            if not product_id:
                return Response({"error": "Missing product_id in items"}, status=status.HTTP_400_BAD_REQUEST)
                
            product = Product.objects.filter(id=product_id, restaurant=restaurant).first()
            if not product:
                order.delete() # Rollback order creation
                return Response({"error": f"Product with id {product_id} not found"}, status=status.HTTP_400_BAD_REQUEST)
                
            if product.stock_status == 'out_of_stock':
                order.delete() # Rollback order creation
                return Response({"error": f"Üzgünüz, '{product.name}' şu an stokta yok. Lütfen sepetinizden çıkarın."}, status=status.HTTP_400_BAD_REQUEST)
                
            quantity = int(item.get('quantity', 1))
            base_price = float(product.price)
            
            selected_options = item.get('selected_options', {})
            extra_price = float(selected_options.get('extra_price', 0)) if isinstance(selected_options, dict) else 0
            
            unit_price = base_price + extra_price
            total_price = unit_price * quantity
            total_amount += total_price
            
            # Extract readable text to save in note
            options_text = selected_options.get('text', '') if isinstance(selected_options, dict) else ''
            
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name_snapshot=product.name,
                quantity=quantity,
                unit_price=unit_price,
                total_price=total_price,
                selected_options=selected_options,
                note=options_text
            )
            
        use_wallet = data.get('use_wallet', False)
        customer_profile = None
        if customer_user:
            customer_profile = Customer.objects.filter(restaurant=restaurant, email=customer_user.email).first()
            
        if use_wallet and customer_profile:
            wallet_balance = float(customer_profile.wallet_balance)
            if wallet_balance >= total_amount:
                customer_profile.wallet_balance -= total_amount
                total_amount = 0
            else:
                total_amount -= wallet_balance
                customer_profile.wallet_balance = 0
            customer_profile.save()
            
        if customer_profile and total_amount > 0:
            # 5% cashback on the remaining amount paid in cash/credit
            cashback = float(total_amount) * 0.05
            customer_profile.wallet_balance = float(customer_profile.wallet_balance) + cashback
            customer_profile.save()
            
        order.total_amount = total_amount
        order.save()
        
        # Here we would trigger the WebSocket to KDS / Waiter Panel
        
        return Response({
            "message": "Order created successfully",
            "order_id": order.id
        }, status=status.HTTP_201_CREATED)


class PublicOrderStatusAPIView(APIView):
    permission_classes = []
    authentication_classes = []

    def get(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        
        items = OrderItem.objects.filter(order=order)
        items_data = []
        for item in items:
            items_data.append({
                'product_name': item.product_name_snapshot,
                'quantity': item.quantity,
                'total_price': item.total_price
            })
            
        return Response({
            'id': order.id,
            'tracking_code': order.tracking_code,
            'status': order.status,
            'total_amount': order.total_amount,
            'created_at': order.created_at,
            'items': items_data
        })

from django.contrib.auth import get_user_model
from customers.models import Customer
User = get_user_model()

class CustomerRegisterAPIView(APIView):
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        data = request.data
        phone = data.get('phone')
        email = data.get('email')
        password = data.get('password')
        name = data.get('name', '')
        restaurant_slug = data.get('restaurant_slug')

        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        if not password:
            return Response({"error": "Password is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        username = email
        
        if User.objects.filter(username=username).exists():
            return Response({"error": "User with this email already exists"}, status=status.HTTP_400_BAD_REQUEST)
            
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=name,
            role=User.RoleChoices.CUSTOMER,
            phone=phone if phone else ''
        )
        
        # If a restaurant context is provided, link them as a CRM customer
        restaurant_name = "Bizim Restoran"
        if restaurant_slug:
            restaurant = Restaurant.objects.filter(slug=restaurant_slug).first()
            if restaurant:
                restaurant_name = restaurant.name
                Customer.objects.create(
                    restaurant=restaurant,
                    name=name,
                    phone=phone if phone else '',
                    email=email if email else ''
                )
                
        # Send Welcome Email in background
        def send_welcome_email(user_email, user_name, rest_name):
            try:
                from django.core.mail import EmailMultiAlternatives
                from django.conf import settings
                
                subject = f"{rest_name}'a Hoş Geldiniz! 🎉"
                text_content = f"Merhaba {user_name},\n\n{rest_name}'a hoş geldiniz! Hesabınız başarıyla oluşturuldu."
                html_content = f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #7A5CFF; text-align: center;">{rest_name}'a Hoş Geldiniz! 🎉</h2>
                    <p style="font-size: 16px; color: #333;">Merhaba <strong>{user_name}</strong>,</p>
                    <p style="font-size: 16px; color: #555;">Hesabınız başarıyla oluşturuldu. Bizi tercih ettiğiniz için teşekkür ederiz.</p>
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://neymenuai.com" style="background-color: #7A5CFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Sipariş Vermeye Başla</a>
                    </div>
                    <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px; margin-bottom: 20px;">
                    <p style="font-size: 12px; color: #999; text-align: center;">Bu e-posta otomatik olarak gönderilmiştir. Lütfen cevaplamayınız.</p>
                </div>
                """
                msg = EmailMultiAlternatives(subject, text_content, settings.DEFAULT_FROM_EMAIL, [user_email])
                msg.attach_alternative(html_content, "text/html")
                msg.send()
            except Exception as e:
                print(f"Error sending email: {e}")

        import threading
        threading.Thread(target=send_welcome_email, args=(email, name or username, restaurant_name)).start()
                
        # Generate JWT tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        return Response({
            "message": "Registration successful",
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=status.HTTP_201_CREATED)

from rest_framework.permissions import IsAuthenticated

class CustomerProfileOrdersAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.RoleChoices.CUSTOMER:
            return Response([])
            
        orders = Order.objects.filter(customer=request.user).order_by('-id')
        
        data = []
        for order in orders:
            items = OrderItem.objects.filter(order=order)
            items_data = [{
                'product_name': item.product_name_snapshot,
                'quantity': item.quantity,
                'total_price': str(item.total_price)
            } for item in items]
            
            data.append({
                'id': order.id,
                'tracking_code': order.tracking_code,
                'status': order.status,
                'total_amount': str(order.total_amount),
                'created_at': order.created_at,
                'restaurant_name': order.restaurant.name if order.restaurant else 'Bilinmeyen Restoran',
                'items': items_data
            })
            
        return Response(data)

from customers.models import CustomerAddress
from customers.serializers import CustomerAddressSerializer

class CustomerAddressAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != User.RoleChoices.CUSTOMER:
            return Response([])
            
        customer = Customer.objects.filter(email=request.user.email).first()
        if not customer:
            return Response([])
            
        addresses = CustomerAddress.objects.filter(customer=customer)
        return Response(CustomerAddressSerializer(addresses, many=True).data)

    def post(self, request):
        if request.user.role != User.RoleChoices.CUSTOMER:
            return Response({"error": "Sadece müşteriler adres ekleyebilir."}, status=403)
            
        customer = Customer.objects.filter(email=request.user.email).first()
        if not customer:
            return Response({"error": "Müşteri profili bulunamadı."}, status=status.HTTP_400_BAD_REQUEST)
            
        data = request.data.copy()
        
        # if this is marked as default, unset others
        if data.get('is_default') == True:
            CustomerAddress.objects.filter(customer=customer).update(is_default=False)
            
        serializer = CustomerAddressSerializer(data=data)
        if serializer.is_valid():
            serializer.save(customer=customer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomerAddressDetailAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):
        customer = Customer.objects.filter(email=request.user.email).first()
        return get_object_or_404(CustomerAddress, pk=pk, customer=customer)

    def put(self, request, pk):
        address = self.get_object(request, pk)
        data = request.data
        if data.get('is_default') == True:
            CustomerAddress.objects.filter(customer=address.customer).exclude(pk=pk).update(is_default=False)
            
        serializer = CustomerAddressSerializer(address, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        address = self.get_object(request, pk)
        address.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class CustomerPreferencesAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        customer = Customer.objects.filter(email=request.user.email).first()
        if not customer:
            return Response({"error": "Profil bulunamadı."}, status=404)
        return Response({
            'wallet_balance': str(customer.wallet_balance),
            'dietary_preferences': customer.dietary_preferences,
            'allergies': customer.allergies
        })
        
    def put(self, request):
        customer = Customer.objects.filter(email=request.user.email).first()
        if not customer:
            return Response({"error": "Profil bulunamadı."}, status=404)
            
        data = request.data
        if 'dietary_preferences' in data:
            customer.dietary_preferences = data['dietary_preferences']
        if 'allergies' in data:
            customer.allergies = data['allergies']
        customer.save()
        
        return Response({
            'message': 'Tercihler güncellendi',
            'dietary_preferences': customer.dietary_preferences,
            'allergies': customer.allergies
        })

from tables.models import WaiterCall, RestaurantTable

class WaiterCallAPIView(APIView):
    permission_classes = []
    
    def post(self, request):
        restaurant_slug = request.data.get('restaurant_slug')
        table_number = request.data.get('table_number')
        call_type = request.data.get('call_type', 'waiter') # 'waiter' or 'bill'
        
        if not restaurant_slug or not table_number:
            return Response({"error": "restaurant_slug and table_number are required"}, status=400)
            
        restaurant = Restaurant.objects.filter(slug=restaurant_slug).first()
        if not restaurant:
            return Response({"error": "Restaurant not found"}, status=404)
            
        table = RestaurantTable.objects.filter(restaurant=restaurant, table_number=table_number).first()
        if not table:
            return Response({"error": "Table not found"}, status=404)
            
        call = WaiterCall.objects.create(
            restaurant=restaurant,
            table=table,
            call_type=call_type
        )
        
        return Response({"message": f"{call_type} call created successfully", "id": call.id})

class PublicAIChatAPIView(APIView):
    permission_classes = []
    
    def post(self, request, slug):
        restaurant_slug = slug
        message = request.data.get('message', '').lower()
        
        if not restaurant_slug or not message:
            return Response({"error": "restaurant_slug and message are required"}, status=400)
            
        restaurant = Restaurant.objects.filter(slug=restaurant_slug).first()
        if not restaurant:
            return Response({"error": "Restaurant not found"}, status=404)
            
        # Demo AI Logic - Rule-based fallback if no real LLM API is integrated
        # In a real app, this would call OpenAI API with the restaurant's menu context
        products = Product.objects.filter(restaurant=restaurant, is_active=True)
        recommended_products = []
        reply = "Üzgünüm, ne demek istediğinizi tam anlayamadım."
        
        if 'acı' in message or 'baharatlı' in message:
            reply = "Acı ve baharatlı lezzetleri sevenler için şu ürünlerimizi tavsiye edebilirim:"
            # Just pick some random products for demo if we don't have tags
            recommended_products = products[:2]
        elif 'tatlı' in message:
            reply = "Tatlı kriziniz için harika seçeneklerimiz var!"
            recommended_products = products.filter(category__name__icontains='tatlı')[:2]
            if not recommended_products:
                recommended_products = products[:1]
        elif 'soğuk' in message or 'içecek' in message or 'serin' in message:
            reply = "İşte içinizi ferahlatacak serin içeceklerimiz:"
            recommended_products = products.filter(category__name__icontains='içecek')[:2]
            if not recommended_products:
                recommended_products = products[:2]
        elif 'vegan' in message or 'vejetaryen' in message:
            reply = "Vegan ve vejetaryen seçeneklerimizden sizin için seçtiklerim:"
            recommended_products = products[:2]
        elif 'kalori' in message or 'sağlık' in message or 'diyet' in message:
            reply = "Formunu koruyanlar için hafif, sağlıklı ve düşük kalorili tavsiyelerimiz:"
            # Ideally filter by a 'calories' field, but for demo we pick items like salads or soups if available, or just random
            recommended_products = products.filter(category__name__icontains='salata')[:2]
            if not recommended_products:
                recommended_products = products[:2]
        else:
            reply = "Sizin için menümüzden en çok tercih edilen bazı lezzetleri seçtim:"
            recommended_products = products.order_by('?')[:2]
            
        # Serialize recommendations
        from menu.serializers import ProductSerializer
        serialized_products = ProductSerializer(recommended_products, many=True, context={'request': request}).data
        
        return Response({
            "success": True,
            "reply": reply,
            "recommended_product_ids": [p.id for p in recommended_products],
            "recommendations": serialized_products
        })

class PublicAIBudgetAPIView(APIView):
    permission_classes = []
    
    def post(self, request, slug):
        budget = float(request.data.get('budget', 0))
        people_count = int(request.data.get('people_count', 1))
        
        restaurant = Restaurant.objects.filter(slug=slug).first()
        if not restaurant:
            return Response({"error": "Restaurant not found"}, status=404)
            
        products = Product.objects.filter(restaurant=restaurant, is_active=True).order_by('price')
        
        # Simple greedy algorithm to find a combination of products under the budget
        recommended = []
        current_total = 0
        
        for _ in range(people_count):
            # Pick a random main course/product that fits remaining average budget
            avg_budget = (budget - current_total) / max(1, (people_count - len(recommended)))
            affordable = [p for p in products if float(p.price) <= avg_budget]
            if affordable:
                import random
                choice = random.choice(affordable)
                recommended.append(choice)
                current_total += float(choice.price)
                
        if not recommended:
            return Response({
                "success": False,
                "message": "Bu bütçeye uygun menü oluşturulamadı."
            })
            
        return Response({
            "success": True,
            "message": f"Bütçenize ({budget} ₺) uygun {len(recommended)} üründen oluşan ideal bir menü hazırladık. Afiyet olsun!",
            "recommended_product_ids": [p.id for p in recommended]
        })

class CourierOrdersAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'courier_profile'):
            return Response({"error": "Sadece kuryeler erişebilir."}, status=403)
            
        courier = request.user.courier_profile
        # Deliveries for this courier (READY to be delivered, OUT_FOR_DELIVERY, or DELIVERED today)
        orders = Order.objects.filter(courier=courier, order_type='DELIVERY').exclude(status__in=['NEW', 'ACCEPTED', 'PREPARING', 'CANCELLED', 'REFUNDED']).order_by('-created_at')
        
        # We need a quick way to show orders, especially active ones (OUT_FOR_DELIVERY, READY)
        data = []
        for o in orders:
            address_str = ""
            customer_phone = ""
            lat = None
            lng = None
            if o.delivery_address:
                address_str = o.delivery_address.full_address
                if o.delivery_address.notes:
                    address_str += f" (Not: {o.delivery_address.notes})"
                customer_phone = o.delivery_address.customer.phone if o.delivery_address.customer else ""
                lat = o.delivery_address.lat
                lng = o.delivery_address.lng
                
            data.append({
                "id": o.id,
                "tracking_code": o.tracking_code,
                "status": o.status,
                "total_amount": str(o.total_amount),
                "tip_amount": str(o.tip_amount),
                "created_at": o.created_at,
                "address": address_str,
                "lat": lat,
                "lng": lng,
                "phone": customer_phone,
                "customer_name": o.customer.get_full_name() if o.customer else (o.customer_profile.name if o.customer_profile else "Misafir")
            })
            
        return Response(data)

class CourierOrderStatusUpdateAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not hasattr(request.user, 'courier_profile'):
            return Response({"error": "Sadece kuryeler erişebilir."}, status=403)
            
        courier = request.user.courier_profile
        order = get_object_or_404(Order, id=pk, courier=courier)
        new_status = request.data.get('status')
        
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response({"error": "Geçersiz durum."}, status=400)
            
        order.status = new_status
        order.save()
        return Response({"success": True, "message": "Sipariş durumu güncellendi.", "status": order.status})

from reviews.models import Review
from reservations.models import Reservation

class PublicReviewAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        customer = request.user.customer_profile
        order_id = request.data.get('order_id')
        rating = request.data.get('rating')
        comment = request.data.get('comment', '')

        if not order_id or not rating:
            return Response({"error": "Sipariş ID ve puan zorunludur."}, status=status.HTTP_400_BAD_REQUEST)

        order = get_object_or_404(Order, id=order_id, customer=customer)
        
        # Check if already reviewed
        if Review.objects.filter(order=order).exists():
            return Response({"error": "Bu sipariş için zaten değerlendirme yapılmış."}, status=status.HTTP_400_BAD_REQUEST)

        Review.objects.create(
            restaurant=order.restaurant,
            customer=customer,
            order=order,
            rating=rating,
            comment=comment
        )

        return Response({"success": True, "message": "Değerlendirmeniz başarıyla alındı. Teşekkür ederiz!"}, status=status.HTTP_201_CREATED)

class PublicReservationAPIView(APIView):
    permission_classes = [] # Public, no auth required by default, but we can capture customer if logged in
    authentication_classes = [JWTAuthentication]

    def post(self, request, slug):
        restaurant = get_object_or_404(Restaurant, slug=slug, status='active')
        
        date = request.data.get('date')
        time = request.data.get('time')
        guest_count = request.data.get('guest_count')
        customer_name = request.data.get('customer_name')
        customer_phone = request.data.get('customer_phone')
        note = request.data.get('note', '')

        if not all([date, time, guest_count, customer_name, customer_phone]):
            return Response({"error": "Tüm zorunlu alanları doldurun."}, status=status.HTTP_400_BAD_REQUEST)

        # If user is logged in, we could attach it, but currently Reservation model doesn't link to Customer model directly,
        # it just stores name and phone. Let's just create it.
        Reservation.objects.create(
            restaurant=restaurant,
            customer_name=customer_name,
            customer_phone=customer_phone,
            date=date,
            time=time,
            guest_count=guest_count,
            note=note
        )

        return Response({"success": True, "message": "Rezervasyon talebiniz alındı. En kısa sürede onaylanacaktır."}, status=status.HTTP_201_CREATED)

class PublicAIUpsellAPIView(APIView):
    permission_classes = []
    
    def post(self, request, slug):
        # AI Cross-selling logic
        cart_items = request.data.get('cart_items', []) # List of product IDs or names
        
        restaurant = get_object_or_404(Restaurant, slug=slug, status='active')
        products = Product.objects.filter(restaurant=restaurant, is_active=True)
        
        # Simple rule-based upsell:
        # If cart has main course, suggest drink or dessert
        # If cart has drink, suggest snack
        
        suggested_products = []
        message = "Siparişinizin yanına şunları da eklemek ister misiniz?"
        
        has_pizza = any('pizza' in str(item).lower() for item in cart_items)
        has_burger = any('burger' in str(item).lower() for item in cart_items)
        has_drink = any('kola' in str(item).lower() or 'su' in str(item).lower() or 'ayran' in str(item).lower() for item in cart_items)
        
        if (has_pizza or has_burger) and not has_drink:
            message = "Yemeğinizin yanına buz gibi bir içecek harika giderdi!"
            suggested_products = products.filter(category__name__icontains='içecek')[:1]
        elif has_drink and not (has_pizza or has_burger):
            message = "İçeceğinizin yanına atıştırmalık bir şeyler ister misiniz?"
            suggested_products = products.filter(category__name__icontains='atıştır')[:1]
        else:
            message = "Yemeğin üstüne tatlı bir kapanışa ne dersiniz?"
            suggested_products = products.filter(category__name__icontains='tatlı')[:1]
            
        if not suggested_products:
            suggested_products = products.order_by('?')[:1] # Random fallback
            
        from menu.serializers import ProductSerializer
        serialized_products = ProductSerializer(suggested_products, many=True, context={'request': request}).data
        
        return Response({
            "success": True,
            "message": message,
            "recommendations": serialized_products
        })


