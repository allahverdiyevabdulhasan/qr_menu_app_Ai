from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Order, OrderItem, OrderStageHistory
from .serializers import OrderSerializer, OrderItemSerializer, OrderStageHistorySerializer

class OrderViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Order.objects.all()

class OrderItemViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return OrderItem.objects.all()

class OrderStageHistoryViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = OrderStageHistorySerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return OrderStageHistory.objects.all()

