import json
from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Order

@receiver(post_save, sender=Order)
def order_saved(sender, instance, created, **kwargs):
    channel_layer = get_channel_layer()
    room_group_name = f'restaurant_{instance.restaurant.slug}_orders'
    
    order_data = {
        'id': instance.id,
        'order_number': instance.order_number,
        'status': instance.status,
        'order_type': instance.order_type,
        'total_amount': float(instance.total_amount),
        'created_at': instance.created_at.isoformat(),
        'table': instance.table.table_number if instance.table else getattr(instance, 'note', '')
    }
    
    try:
        async_to_sync(channel_layer.group_send)(
            room_group_name,
            {
                'type': 'order_update',
                'order_data': order_data
            }
        )
    except Exception as e:
        print(f"Failed to send order update to channels: {e}")

    # Automatic Stock Deduction
    if instance.status == 'COMPLETED' and not instance.stock_deducted:
        from inventory.models import StockMovement
        for item in instance.items.all():
            if not item.product:
                continue
            for ingredient in item.product.ingredients.select_related('inventory_item'):
                usage = ingredient.quantity_used * item.quantity
                inv_item = ingredient.inventory_item
                inv_item.current_quantity -= usage
                inv_item.save(update_fields=['current_quantity'])
                inv_item.update_status()
                
                StockMovement.objects.create(
                    restaurant=instance.restaurant,
                    inventory_item=inv_item,
                    movement_type='ORDER_USAGE',
                    quantity=-usage,
                    note=f"Order #{instance.order_number}"
                )
        
        instance.stock_deducted = True
        instance.save(update_fields=['stock_deducted'])

    # Automatic Loyalty Points Calculation
    if instance.status == 'COMPLETED' and instance.customer_profile:
        from loyalty.models import LoyaltyRule, LoyaltyTransaction
        import math
        
        # Check if points were already calculated for this order to prevent double counting
        if not LoyaltyTransaction.objects.filter(order=instance, transaction_type='EARN').exists():
            active_rule = LoyaltyRule.objects.filter(restaurant=instance.restaurant, is_active=True).first()
            if active_rule and active_rule.amount_step > 0:
                steps = math.floor(float(instance.total_amount) / float(active_rule.amount_step))
                earned_points = steps * active_rule.points_per_amount
                
                if earned_points > 0:
                    # Create transaction
                    LoyaltyTransaction.objects.create(
                        restaurant=instance.restaurant,
                        customer=instance.customer_profile,
                        order=instance,
                        points=earned_points,
                        transaction_type='EARN',
                        description=f"Sifariş #{instance.order_number} üzrə xal qazancı"
                    )
                    
                    # Update customer balance
                    instance.customer_profile.points_balance += earned_points
                    instance.customer_profile.total_spent += instance.total_amount
                    instance.customer_profile.save(update_fields=['points_balance', 'total_spent'])

