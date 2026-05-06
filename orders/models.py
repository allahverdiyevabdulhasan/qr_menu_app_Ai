import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from restaurants.models import Restaurant, Branch
from tables.models import RestaurantTable
from menu.models import Product

class Order(models.Model):
    ORDER_TYPE_CHOICES = [
        ('DINE_IN', _('Dine In')),
        ('TAKEAWAY', _('Takeaway')),
        ('PRE_ORDER', _('Pre Order')),
    ]

    STATUS_CHOICES = [
        ('NEW', _('New')),
        ('ACCEPTED', _('Accepted')),
        ('PREPARING', _('Preparing')),
        ('READY', _('Ready')),
        ('SERVED', _('Served')),
        ('COMPLETED', _('Completed')),
        ('CANCELLED', _('Cancelled')),
        ('REFUNDED', _('Refunded')),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('UNPAID', _('Unpaid')),
        ('PAID', _('Paid')),
        ('PARTIAL', _('Partial')),
        ('REFUNDED', _('Refunded')),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='orders')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, related_name='orders', null=True, blank=True)
    table = models.ForeignKey(RestaurantTable, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='customer_orders')
    
    order_number = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES, default='DINE_IN')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NEW')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='UNPAID')
    
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    service_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    note = models.TextField(blank=True)
    estimated_prep_time = models.PositiveIntegerField(null=True, blank=True, help_text=_("Estimated preparation time in minutes"))
    pickup_time = models.DateTimeField(null=True, blank=True)
    
    # User-friendly tracking code (e.g. TRK-A1B2C3)
    tracking_code = models.CharField(max_length=12, unique=True, blank=True, null=True)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_orders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_number}"

    def save(self, *args, **kwargs):
        if not self.tracking_code:
            import random
            import string
            chars = string.ascii_uppercase + string.digits
            code = ''.join(random.choice(chars) for _ in range(6))
            self.tracking_code = f"TRK-{code}"
        super().save(*args, **kwargs)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    product_name_snapshot = models.CharField(max_length=200) # In case product is renamed/deleted later
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2) # Snapshotted price at order time
    snapshot_selling_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    snapshot_cost_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    note = models.TextField(blank=True)
    selected_options = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.quantity}x {self.product_name_snapshot}"

class OrderStageHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history')
    old_status = models.CharField(max_length=20, choices=Order.STATUS_CHOICES, null=True, blank=True)
    new_status = models.CharField(max_length=20, choices=Order.STATUS_CHOICES)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    note = models.TextField(blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Order Stage History")
        verbose_name_plural = _("Order Stage Histories")
        ordering = ['-changed_at']

