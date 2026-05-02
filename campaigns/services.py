from django.utils import timezone
from .models import Coupon

def validate_coupon(code, cart_total, restaurant):
    """
    Validates a coupon code and returns the discount amount or an error message.
    """
    try:
        coupon = Coupon.objects.get(code__iexact=code, restaurant=restaurant, is_active=True)
    except Coupon.DoesNotExist:
        return {'success': False, 'message': 'Invalid or inactive coupon code.'}

    now = timezone.now()
    if now < coupon.start_date or now > coupon.end_date:
        return {'success': False, 'message': 'Coupon is expired or not yet active.'}
        
    if coupon.used_count >= coupon.usage_limit:
        return {'success': False, 'message': 'Coupon usage limit reached.'}

    # Calculate discount
    discount_amount = 0
    if coupon.discount_type == 'PERCENT':
        discount_amount = (cart_total * coupon.discount_value) / 100
    else:
        discount_amount = coupon.discount_value
        
    # Prevent discount from exceeding cart total
    if discount_amount > cart_total:
        discount_amount = cart_total
        
    return {
        'success': True,
        'discount_amount': discount_amount,
        'coupon_id': coupon.id,
        'message': 'Coupon applied successfully!'
    }
