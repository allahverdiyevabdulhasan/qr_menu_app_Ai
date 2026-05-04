import json
from channels.generic.websocket import AsyncWebsocketConsumer

class OrderConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.restaurant_slug = self.scope['url_route']['kwargs']['slug']
        self.room_group_name = f'orders_{self.restaurant_slug}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from room group
    async def order_status_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'order_status_update',
            'order_id': event.get('order_id'),
            'order_number': event.get('order_number'),
            'status': event.get('status'),
            'message': event.get('message', ''),
            'estimated_prep_time': event.get('estimated_prep_time'),
            'call_type': event.get('call_type', 'status')
        }))

class OrderTrackingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.order_number = self.scope['url_route']['kwargs']['order_number']
        self.room_group_name = f'order_{self.order_number}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from room group
    async def order_status_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'order_status_update',
            'order_id': event.get('order_id'),
            'order_number': event.get('order_number'),
            'status': event.get('status'),
            'message': event.get('message', ''),
            'estimated_prep_time': event.get('estimated_prep_time')
        }))
