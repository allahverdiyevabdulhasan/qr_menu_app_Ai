from django.db import models
from django.utils.translation import gettext_lazy as _
from restaurants.models import Restaurant
from accounts.models import User
from customers.models import Customer


class AIRecommendation(models.Model):
    """Stores a budget-based meal recommendation session."""
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='ai_recommendations')
    customer = models.ForeignKey(Customer, on_delete=models.SET_NULL, null=True, blank=True)
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    people_count = models.PositiveIntegerField(default=1)
    preferences = models.TextField(blank=True)
    # Stored as JSON list of product names
    recommended_products = models.JSONField(default=list)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    ai_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Recommendation for {self.restaurant} — budget {self.budget}"


class AIInsight(models.Model):
    """AI-generated business insights surfaced on the owner dashboard."""
    INSIGHT_TYPES = [
        ('SALES', _('Sales')),
        ('STOCK', _('Stock')),
        ('CAMPAIGN', _('Campaign')),
        ('CUSTOMER', _('Customer')),
        ('GENERAL', _('General')),
    ]
    STATUS_CHOICES = [
        ('NEW', _('New')),
        ('READ', _('Read')),
        ('DISMISSED', _('Dismissed')),
    ]
    PRIORITY_CHOICES = [
        ('HIGH', _('High')),
        ('MEDIUM', _('Medium')),
        ('LOW', _('Low')),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='ai_insights')
    insight_type = models.CharField(max_length=20, choices=INSIGHT_TYPES, default='GENERAL')
    title = models.CharField(max_length=255)
    description = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='NEW')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.priority}] {self.title}"


class AIChatMessage(models.Model):
    """Records a manager chat turn (question + AI response)."""
    ROLE_CHOICES = [
        ('user', _('User')),
        ('assistant', _('Assistant')),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='ai_chat_messages')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    message = models.TextField()
    response = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.restaurant} | {self.role}: {self.message[:60]}"
