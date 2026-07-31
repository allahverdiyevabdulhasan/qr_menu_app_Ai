from rest_framework import permissions

def check_module_enabled(user, module_field):
    if getattr(user, 'is_superuser', False) or getattr(user, 'is_super_admin', False):
        return True
    
    if not hasattr(user, 'restaurant') or not user.restaurant:
        return False
        
    settings = getattr(user.restaurant, 'settings', None)
    if not settings:
        return False
        
    return getattr(settings, module_field, False)

class IsAIEnabled(permissions.BasePermission):
    def has_permission(self, request, view):
        return check_module_enabled(request.user, 'enable_ai_reports') or check_module_enabled(request.user, 'enable_ai_assistant')

class IsCampaignsEnabled(permissions.BasePermission):
    def has_permission(self, request, view):
        return check_module_enabled(request.user, 'enable_marketing_campaigns')

class IsInventoryEnabled(permissions.BasePermission):
    def has_permission(self, request, view):
        return check_module_enabled(request.user, 'enable_inventory_stock')

class IsFinanceEnabled(permissions.BasePermission):
    def has_permission(self, request, view):
        return check_module_enabled(request.user, 'enable_finance_expenses')

class IsHREnabled(permissions.BasePermission):
    def has_permission(self, request, view):
        return check_module_enabled(request.user, 'enable_hr_shifts')
