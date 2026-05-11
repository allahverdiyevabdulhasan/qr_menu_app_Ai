from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta
from restaurants.models import Restaurant

class Customer(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='customers')
    name = models.CharField(_("Name"), max_length=200, blank=True)
    phone = models.CharField(_("Phone"), max_length=50, blank=True)
    email = models.EmailField(_("Email"), blank=True)
    birth_date = models.DateField(_("Birth Date"), null=True, blank=True)
    preferred_language = models.CharField(_("Preferred Language"), max_length=10, blank=True)
    
    loyalty_points = models.IntegerField(_("Loyalty Points"), default=0)
    total_spent = models.DecimalField(_("Total Spent"), max_digits=12, decimal_places=2, default=0)
    order_count = models.IntegerField(_("Order Count"), default=0)
    last_order_at = models.DateTimeField(_("Last Order Date"), null=True, blank=True)
    
    notes = models.TextField(_("Notes"), blank=True)
    
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    class Meta:
        ordering = ['-last_order_at', '-created_at']
        unique_together = ('restaurant', 'phone', 'email') # Roughly unique. In reality, one might be empty.

    def __str__(self):
        return self.name or self.phone or self.email or "Unknown Customer"

    @property
    def full_name(self):
        return self.name or self.phone or self.email or "Unknown Customer"

    def get_segment(self):
        """
        Calculates customer segment dynamically.
        - New: First order within last 30 days
        - Repeat: > 1 order, last order within 60 days
        - VIP: > 10 orders or total_spent > 500
        - Inactive: No orders in last 60 days
        """
        now = timezone.now()
        
        if self.order_count == 0:
            return "No Orders"
            
        days_since_last_order = (now - self.last_order_at).days if self.last_order_at else 999
        
        if self.order_count > 10 or self.total_spent > 500:
            return "VIP"
            
        if days_since_last_order > 60:
            return "Inactive"
            
        if self.order_count > 1:
            return "Repeat"
            
        if self.order_count == 1 and days_since_last_order <= 30:
            return "New"
            
        return "Standard"
