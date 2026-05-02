from django.db import models
from django.utils.translation import gettext_lazy as _
from orders.models import Order
from restaurants.models import Restaurant
from django.db.models.signals import post_save
from django.dispatch import receiver

class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('CASH', _('Cash')),
        ('CARD', _('Card')),
        ('ONLINE', _('Online')),
        ('LOYALTY_POINTS', _('Loyalty Points')),
    ]

    STATUS_CHOICES = [
        ('PENDING', _('Pending')),
        ('PAID', _('Paid')),
        ('FAILED', _('Failed')),
        ('REFUNDED', _('Refunded')),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='payments')
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
