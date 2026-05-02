from django.contrib import admin
from .models import RestaurantTable

@admin.register(RestaurantTable)
class RestaurantTableAdmin(admin.ModelAdmin):
    list_display = ('table_number', 'restaurant', 'branch', 'status', 'is_active')
    list_filter = ('restaurant', 'branch', 'status', 'is_active')
    search_fields = ('table_number', 'restaurant__name', 'table_name')
    readonly_fields = ('qr_code_image', 'qr_code_url', 'token')
