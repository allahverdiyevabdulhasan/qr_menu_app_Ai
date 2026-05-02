from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'phone', 'restaurant', 'branch', 'avatar', 'is_verified')}),
    )
    list_display = UserAdmin.list_display + ('role', 'phone', 'restaurant', 'branch', 'is_verified')
    list_filter = UserAdmin.list_filter + ('role', 'is_verified', 'restaurant')
