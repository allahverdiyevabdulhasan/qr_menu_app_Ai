from django.contrib import admin
from .models import InventoryItem, ProductIngredient, StockMovement

@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'restaurant', 'current_quantity', 'unit', 'status')
    list_filter = ('restaurant', 'status', 'unit')
    search_fields = ('name',)

@admin.register(ProductIngredient)
class ProductIngredientAdmin(admin.ModelAdmin):
    list_display = ('product', 'inventory_item', 'quantity_used')

@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ('inventory_item', 'restaurant', 'movement_type', 'quantity', 'created_at')
    list_filter = ('restaurant', 'movement_type')
