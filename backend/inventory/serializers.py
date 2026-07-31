from rest_framework import serializers
from .models import InventoryItem, ProductIngredient, StockMovement

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = '__all__'
        read_only_fields = ['restaurant']

class ProductIngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductIngredient
        fields = '__all__'
        read_only_fields = ['restaurant']

class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockMovement
        fields = '__all__'
        read_only_fields = ['restaurant']

