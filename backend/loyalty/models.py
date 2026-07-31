from django.db import models
from django.utils.translation import gettext_lazy as _
from restaurants.models import Restaurant
from customers.models import Customer
from orders.models import Order
from menu.models import Product

class LoyaltyRule(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='loyalty_rules')
    points_per_amount = models.IntegerField(_("Points Earned"), default=1)
    amount_step = models.DecimalField(_("Per Amount Spent"), max_digits=10, decimal_places=2, default=10.00)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.points_per_amount} pts per {self.amount_step} spent"

class LoyaltyTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('EARN', _('Earn')),
        ('REDEEM', _('Redeem')),
        ('BONUS', _('Bonus')),
        ('EXPIRE', _('Expire')),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='loyalty_transactions')
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    
    points = models.IntegerField() # Can be negative for REDEEM/EXPIRE
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.customer.name} - {self.points} ({self.transaction_type})"

class LoyaltyReward(models.Model):
    REWARD_TYPES = [
        ('DISCOUNT', _('Discount Amount')),
        ('FREE_PRODUCT', _('Free Product')),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='loyalty_rewards')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    required_points = models.IntegerField()
    reward_type = models.CharField(max_length=20, choices=REWARD_TYPES)
    
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    free_product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title} ({self.required_points} pts)"

class CustomerLevel(models.Model):
    LEVEL_CHOICES = [
        ('NEW', _('New')),
        ('REGULAR', _('Regular')),
        ('SILVER', _('Silver')),
        ('GOLD', _('Gold')),
        ('VIP', _('VIP')),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='customer_levels')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, unique=True)
    min_points = models.IntegerField(default=0)
    min_spend = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    min_orders = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['min_points', 'min_spend']

    def __str__(self):
        return f"{self.restaurant.name} - {self.get_level_display()}"
