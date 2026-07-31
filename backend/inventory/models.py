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
    name = models.CharField(_("Name"), max_length=200)
    unit = models.CharField(_("Unit"), max_length=20, choices=UNIT_CHOICES)
    
    current_quantity = models.DecimalField(_("Current Quantity"), max_digits=10, decimal_places=2, default=0.00)
    minimum_quantity = models.DecimalField(_("Minimum Quantity"), max_digits=10, decimal_places=2, default=0.00)
    cost_per_unit = models.DecimalField(_("Cost per Unit"), max_digits=10, decimal_places=2, default=0.00)
    
    supplier_name = models.CharField(_("Supplier Name"), max_length=200, blank=True)
    status = models.CharField(_("Status"), max_length=20, choices=STATUS_CHOICES, default='IN_STOCK')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.current_quantity} {self.get_unit_display()})"

    def save(self, *args, **kwargs):
        if self.current_quantity <= 0:
            self.status = 'OUT_OF_STOCK'
        elif self.current_quantity <= self.minimum_quantity:
            self.status = 'LOW_STOCK'
        else:
            self.status = 'IN_STOCK'
        super().save(*args, **kwargs)

    def update_status(self):
        self.save()
        # Autonomous Integration: Update stock status of products using this ingredient
        for usage in self.used_in.select_related('product'):
            product = usage.product
            # Check status of all ingredients for this product
            any_out = any(ing.inventory_item.current_quantity <= 0 for ing in product.ingredients.all())
            any_low = any(ing.inventory_item.current_quantity <= ing.inventory_item.minimum_quantity for ing in product.ingredients.all())
            
            if any_out:
                new_status = 'out_of_stock'
            elif any_low:
                new_status = 'low_stock'
            else:
                new_status = 'in_stock'
                
            if product.stock_status != new_status:
                product.stock_status = new_status
                product.save(update_fields=['stock_status'])

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
