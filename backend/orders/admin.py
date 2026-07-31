from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name_snapshot', 'unit_price', 'total_price', 'selected_options')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'restaurant', 'order_type', 'status', 'payment_status', 'total_amount', 'created_at')
    list_filter = ('restaurant', 'order_type', 'status', 'payment_status', 'created_at')
    search_fields = ('order_number', 'restaurant__name')
    inlines = [OrderItemInline]
    readonly_fields = ('order_number',)
