from orders.cart import Cart

def cart(request):
    try:
        cart_obj = Cart(request)
        return {
            'cart_count': cart_obj.get_total_quantity(),
            'cart_total': cart_obj.get_total_price(),
            'cart': cart_obj
        }
    except Exception:
        return {
            'cart_count': 0,
            'cart_total': 0
        }

def notifications(request):
    if not request.user.is_authenticated:
        return {}
    
    try:
        from tables.models import WaiterCall
        from orders.models import Order
        
        restaurant = getattr(request.user, 'restaurant', None)
        if not restaurant:
            return {}
            
        waiter_calls = WaiterCall.objects.filter(restaurant=restaurant, is_active=True).select_related('table').order_by('-created_at')
        pending_orders = Order.objects.filter(restaurant=restaurant, status='NEW').order_by('-created_at')
        
        total_count = waiter_calls.count() + pending_orders.count()
        
        return {
            'header_waiter_calls': waiter_calls[:5],
            'header_pending_orders': pending_orders[:5],
            'header_notifications_count': total_count,
        }
    except Exception:
        return {
            'header_notifications_count': 0,
        }
