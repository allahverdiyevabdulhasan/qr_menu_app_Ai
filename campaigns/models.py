from django.db import models
from django.utils.translation import gettext_lazy as _
from restaurants.models import Restaurant
import uuid

class Campaign(models.Model):
    CAMPAIGN_TYPES = [
        ('PERCENT_DISCOUNT', _('Percent Discount')),
        ('FIXED_DISCOUNT', _('Fixed Discount')),
        ('COMBO', _('Combo Offer')),
        ('TIME_BASED', _('Time Based')),
        ('FIRST_ORDER', _('First Order')),
        ('STUDENT', _('Student')),
        ('TAKEAWAY', _('Takeaway')),
        ('BIRTHDAY', _('Birthday')),
        ('AI_SUGGESTED', _('AI Suggested')),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='campaigns')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    campaign_type = models.CharField(max_length=50, choices=CAMPAIGN_TYPES)
    
    # Can be percentage or fixed amount
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.get_campaign_type_display()})"

class Coupon(models.Model):
    DISCOUNT_TYPES = [
        ('PERCENT', _('Percent')),
        ('FIXED', _('Fixed Amount')),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='coupons')
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    
    usage_limit = models.IntegerField(default=100)
    used_count = models.IntegerField(default=0)
    
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} - {self.discount_value} {self.get_discount_type_display()}"
