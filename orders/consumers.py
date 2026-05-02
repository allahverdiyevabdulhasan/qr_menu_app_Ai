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
            'order_id': event['order_id'],
            'order_number': event['order_number'],
            'status': event['status'],
            'message': event.get('message', '')
        }))
