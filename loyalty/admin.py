from django.contrib import admin
from .models import LoyaltyRule, LoyaltyReward, LoyaltyTransaction, CustomerLevel

@admin.register(LoyaltyRule)
class LoyaltyRuleAdmin(admin.ModelAdmin):
    list_display = ('restaurant', 'points_per_amount', 'amount_step', 'is_active')

@admin.register(LoyaltyReward)
class LoyaltyRewardAdmin(admin.ModelAdmin):
    list_display = ('title', 'restaurant', 'required_points', 'reward_type', 'is_active')

@admin.register(LoyaltyTransaction)
class LoyaltyTransactionAdmin(admin.ModelAdmin):
    list_display = ('customer', 'restaurant', 'points', 'transaction_type', 'created_at')

@admin.register(CustomerLevel)
class CustomerLevelAdmin(admin.ModelAdmin):
    list_display = ('restaurant', 'level', 'min_points', 'min_spend')
