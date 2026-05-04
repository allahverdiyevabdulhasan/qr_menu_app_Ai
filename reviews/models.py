from django.db import models
from django.utils.translation import gettext_lazy as _
from restaurants.models import Restaurant
from customers.models import Customer
from orders.models import Order

class Review(models.Model):
    SENTIMENT_CHOICES = [
        ('POSITIVE', _('Positive')),
        ('NEUTRAL', _('Neutral')),
        ('NEGATIVE', _('Negative')),
        ('PENDING', _('Pending AI Analysis')),
    ]

    CATEGORY_CHOICES = [
        ('TASTE', _('Taste')),
        ('PRICE', _('Price')),
        ('DELAY', _('Delay')),
        ('SERVICE', _('Service')),
        ('CLEANLINESS', _('Cleanliness')),
        ('PORTION', _('Portion')),
        ('PACKAGING', _('Packaging')),
        ('STAFF', _('Staff')),
        ('GENERAL', _('General')),
        ('PENDING', _('Pending AI Analysis')),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='reviews')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, related_name='reviews')
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, related_name='reviews')
    
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    
    # Sub-ratings (1-5)
    taste_rating = models.IntegerField(null=True, blank=True)
    service_rating = models.IntegerField(null=True, blank=True)
    speed_rating = models.IntegerField(null=True, blank=True)
    price_rating = models.IntegerField(null=True, blank=True)
    
    # AI Enrichment fields
    ai_sentiment = models.CharField(max_length=20, choices=SENTIMENT_CHOICES, default='PENDING')
    ai_category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='PENDING')
    ai_summary = models.CharField(max_length=255, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review by {self.customer} - {self.rating} stars"

class ProductReview(models.Model):
    product = models.ForeignKey('menu.Product', on_delete=models.CASCADE, related_name='reviews')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, related_name='product_reviews')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.name} - {self.rating} stars"
