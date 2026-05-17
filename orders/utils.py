from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .models import OrderStageHistory

def broadcast_order_update(order, message=None, call_type='status'):
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f'orders_{order.restaurant.slug}',
        {
            'type': 'order_status_update',
            'order_id': order.id,
            'order_number': str(order.order_number),
            'status': order.status,
            'message': message or f"Order {str(order.order_number)} updated to {order.get_status_display()}",
            'estimated_prep_time': order.estimated_prep_time,
            'call_type': call_type
        }
    )
    # Also broadcast to tracking page
    async_to_sync(channel_layer.group_send)(
        f'order_{str(order.order_number)}',
        {
            'type': 'order_status_update',
            'order_id': order.id,
            'order_number': str(order.order_number),
            'status': order.status,
            'message': message,
            'estimated_prep_time': order.estimated_prep_time
        }
    )

def log_order_status_change(order, old_status, new_status, user=None, note=''):
    OrderStageHistory.objects.create(
        order=order,
        old_status=old_status,
        new_status=new_status,
        changed_by=user,
        note=note
    )

def broadcast_staff_alert(restaurant, table, alert_type='waiter_call'):
    channel_layer = get_channel_layer()
    message_map = {
        'waiter_call': f"Waiter called at Table {table.table_number}",
        'bill_request': f"Bill requested at Table {table.table_number}"
    }
    async_to_sync(channel_layer.group_send)(
        f'orders_{restaurant.slug}',
        {
            'type': 'order_status_update',
            'call_type': alert_type,
            'table_number': table.table_number,
            'message': message_map.get(alert_type, "New Alert")
        }
    )

def broadcast_waiter_call(restaurant, table):
    broadcast_staff_alert(restaurant, table, 'waiter_call')
