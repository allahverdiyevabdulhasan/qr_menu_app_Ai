from django.contrib import admin
from .models import Restaurant, Branch, RestaurantSettings

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'status', 'subscription_plan', 'created_at')
    search_fields = ('name', 'owner__username', 'email')
    list_filter = ('status', 'subscription_plan')

@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ('name', 'restaurant', 'manager', 'status', 'created_at')
    search_fields = ('name', 'restaurant__name', 'manager__username')
    list_filter = ('status',)

@admin.register(RestaurantSettings)
class RestaurantSettingsAdmin(admin.ModelAdmin):
    list_display = ('restaurant', 'allow_dine_in_orders', 'allow_takeaway_orders')
