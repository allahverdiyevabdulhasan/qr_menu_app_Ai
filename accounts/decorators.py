from django.core.exceptions import PermissionDenied
from django.shortcuts import redirect

def role_required(allowed_roles):
    """
    Decorator that accepts either a list of roles or a single role string.
    Usage:
        @role_required(['MANAGER', 'KITCHEN_STAFF'])
        @method_decorator(role_required(['MANAGER']))
    """
    if isinstance(allowed_roles, str):
        allowed_roles = [allowed_roles]

    def decorator(view_func):
        def _wrapped_view(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return redirect(f'/en/accounts/login/?next={request.path}')
            # Superusers and SUPER_ADMIN role bypass all restrictions
            if request.user.is_superuser or getattr(request.user, 'role', '') == 'SUPER_ADMIN':
                return view_func(request, *args, **kwargs)
            if getattr(request.user, 'role', '') in allowed_roles:
                return view_func(request, *args, **kwargs)
            raise PermissionDenied
        return _wrapped_view
    return decorator

def owner_required(view_func):
    return role_required(['RESTAURANT_OWNER'])(view_func)

def manager_required(view_func):
    return role_required(['RESTAURANT_OWNER', 'MANAGER'])(view_func)

def staff_required(view_func):
    return role_required(['RESTAURANT_OWNER', 'MANAGER', 'WAITER', 'KITCHEN_STAFF', 'CASHIER'])(view_func)
