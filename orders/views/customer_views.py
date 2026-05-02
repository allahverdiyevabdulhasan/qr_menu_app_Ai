from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.views import View
from django.views.generic import TemplateView, DetailView
from django.contrib import messages
from decimal import Decimal
from menu.models import Product
from restaurants.models import Restaurant
from tables.models import RestaurantTable
from orders.cart import Cart
from orders.models import Order, OrderItem
from customers.services import link_or_create_customer
from campaigns.services import validate_coupon

class CartView(TemplateView):
    template_name = 'orders/customer/cart.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        slug = self.kwargs.get('slug')
        context['restaurant'] = get_object_or_404(Restaurant, slug=slug)
        context['cart'] = Cart(self.request)
        return context

class CartAddView(View):
    def post(self, request, slug, *args, **kwargs):
        cart = Cart(request)
        product = get_object_or_404(Product, pk=request.POST.get('product_id'))
        quantity = int(request.POST.get('quantity', 1))
        options = request.POST.getlist('options') # list of option IDs
        
        cart.add(product=product, quantity=quantity, options=[int(opt) for opt in options])
        messages.success(request, f"{product.name} added to cart.")
        
        # Redirect back to where they came from
        return redirect(request.META.get('HTTP_REFERER', reverse('public_menu', kwargs={'slug': slug})))

class CartUpdateView(View):
    def post(self, request, slug, *args, **kwargs):
        cart = Cart(request)
        item_id = request.POST.get('item_id')
        quantity = int(request.POST.get('quantity', 1))
        
        cart.update(item_id, quantity)
        return redirect('cart_view', slug=slug)

class CartClearView(View):
    def post(self, request, slug, *args, **kwargs):
        cart = Cart(request)
        cart.clear()
        return redirect('cart_view', slug=slug)

class CheckoutView(View):
    def get(self, request, slug, token=None):
        restaurant = get_object_or_404(Restaurant, slug=slug)
        table = None
        if token:
            table = get_object_or_404(RestaurantTable, token=token, restaurant=restaurant)
            
        cart = Cart(request)
        if not cart.cart:
            messages.warning(request, "Your cart is empty.")
            return redirect('public_menu', slug=slug)
            
        return render(request, 'orders/customer/checkout.html', {
            'restaurant': restaurant,
            'table': table,
            'cart': cart
        })

    def post(self, request, slug, token=None):
        restaurant = get_object_or_404(Restaurant, slug=slug)
        table = None
        if token:
            table = get_object_or_404(RestaurantTable, token=token, restaurant=restaurant)
            
        cart = Cart(request)
        if not cart.cart:
            return redirect('public_menu', slug=slug)

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
            order.customer_id = customer_profile.id
            
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
            OrderItem.objects.create(
                order=order,
                product=item['product'],
                product_name_snapshot=item['product'].name,
                quantity=item['quantity'],
                unit_price=item['unit_price'],
                total_price=item['total_price'],
                selected_options=item['options']
            )

        cart.clear()
        
        return redirect('order_success', slug=slug, order_number=order.order_number)

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
        return get_object_or_404(Order, order_number=self.kwargs['order_number'])
