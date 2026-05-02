from django.contrib import admin
from .models import Campaign, Coupon

@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('title', 'restaurant', 'campaign_type', 'is_active', 'start_date', 'end_date')
    list_filter = ('restaurant', 'campaign_type', 'is_active')

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'restaurant', 'discount_type', 'discount_value', 'is_active')
    list_filter = ('restaurant', 'is_active')
