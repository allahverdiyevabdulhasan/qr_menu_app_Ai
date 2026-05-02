from django.contrib.auth.mixins import AccessMixin
from django.core.exceptions import PermissionDenied

class RoleRequiredMixin(AccessMixin):
    allowed_roles = []

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()
        if request.user.is_super_admin or request.user.role in self.allowed_roles:
            return super().dispatch(request, *args, **kwargs)
        raise PermissionDenied

class OwnerRequiredMixin(RoleRequiredMixin):
    allowed_roles = ['RESTAURANT_OWNER']

class ManagerRequiredMixin(RoleRequiredMixin):
    allowed_roles = ['RESTAURANT_OWNER', 'MANAGER']

class StaffRequiredMixin(RoleRequiredMixin):
    allowed_roles = ['RESTAURANT_OWNER', 'MANAGER', 'WAITER', 'KITCHEN_STAFF', 'CASHIER']
