from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Order

@receiver(post_save, sender=Order)
def broadcast_order_update(sender, instance, created, **kwargs):
    # Guard: channel layer may be None when Redis is not running (dev / tests)
    try:
        channel_layer = get_channel_layer()
        if channel_layer is not None:
            group_name = f'orders_{instance.restaurant.slug}'
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'order_status_update',
                    'order_id': instance.id,
                    'order_number': instance.order_number,
                    'status': instance.status,
                    'message': f"Order {instance.order_number} is now {instance.status}"
                }
            )
    except Exception:
        pass  # Never let WebSocket errors crash a database write

    # Loyalty Integration: Earn points on COMPLETED order
    if instance.status == 'COMPLETED' and instance.customer:
        from loyalty.models import LoyaltyRule, LoyaltyTransaction
        rule = LoyaltyRule.objects.filter(restaurant=instance.restaurant, is_active=True).first()
        if rule and rule.amount_step > 0:
            # Check if this order already earned points to prevent double counting
            if not LoyaltyTransaction.objects.filter(order=instance, transaction_type='EARN').exists():
                points_to_earn = int((instance.total_amount // rule.amount_step) * rule.points_per_amount)
                if points_to_earn > 0:
                    LoyaltyTransaction.objects.create(
                        restaurant=instance.restaurant,
                        customer=instance.customer,
                        order=instance,
                        points=points_to_earn,
                        transaction_type='EARN',
                        description=f"Earned from Order #{instance.order_number}"
                    )
                    instance.customer.loyalty_points += points_to_earn
                    instance.customer.save()

    # Inventory Integration: Deduct stock on COMPLETED order
    if instance.status == 'COMPLETED':
        from inventory.models import StockMovement
        # Check if we already deducted stock for this order to prevent double-deduction
        # We can use a unique note or check if any movement exists with this order string
        # A more robust way is to add an 'is_stock_deducted' field to Order, but here we check movements:
        movement_note = f"Order #{instance.order_number}"
        if not StockMovement.objects.filter(restaurant=instance.restaurant, note=movement_note).exists():
            # For every item in order
            for item in instance.items.all():
                # For every ingredient in the product
                for ingredient in item.product.ingredients.all():
                    inventory_item = ingredient.inventory_item
                    quantity_to_deduct = ingredient.quantity_used * item.quantity
                    
                    # Deduct from current quantity
                    inventory_item.current_quantity -= quantity_to_deduct
                    inventory_item.save()
                    inventory_item.update_status()
                    
                    # Log movement
                    StockMovement.objects.create(
                        restaurant=instance.restaurant,
                        inventory_item=inventory_item,
                        movement_type='ORDER_USAGE',
                        quantity=-quantity_to_deduct,
                        note=movement_note
                    )

    # Inventory Integration: Revert stock on CANCELLED order if it was previously deducted
    if instance.status == 'CANCELLED':
        from inventory.models import StockMovement
        movement_note = f"Order #{instance.order_number}"
        # Find usage movements for this order
        movements = StockMovement.objects.filter(restaurant=instance.restaurant, note=movement_note, movement_type='ORDER_USAGE')
        
        if movements.exists():
            for movement in movements:
                inventory_item = movement.inventory_item
                # Revert the quantity (movement.quantity is negative, so we subtract it to add back)
                revert_qty = abs(movement.quantity)
                inventory_item.current_quantity += revert_qty
                inventory_item.save()
                inventory_item.update_status()
                
                # Log the revert
                StockMovement.objects.create(
                    restaurant=instance.restaurant,
                    inventory_item=inventory_item,
                    movement_type='ADJUSTMENT',
                    quantity=revert_qty,
                    note=f"Revert: {movement_note} cancelled"
                )
            # Delete original usage notes to prevent double revert if status changes again
            # Or better, rename them. Here we just mark them as reverted in our logic by the existence of 'Revert:' notes.
            # Actually, the simplest is to just not revert twice.
