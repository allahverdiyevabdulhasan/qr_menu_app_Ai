from django.db import models
from django.utils.translation import gettext_lazy as _
from restaurants.models import Restaurant
from menu.models import Product

class InventoryItem(models.Model):
    UNIT_CHOICES = [
        ('KG', _('Kilogram')),
        ('GR', _('Gram')),
        ('LITER', _('Liter')),
        ('ML', _('Milliliter')),
        ('PIECE', _('Piece')),
        ('PACKAGE', _('Package')),
    ]

    STATUS_CHOICES = [
        ('IN_STOCK', _('In Stock')),
        ('LOW_STOCK', _('Low Stock')),
        ('OUT_OF_STOCK', _('Out of Stock')),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='inventory_items')
    name = models.CharField(max_length=200)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES)
    
    current_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    minimum_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    supplier_name = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='IN_STOCK')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.current_quantity} {self.get_unit_display()})"

    def update_status(self):
        if self.current_quantity <= 0:
            self.status = 'OUT_OF_STOCK'
        elif self.current_quantity <= self.minimum_quantity:
            self.status = 'LOW_STOCK'
        else:
            self.status = 'IN_STOCK'
        self.save()

class ProductIngredient(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='ingredients')
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='used_in')
    quantity_used = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity_used} {self.inventory_item.get_unit_display()} of {self.inventory_item.name} for {self.product.name}"

class StockMovement(models.Model):
    MOVEMENT_TYPES = [
        ('IN', _('Stock In')),
        ('OUT', _('Stock Out')),
        ('ADJUSTMENT', _('Adjustment')),
        ('ORDER_USAGE', _('Order Usage')),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='stock_movements')
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE, related_name='movements')
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.DecimalField(max_digits=10, decimal_places=2) # Positive for IN, Negative for OUT/USAGE
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.movement_type} {self.quantity} for {self.inventory_item.name}"
