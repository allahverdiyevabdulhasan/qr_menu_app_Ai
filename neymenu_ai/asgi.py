import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neymenu_ai.settings')

django_asgi_app = get_asgi_application()

from orders.consumers import OrderConsumer, OrderTrackingConsumer, WaiterCallConsumer

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path("ws/orders/<slug:slug>/", OrderConsumer.as_asgi()),
            path("ws/tracking/<str:order_number>/", OrderTrackingConsumer.as_asgi()),
            path("ws/waiter-calls/<slug:slug>/", WaiterCallConsumer.as_asgi()),
        ])
    ),
})
