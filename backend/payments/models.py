from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from orders.models import Order
from restaurants.models import Restaurant
from django.db.models.signals import post_save
from django.dispatch import receiver

class ZReport(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='z_reports')
    staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='z_reports')
    z_number = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    
    # Financial details
    gross_sales = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_tax = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    net_sales = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Payment method breakdown
    cash_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    card_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    meal_card_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    online_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Stats
    completed_orders_count = models.PositiveIntegerField(default=0)
    cancelled_orders_count = models.PositiveIntegerField(default=0)
    
    # Category and product breakdowns
    category_sales = models.JSONField(default=dict, blank=True)
    product_sales = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-z_number']
        unique_together = ('restaurant', 'z_number')

    def __str__(self):
        return f"Z-{self.z_number} ({self.restaurant.name}) - {self.created_at.strftime('%d.%m.%Y')}"

class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('CASH', _('Cash')),
        ('CARD', _('Card')),
        ('ONLINE', _('Online')),
        ('LOYALTY_POINTS', _('Loyalty Points')),
        ('MEAL_CARD', _('Meal Card')),
    ]

    STATUS_CHOICES = [
        ('PENDING', _('Pending')),
        ('PAID', _('Paid')),
        ('FAILED', _('Failed')),
        ('REFUNDED', _('Refunded')),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='payments')
    z_report = models.ForeignKey(ZReport, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment for Order {self.order.order_number} - {self.amount}"

@receiver(post_save, sender=Payment)
def update_order_payment_status(sender, instance, created, **kwargs):
    order = instance.order
    # Recalculate total paid
    total_paid = sum(p.amount for p in order.payments.filter(status='PAID'))
    
    if total_paid >= order.total_amount:
        order.payment_status = 'PAID'
    elif total_paid > 0:
        order.payment_status = 'PARTIAL'
    elif instance.status == 'REFUNDED':
        order.payment_status = 'REFUNDED'
    else:
        order.payment_status = 'UNPAID'
        
    order.save()
