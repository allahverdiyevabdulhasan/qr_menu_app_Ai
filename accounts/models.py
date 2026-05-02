from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    class RoleChoices(models.TextChoices):
        SUPER_ADMIN = 'SUPER_ADMIN', _('Super Admin')
        RESTAURANT_OWNER = 'RESTAURANT_OWNER', _('Restaurant Owner')
        MANAGER = 'MANAGER', _('Manager')
        WAITER = 'WAITER', _('Waiter')
        KITCHEN_STAFF = 'KITCHEN_STAFF', _('Kitchen Staff')
        CASHIER = 'CASHIER', _('Cashier')
        CUSTOMER = 'CUSTOMER', _('Customer')

    role = models.CharField(_("Role"), max_length=20, choices=RoleChoices.choices, default=RoleChoices.CUSTOMER)
    phone = models.CharField(_("Phone"), max_length=20, blank=True, null=True)
    restaurant = models.ForeignKey('restaurants.Restaurant', on_delete=models.CASCADE, null=True, blank=True, related_name='staff', verbose_name=_("Restaurant"))
    branch = models.ForeignKey('restaurants.Branch', on_delete=models.CASCADE, null=True, blank=True, related_name='staff', verbose_name=_("Branch"))
    avatar = models.ImageField(_("Avatar"), upload_to='avatars/', blank=True, null=True)
    is_verified = models.BooleanField(_("Is Verified"), default=False)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    @property
    def is_super_admin(self):
        return self.role == self.RoleChoices.SUPER_ADMIN or self.is_superuser

    @property
    def is_owner(self):
        return self.role == self.RoleChoices.RESTAURANT_OWNER

    @property
    def is_manager(self):
        return self.role == self.RoleChoices.MANAGER

    @property
    def is_waiter(self):
        return self.role == self.RoleChoices.WAITER

    @property
    def is_kitchen(self):
        return self.role == self.RoleChoices.KITCHEN_STAFF

    @property
    def is_cashier(self):
        return self.role == self.RoleChoices.CASHIER

    @property
    def is_customer(self):
        return self.role == self.RoleChoices.CUSTOMER

    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
