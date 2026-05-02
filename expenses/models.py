from django.db import models
from django.utils.translation import gettext_lazy as _
from restaurants.models import Restaurant, Branch
from accounts.models import User
from django.utils import timezone

class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('INGREDIENT', _('Ingredient & Raw Material')),
        ('SALARY', _('Salary & Payroll')),
        ('RENT', _('Rent & Lease')),
        ('UTILITY', _('Utility (Water, Gas, Electricity)')),
        ('PACKAGING', _('Packaging Materials')),
        ('TAX', _('Taxes & Fees')),
        ('MARKETING', _('Marketing & Ads')),
        ('MAINTENANCE', _('Maintenance & Repairs')),
        ('OTHER', _('Other')),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='expenses')
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='expenses')
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(default=timezone.now)
    note = models.TextField(blank=True)
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.amount} ({self.get_category_display()})"
