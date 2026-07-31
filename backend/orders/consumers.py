import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser

class OrderConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Authenticate user from scope if possible (e.g., using a token middleware)
        # For now, let's accept and join a room based on the restaurant slug
        self.restaurant_slug = self.scope['url_route']['kwargs']['restaurant_slug']
        self.room_group_name = f'restaurant_{self.restaurant_slug}_orders'

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

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')

        if action == 'ping':
            await self.send(text_data=json.dumps({
                'message': 'pong'
            }))

    # Receive message from room group
    async def order_update(self, event):
        order_data = event['order_data']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'action': 'order_update',
            'order': order_data
        }))
