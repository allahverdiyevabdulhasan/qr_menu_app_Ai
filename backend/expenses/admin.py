from django.contrib import admin
from .models import Expense

@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ('title', 'restaurant', 'branch', 'category', 'amount', 'date', 'created_by')
    list_filter = ('restaurant', 'category', 'date')
    search_fields = ('title', 'note')
    date_hierarchy = 'date'
