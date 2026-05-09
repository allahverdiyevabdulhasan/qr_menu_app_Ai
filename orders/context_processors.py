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
