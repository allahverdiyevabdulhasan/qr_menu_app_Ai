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
    
    # Cashier Financial Permissions
    can_view_daily_revenue = models.BooleanField(_("Can View Daily Revenue"), default=False)
    can_view_monthly_revenue = models.BooleanField(_("Can View Monthly Revenue"), default=False)
    can_view_yearly_revenue = models.BooleanField(_("Can View Yearly Revenue"), default=False)
    can_view_net_profit = models.BooleanField(_("Can View Net Profit"), default=False)
    can_view_expenses = models.BooleanField(_("Can View Expenses"), default=False)
    can_view_payroll = models.BooleanField(_("Can View Payroll"), default=False)
    can_view_analytics = models.BooleanField(_("Can View Analytics"), default=False)
    
    # Module Access Permissions
    can_view_kitchen_screen = models.BooleanField(_("Can View Kitchen Screen"), default=False)
    can_view_waiter_panel = models.BooleanField(_("Can View Waiter Panel"), default=False)
    can_view_cashier_panel = models.BooleanField(_("Can View Cashier Panel"), default=False)
    can_manage_menu = models.BooleanField(_("Can Manage Menu"), default=False)
    can_manage_inventory = models.BooleanField(_("Can Manage Inventory"), default=False)
    can_manage_customers = models.BooleanField(_("Can Manage Customers"), default=False)
    can_view_ai_reports = models.BooleanField(_("Can View AI Reports"), default=False)
    can_manage_campaigns = models.BooleanField(_("Can Manage Campaigns"), default=False)
    can_view_reviews = models.BooleanField(_("Can View Reviews"), default=False)
    can_manage_settings = models.BooleanField(_("Can Manage Settings"), default=False)
    can_manage_branches = models.BooleanField(_("Can Manage Branches"), default=False)


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
