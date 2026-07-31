from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from .models import InventoryItem, ProductIngredient, StockMovement
from .serializers import InventoryItemSerializer, ProductIngredientSerializer, StockMovementSerializer

class InventoryItemViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer

class ProductIngredientViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = ProductIngredient.objects.all()
    serializer_class = ProductIngredientSerializer

class StockMovementViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
