from django.db import models
from django.utils.translation import gettext_lazy as _
from restaurants.models import Restaurant

class Plan(models.Model):
    name = models.CharField(_("Name"), max_length=100)
    description = models.TextField(_("Description"), blank=True)
    price = models.DecimalField(_("Monthly Price"), max_digits=10, decimal_places=2)
    
    # Features (booleans for simplicity)
    max_branches = models.IntegerField(_("Max Branches"), default=1)
    max_tables = models.IntegerField(_("Max Tables"), default=10)
    has_ai_features = models.BooleanField(_("AI Features"), default=False)
    has_inventory = models.BooleanField(_("Inventory Management"), default=False)
    has_crm = models.BooleanField(_("CRM & Loyalty"), default=False)
    
    is_active = models.BooleanField(_("Is Active"), default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Subscription(models.Model):
    STATUS_CHOICES = [
        ('ACTIVE', _('Active')),
        ('EXPIRED', _('Expired')),
        ('CANCELLED', _('Cancelled')),
        ('TRIAL', _('Trial')),
    ]

    restaurant = models.OneToOneField(Restaurant, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, related_name='subscriptions')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='TRIAL')
    start_date = models.DateField()
    end_date = models.DateField()
    
    auto_renew = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.restaurant.name} - {self.plan.name} ({self.status})"

    @property
    def is_valid(self):
        from django.utils import timezone
        return self.status in ['ACTIVE', 'TRIAL'] and self.end_date >= timezone.now().date()
