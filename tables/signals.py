from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import WaiterCall, TableReservation

@receiver(post_save, sender=WaiterCall)
def broadcast_waiter_call(sender, instance, created, **kwargs):
    if created and instance.is_active:
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                group_name = f'orders_{instance.restaurant.slug}'
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        'type': 'order_status_update',
                        'message': f"🛎️ Table {instance.table.table_number} is calling for a waiter!",
                        'call_type': 'waiter_call'
                    }
                )
        except Exception:
            pass

@receiver(post_save, sender=TableReservation)
def broadcast_reservation(sender, instance, created, **kwargs):
    if created:
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                group_name = f'orders_{instance.restaurant.slug}'
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        'type': 'order_status_update',
                        'message': f"📅 New reservation from {instance.customer_name}!",
                        'call_type': 'reservation'
                    }
                )
        except Exception:
            pass
