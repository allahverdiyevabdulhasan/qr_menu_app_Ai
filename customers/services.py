from decimal import Decimal
from django.utils import timezone
from .models import Customer

def link_or_create_customer(order, phone=None, email=None, name=None):
    """
    Called when an order is finalized to update or create a customer profile.
    """
    if not phone and not email:
        return None
        
    customer = None
    
    # Try to find by phone first
    if phone:
        customer = Customer.objects.filter(restaurant=order.restaurant, phone=phone).first()
        
    # Then try by email
    if not customer and email:
        customer = Customer.objects.filter(restaurant=order.restaurant, email=email).first()
        
    # Create if doesn't exist
    if not customer:
        customer = Customer(
            restaurant=order.restaurant,
            phone=phone or '',
            email=email or '',
            name=name or ''
        )
    
    # Update stats
    if not customer.name and name:
        customer.name = name
        
    customer.order_count += 1
    customer.total_spent += Decimal(str(order.total_amount))
    customer.last_order_at = timezone.now()
    customer.save()
    
    return customer
