from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import InventoryItem, ProductIngredient, StockMovement
from .serializers import InventoryItemSerializer, ProductIngredientSerializer, StockMovementSerializer

class InventoryItemViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return InventoryItem.objects.all()

class ProductIngredientViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = ProductIngredientSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return ProductIngredient.objects.all()

class StockMovementViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return StockMovement.objects.all()

