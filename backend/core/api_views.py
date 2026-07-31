from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    restaurant_slug = user.restaurant.slug if hasattr(user, 'restaurant') and user.restaurant else None
    
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'role': user.role,
        'restaurant_slug': restaurant_slug
    })

from django.shortcuts import get_object_or_404
from restaurants.models import Restaurant
from menu.models import Category, Product

from django.db.models import Q

from django.core.cache import cache
from django.utils.translation import get_language

@api_view(['GET'])
@permission_classes([]) # Public access
def public_menu(request, slug):
    lang = get_language() or 'en'
    cache_key = f"menu_{slug}_{lang}"
    cached_data = cache.get(cache_key)
    if cached_data:
        return Response(cached_data)

    restaurant = Restaurant.objects.filter(Q(slug=slug) | Q(custom_domain=slug)).first()
    if not restaurant:
        from django.http import Http404
        raise Http404("Restaurant not found")
    
    categories = Category.objects.filter(restaurant=restaurant)
    products = Product.objects.filter(restaurant=restaurant, is_active=True).select_related('category').prefetch_related(
        'options', 'modifier_groups__modifiers', 'display_ingredients'
    )
    
    # Very simple manual serialization for speed
    cat_data = [{'id': c.id, 'name': c.name} for c in categories]
    
    prod_data = []
    for p in products:
        options = []
        for opt in p.options.filter(is_active=True):
            options.append({
                'id': opt.id,
                'name': opt.name,
                'option_type': opt.option_type,
                'price': str(opt.price)
            })
            
        modifier_groups = []
        for mg in p.modifier_groups.all():
            mods = []
            for m in mg.modifiers.filter(is_active=True):
                mods.append({
                    'id': m.id,
                    'name': m.name,
                    'price': str(m.price)
                })
            modifier_groups.append({
                'id': mg.id,
                'name': mg.name,
                'is_required': mg.is_required,
                'min_choices': mg.min_choices,
                'max_choices': mg.max_choices,
                'modifiers': mods
            })
            
        ingredients = []
        for ing in p.display_ingredients.all():
            ingredients.append({
                'id': ing.id,
                'name': ing.name,
                'is_removable': ing.is_removable
            })

        prod_data.append({
            'id': p.id,
            'name': p.name,
            'price': str(p.price),
            'category': p.category_id,
            'display_image': request.build_absolute_uri(p.image.url) if getattr(p, 'image', None) else None,
            'description': getattr(p, 'description', ''),
            'calories': p.calories,
            'protein': str(p.protein) if p.protein is not None else None,
            'carbs': str(p.carbs) if p.carbs is not None else None,
            'fat': str(p.fat) if p.fat is not None else None,
            'allergens': p.allergens,
            'preparation_time': p.preparation_time,
            'is_popular': p.is_popular,
            'is_vegetarian': p.is_vegetarian,
            'is_vegan': p.is_vegan,
            'is_gluten_free': p.is_gluten_free,
            'is_diet': p.is_diet,
            'spicy_level': p.spicy_level,
            'average_rating': p.average_rating,
            'review_count': p.review_count,
            'options': options,
            'modifier_groups': modifier_groups,
            'ingredients': ingredients
        })
    
    from tables.models import RestaurantTable
    available_tables = RestaurantTable.objects.filter(restaurant=restaurant, status='AVAILABLE', is_active=True)
    table_data = [{'number': t.table_number, 'name': getattr(t, 'table_name', str(t.table_number))} for t in available_tables]
    
    response_data = {
        'restaurant': {
            'id': restaurant.id,
            'name': restaurant.name,
            'slug': restaurant.slug,
            'logo': request.build_absolute_uri(restaurant.logo.url) if restaurant.logo else None
        },
        'categories': cat_data,
        'products': prod_data,
        'tables': table_data
    }
    
    # Cache for 1 hour
    cache.set(cache_key, response_data, 60 * 60)
    
    return Response(response_data)

from orders.models import Order, OrderItem
from tables.models import RestaurantTable
import json

@api_view(['POST'])
@permission_classes([]) # Public access
def public_order_create(request):
    try:
        data = request.data
        restaurant_slug = data.get('restaurant_slug')
        table_number = data.get('table_number')
        items = data.get('items', [])
        
        from django.db.models import Q
        restaurant = Restaurant.objects.filter(Q(slug=restaurant_slug) | Q(custom_domain=restaurant_slug)).first()
        if not restaurant:
            return Response({'error': 'Restaurant not found'}, status=404)
        
        # Try to find or create the table
        table, _ = RestaurantTable.objects.get_or_create(
            restaurant=restaurant, 
            table_number=table_number,
            defaults={'status': 'occupied'}
        )
        if table.status != 'occupied':
            table.status = 'occupied'
            table.save()
            
        # Create Order
        order = Order.objects.create(
            restaurant=restaurant,
            table=table,
            status='pending',
            total_amount=0 # We will calculate below
        )
        
        total = 0
        for item_data in items:
            product = get_object_or_404(Product, id=item_data['product_id'])
            qty = item_data['quantity']
            
            # Base price
            base_price = product.price
            item_total = base_price * qty
            
            # Additional options price (sent from frontend)
            options_data = item_data.get('selected_options', {})
            options_total = options_data.get('extra_price', 0)
            
            final_unit_price = base_price + options_total
            final_total = final_unit_price * qty
            
            total += final_total
            
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name_snapshot=product.name,
                quantity=qty,
                unit_price=final_unit_price,
                total_price=final_total,
                selected_options=options_data
            )
            
        order.total_amount = total
        order.save()
        
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'restaurant_{restaurant.slug}_orders',
            {
                'type': 'order_update',
                'order_data': {
                    'id': order.id,
                    'table': table_number,
                    'status': 'pending',
                    'total': str(order.total_amount),
                    'action': 'new_order'
                }
            }
        )
        
        return Response({'success': True, 'order_id': order.id})
    except Exception as e:
        return Response({'error': str(e)}, status=400)

from tables.models import WaiterCall

@api_view(['POST'])
@permission_classes([]) # Public access
def public_waiter_call(request):
    try:
        data = request.data
        restaurant_slug = data.get('restaurant_slug')
        table_number = data.get('table_number')
        call_type = data.get('call_type', 'WAITER').lower() # waiter or bill
        
        restaurant = get_object_or_404(Restaurant, slug=restaurant_slug)
        
        table = RestaurantTable.objects.filter(restaurant=restaurant, table_number=table_number).first()
        if not table:
            return Response({'error': 'Geçersiz masa numarası.'}, status=404)
            
        WaiterCall.objects.create(
            restaurant=restaurant,
            table=table,
            call_type=call_type
        )
        
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'restaurant_{restaurant.slug}_orders',
            {
                'type': 'order_update',
                'order_data': {
                    'table': table_number,
                    'action': 'waiter_call',
                    'call_type': call_type
                }
            }
        )
        
        return Response({'success': True})
    except Exception as e:
        return Response({'error': str(e)}, status=400)

import random

@api_view(['POST'])
@permission_classes([]) # Public access
def public_ai_budget(request, slug):
    try:
        data = request.data
        budget = float(data.get('budget', 0))
        people_count = int(data.get('people_count', 1))
        
        restaurant = get_object_or_404(Restaurant, slug=slug)
        
        # MOCK LOGIC: find a random combination of products that is under the budget.
        # In a real app, this would be an OpenAI call or algorithm.
        products = list(Product.objects.filter(restaurant=restaurant, is_active=True, price__gt=0).values('id', 'name', 'price'))
        
        recommended_ids = []
        total_price = 0
        
        # Shuffle to get different combinations
        random.shuffle(products)
        
        for p in products:
            if total_price + p['price'] <= budget:
                recommended_ids.append(p['id'])
                total_price += p['price']
                if len(recommended_ids) >= people_count * 2: # Max 2 items per person
                    break
                    
        return Response({
            'success': True,
            'recommended_product_ids': recommended_ids,
            'message': f"Bu bütçeye uygun {len(recommended_ids)} ürün bulundu. Afiyet olsun!"
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['POST'])
@permission_classes([]) # Public access
def public_ai_chat(request, slug):
    try:
        data = request.data
        message = data.get('message', '').lower()
        
        restaurant = get_object_or_404(Restaurant, slug=slug)
        
        # MOCK LOGIC for AI Chat
        # In a real app, send the message to OpenAI with menu context
        products = Product.objects.filter(restaurant=restaurant, is_active=True)
        recommended_ids = []
        reply = "Harika bir seçim! Sizin için menümüzden birkaç lezzet seçtim."
        
        if "şikayet" in message or "gecikti" in message or "kurye" in message or "gelmedi" in message or "nerede" in message:
            # Simulate real-time courier check
            reply = "Kuryemiz halihazırda yolda görünüyor, trafik nedeniyle kısa bir gecikme yaşanmış olabilir. Bu aksaklık için özür dileriz! Bizi tercih ettiğiniz için teşekkür olarak sonraki siparişinizde kullanabileceğiniz %10 indirim kodunuz: OZR10"
        elif "kalori" in message or "içinde" in message or "gluten" in message or "alerjen" in message or "içindekiler" in message:
            # Digital Waiter (Dine-in AI)
            reply = "Ürünlerimiz hakkında merak ettiğiniz detayları (kalori, gluten, alerjen) seve seve açıklayabilirim. Sağlıklı seçimler yapmak isteyenler için öne çıkan düşük kalorili ve glütensiz seçeneklerimiz şunlardır:"
            healthy = products.filter(Q(is_gluten_free=True) | Q(calories__lt=400))
            if healthy.exists():
                recommended_ids = list(healthy.values_list('id', flat=True)[:3])
            else:
                recommended_ids = list(products.order_by('?')[:3].values_list('id', flat=True))
        elif "acı" in message or "spicy" in message:
            spicy_products = products.filter(spicy_level__gt=0)
            if spicy_products.exists():
                recommended_ids = list(spicy_products.values_list('id', flat=True)[:3])
                reply = "Acı sevenler için hazırladığımız özel lezzetler aşağıda listelendi. Dikkat edin, gerçekten acı olabilirler! 🌶️"
            else:
                reply = "Maalesef şu an menümüzde acı bir ürün bulunmuyor."
        elif "tatlı" in message or "dessert" in message or "sweet" in message:
            dessert_products = products.filter(name__icontains='tatlı')
            if dessert_products.exists():
                recommended_ids = list(dessert_products.values_list('id', flat=True)[:3])
                reply = "Yemek sonrası için harika tatlı seçeneklerimiz var. 🍰"
            else:
                recommended_ids = list(products.order_by('?')[:2].values_list('id', flat=True))
                reply = "Tatlı menümüz şu an güncelleniyor, ama size en popüler ürünlerimizi önerebilirim!"
        elif "vegan" in message or "vejetaryen" in message:
            vegan_products = products.filter(Q(is_vegan=True) | Q(is_vegetarian=True))
            if vegan_products.exists():
                recommended_ids = list(vegan_products.values_list('id', flat=True)[:3])
                reply = "Sizin için özenle hazırladığımız bitkisel bazlı lezzetlerimiz."
            else:
                reply = "Maalesef şu an tamamen vegan bir seçeneğimiz yok."
        else:
            popular = products.filter(is_popular=True)
            if popular.exists():
                recommended_ids = list(popular.order_by('?')[:3].values_list('id', flat=True))
            else:
                recommended_ids = list(products.order_by('?')[:3].values_list('id', flat=True))
            reply = "NeyMenu AI olarak damak tadınıza uygun bu popüler lezzetleri beğeneceğinizi düşünüyorum. Afiyet olsun! ✨"
            
        return Response({
            'success': True,
            'reply': reply,
            'recommended_product_ids': recommended_ids
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)


from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Count
from orders.models import Order, OrderItem
from django.contrib.auth import get_user_model
User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_analytics(request):
    user = request.user
    if user.role not in [User.RoleChoices.SUPER_ADMIN, User.RoleChoices.RESTAURANT_OWNER, User.RoleChoices.MANAGER]:
        return Response({"error": "Unauthorized"}, status=403)
        
    restaurant = user.restaurant
    if not restaurant:
        return Response({"error": "No restaurant associated with this user"}, status=400)
        
    now = timezone.now()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=today_start.weekday())
    month_start = today_start.replace(day=1)
    
    # Base Queryset for completed/paid orders
    completed_orders = Order.objects.filter(restaurant=restaurant, status__in=['COMPLETED', 'DELIVERED', 'SERVED'])
    
    # Revenue
    daily_revenue = completed_orders.filter(created_at__gte=today_start).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    weekly_revenue = completed_orders.filter(created_at__gte=week_start).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    monthly_revenue = completed_orders.filter(created_at__gte=month_start).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
    
    # Order Counts Today
    orders_today = Order.objects.filter(restaurant=restaurant, created_at__gte=today_start)
    orders_count_today = orders_today.count()
    
    orders_by_type = list(orders_today.values('order_type').annotate(count=Count('id')))
    
    # Top Products All Time (or this month)
    top_products = OrderItem.objects.filter(order__restaurant=restaurant, order__created_at__gte=month_start)\
        .values('product_name_snapshot')\
        .annotate(total_qty=Sum('quantity'), total_revenue=Sum('total_price'))\
        .order_by('-total_qty')[:5]
        
    return Response({
        "revenue": {
            "daily": float(daily_revenue),
            "weekly": float(weekly_revenue),
            "monthly": float(monthly_revenue)
        },
        "orders_today": {
            "total": orders_count_today,
            "by_type": orders_by_type
        },
        "top_products_this_month": list(top_products)
    })
