from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.views import View
from django.views.generic import TemplateView, DetailView
from django.contrib import messages
from django.utils.translation import gettext_lazy as _
from decimal import Decimal
from menu.models import Product
from restaurants.models import Restaurant
from tables.models import RestaurantTable
from orders.cart import Cart
from orders.models import Order, OrderItem
from customers.services import link_or_create_customer
from campaigns.services import validate_coupon
from orders.utils import broadcast_order_update

class CartView(TemplateView):
    template_name = 'orders/customer/cart.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        restaurant_slug = self.kwargs.get('restaurant_slug')
        context['restaurant'] = get_object_or_404(Restaurant, slug=restaurant_slug)
        context['cart'] = Cart(self.request)
        return context

class CartAddView(View):
    def post(self, request, restaurant_slug, *args, **kwargs):
        cart = Cart(request)
        product = get_object_or_404(Product, pk=request.POST.get('product_id'))
        quantity = int(request.POST.get('quantity', 1))
        
        options = request.POST.getlist('modifiers') # list of checkbox modifier IDs
        for key in request.POST.keys():
            if key.startswith('modifier_') and key != 'modifiers':
                options.append(request.POST.get(key)) # add radio modifier IDs

        removed_ingredients = request.POST.getlist('removed_ingredients') # list of names
        note = request.POST.get('note', '')
        
        cart.add(
            product=product, 
            quantity=quantity, 
            options=[int(opt) for opt in options],
            removed_ingredients=removed_ingredients,
            note=note
        )
        messages.success(request, f"{product.name} added to cart.")
        
        # Redirect back to where they came from
        return redirect(request.META.get('HTTP_REFERER', reverse('public_menu', kwargs={'restaurant_slug': restaurant_slug})))

class CartAddComboView(View):
    def post(self, request, restaurant_slug, *args, **kwargs):
        cart = Cart(request)
        product_ids = request.POST.getlist('product_ids')
        
        for pid in product_ids:
            try:
                product = get_object_or_404(Product, pk=pid)
                cart.add(
                    product=product, 
                    quantity=1, 
                    options=[],
                    removed_ingredients=[],
                    note=''
                )
            except Exception:
                pass
                
        messages.success(request, _("Combo added to cart successfully."))
        return redirect('cart_view', restaurant_slug=restaurant_slug)

class CartUpdateView(View):
    def post(self, request, restaurant_slug, *args, **kwargs):
        cart = Cart(request)
        item_id = request.POST.get('item_id')
        quantity = int(request.POST.get('quantity', 1))
        
        cart.update(item_id, quantity)
        return redirect('cart_view', restaurant_slug=restaurant_slug)

class CartClearView(View):
    def post(self, request, restaurant_slug, *args, **kwargs):
        cart = Cart(request)
        cart.clear()
        return redirect('cart_view', restaurant_slug=restaurant_slug)

class CheckoutView(View):
    def get(self, request, restaurant_slug, token=None):
        restaurant = get_object_or_404(Restaurant, slug=restaurant_slug)
        table = None
        if token:
            table = get_object_or_404(RestaurantTable, token=token, restaurant=restaurant)
            
        cart = Cart(request)
        if not cart.cart:
            messages.warning(request, "Your cart is empty.")
            return redirect('public_menu', restaurant_slug=restaurant_slug)
            
        return render(request, 'orders/customer/checkout.html', {
            'restaurant': restaurant,
            'table': table,
            'cart': cart
        })

    def post(self, request, restaurant_slug, token=None):
        restaurant = get_object_or_404(Restaurant, slug=restaurant_slug)
        table = None
        if token:
            table = get_object_or_404(RestaurantTable, token=token, restaurant=restaurant)
        else:
            table_id = request.POST.get('table_id')
            if table_id:
                table = get_object_or_404(RestaurantTable, id=table_id, restaurant=restaurant)
            
        cart = Cart(request)
        if not cart.cart:
            return redirect('public_menu', restaurant_slug=restaurant_slug)

        order_type = request.POST.get('order_type', 'DINE_IN')
        note = request.POST.get('note', '')
        customer_name = request.POST.get('customer_name', '')
        customer_phone = request.POST.get('customer_phone', '')
        coupon_code = request.POST.get('coupon_code', '')
        use_loyalty = request.POST.get('use_loyalty_points') == 'true'

        # Calculate totals
        subtotal = cart.get_total_price()
        
        discount_amount = Decimal('0.00')
        
        # 1. Apply Coupon if any
        if coupon_code:
            coupon_res = validate_coupon(coupon_code, subtotal, restaurant)
            if coupon_res.get('success'):
                discount_amount += Decimal(str(coupon_res['discount_amount']))
                
        tax_amount = (subtotal - discount_amount) * Decimal('0.08') # 8% tax
        if tax_amount < 0: tax_amount = Decimal('0.00')
        
        service_charge = (subtotal - discount_amount) * Decimal('0.10') if order_type == 'DINE_IN' else Decimal('0.00')
        if service_charge < 0: service_charge = Decimal('0.00')
        
        total_amount = subtotal - discount_amount + tax_amount + service_charge

        # Create Order
        order = Order.objects.create(
            restaurant=restaurant,
            branch=table.branch if table else None,
            table=table,
            customer=request.user if request.user.is_authenticated else None,
            order_type=order_type,
            status='NEW',
            subtotal=subtotal,
            discount_amount=discount_amount,
            tax_amount=tax_amount,
            service_charge=service_charge,
            total_amount=total_amount,
            note=note
        )

        # Link to Customer Profile & Apply Loyalty
        if customer_phone:
            customer_profile = link_or_create_customer(
                order=order, 
                phone=customer_phone, 
                name=customer_name
            )
            order.customer_profile = customer_profile
            
            # 2. Apply Loyalty Points if requested
            if use_loyalty and customer_profile.loyalty_points > 0:
                from loyalty.models import LoyaltyTransaction
                # Basic mock logic: 10 points = 1 currency
                points_to_use = customer_profile.loyalty_points
                loyalty_discount = Decimal(str(points_to_use / 10.0))
                
                # Prevent negative order total
                if loyalty_discount > order.total_amount:
                    loyalty_discount = order.total_amount
                    points_to_use = int(loyalty_discount * 10)
                
                if loyalty_discount > 0:
                    order.discount_amount += loyalty_discount
                    order.total_amount -= loyalty_discount
                    
                    LoyaltyTransaction.objects.create(
                        restaurant=restaurant,
                        customer=customer_profile,
                        order=order,
                        points=-points_to_use,
                        transaction_type='REDEEM',
                        description=f"Redeemed points on Order #{order.order_number}"
                    )
                    customer_profile.loyalty_points -= points_to_use
                    customer_profile.save()
            
            order.save()

        # Create Order Items
        for item in cart:
            mod_names = [mod.name for mod in item.get('modifier_objects', [])]
            OrderItem.objects.create(
                order=order,
                product=item['product'],
                product_name_snapshot=item['product'].name,
                quantity=item['quantity'],
                unit_price=item['unit_price'],
                snapshot_selling_price=item['product'].price,
                snapshot_cost_price=getattr(item['product'], 'cost_price', None) or Decimal('0.00'),
                total_price=item['total_price'],
                note=item.get('note', ''),
                selected_options={
                    'options': item['options'],
                    'modifier_names': mod_names,
                    'removed_ingredients': item.get('removed_ingredients', [])
                }
            )

        cart.clear()
        
        # Broadcast the new order to the staff panels via WebSockets
        from django.utils.translation import gettext as _
        broadcast_order_update(order, message=_("New order received!"), call_type='new_order')
        
        # WhatsApp Ordering logic
        order_method = request.POST.get('order_method', 'standard')
        if order_method == 'whatsapp' and hasattr(restaurant, 'settings') and restaurant.settings.enable_whatsapp_ordering and restaurant.settings.whatsapp_number:
            import urllib.parse
            items_text = "\\n".join([f"{item.quantity}x {item.product_name_snapshot} - {item.total_price} ₺" for item in order.items.all()])
            text = f"Hello {restaurant.name},\\nI would like to place a new order!\\n\\nOrder #{order.order_number}\\nType: {order.get_order_type_display()}\\nTable: {table.table_number if table else 'N/A'}\\n\\nItems:\\n{items_text}\\n\\nSubtotal: {order.subtotal} ₺\\nDiscount: -{order.discount_amount} ₺\\nTax: {order.tax_amount} ₺\\nService: {order.service_charge} ₺\\n*Total:* {order.total_amount} ₺\\n\\nCustomer: {customer_name}\\nPhone: {customer_phone}\\nNote: {note}"
            encoded_text = urllib.parse.quote(text)
            whatsapp_url = f"https://wa.me/{restaurant.settings.whatsapp_number}?text={encoded_text}"
            return redirect(whatsapp_url)
            
        if order_method == 'online':
            return redirect('order_payment', restaurant_slug=restaurant_slug, order_number=order.order_number)
        
        return redirect('order_success', restaurant_slug=restaurant_slug, order_number=order.order_number)

class OrderPaymentView(TemplateView):
    template_name = 'orders/customer/order_payment.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        order = get_object_or_404(Order, order_number=kwargs['order_number'])
        context['order'] = order
        context['restaurant'] = order.restaurant
        return context


class OrderSuccessView(TemplateView):
    template_name = 'orders/customer/order_success.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['order'] = get_object_or_404(Order, order_number=kwargs['order_number'])
        return context

class OrderTrackingView(DetailView):
    model = Order
    template_name = 'orders/customer/order_tracking.html'
    context_object_name = 'order'
    
    def get_object(self, queryset=None):
        val = self.kwargs['order_number']
        from django.db.models import Q
        return get_object_or_404(Order, Q(order_number=val) | Q(tracking_code=val))

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['restaurant'] = self.get_object().restaurant
        return context
