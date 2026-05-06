from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class Restaurant(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_restaurants', verbose_name=_("Owner"))
    name = models.CharField(_("Name"), max_length=255)
    slug = models.SlugField(_("Slug"), unique=True, max_length=255)
    logo = models.ImageField(_("Logo"), upload_to='restaurant_logos/', blank=True, null=True)
    description = models.TextField(_("Description"), blank=True)
    address = models.TextField(_("Address"))
    phone = models.CharField(_("Phone"), max_length=20)
    email = models.EmailField(_("Email"))
    tax_number = models.CharField(_("Tax Number"), max_length=50, blank=True)
    default_language = models.CharField(_("Default Language"), max_length=10, default='en')
    currency = models.CharField(_("Currency"), max_length=10, default='USD')
    opening_hours = models.JSONField(_("Opening Hours"), default=dict, blank=True)
    status = models.CharField(_("Status"), max_length=20, choices=[('active', _('Active')), ('inactive', _('Inactive'))], default='active')
    subscription_plan = models.CharField(_("Subscription Plan"), max_length=50, default='free')
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    class Meta:
        verbose_name = _('Restaurant')
        verbose_name_plural = _('Restaurants')

    def __str__(self):
        return self.name

class Branch(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='branches', verbose_name=_("Restaurant"))
    name = models.CharField(_("Name"), max_length=255)
    address = models.TextField(_("Address"))
    phone = models.CharField(_("Phone"), max_length=20)
    manager = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_branches', verbose_name=_("Manager"))
    status = models.CharField(_("Status"), max_length=20, choices=[('active', _('Active')), ('inactive', _('Inactive'))], default='active')
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    class Meta:
        verbose_name = _('Branch')
        verbose_name_plural = _('Branches')

    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"

class RestaurantSettings(models.Model):
    restaurant = models.OneToOneField(Restaurant, on_delete=models.CASCADE, related_name='settings', verbose_name=_("Restaurant"))
    allow_dine_in_orders = models.BooleanField(_("Allow Dine-in Orders"), default=True)
    allow_takeaway_orders = models.BooleanField(_("Allow Takeaway Orders"), default=True)
    allow_pre_orders = models.BooleanField(_("Allow Pre-orders"), default=False)
    allow_ai_recommendations = models.BooleanField(_("Allow AI Recommendations"), default=True)
    allow_loyalty = models.BooleanField(_("Allow Loyalty Program"), default=False)
    allow_reviews = models.BooleanField(_("Allow Reviews"), default=True)
    service_charge_percent = models.DecimalField(_("Service Charge Percent"), max_digits=5, decimal_places=2, default=0)
    tax_percent = models.DecimalField(_("Tax Percent"), max_digits=5, decimal_places=2, default=0)
    average_preparation_time = models.IntegerField(_("Average Preparation Time (mins)"), default=15)
    theme_color = models.CharField(_("Theme Color"), max_length=7, default='#000000')
    show_calories = models.BooleanField(_("Show Calories"), default=False)
    show_allergens = models.BooleanField(_("Show Allergens"), default=True)
    
    # WhatsApp Ordering
    enable_whatsapp_ordering = models.BooleanField(_("Enable WhatsApp Ordering"), default=False)
    whatsapp_number = models.CharField(_("WhatsApp Number"), max_length=20, blank=True, help_text=_("Include country code, e.g. +90555..."))
    
    # Payment Gateways
    enable_stripe = models.BooleanField(_("Enable Stripe"), default=False)
    stripe_public_key = models.CharField(_("Stripe Public Key"), max_length=255, blank=True)
    stripe_secret_key = models.CharField(_("Stripe Secret Key"), max_length=255, blank=True)
    
    enable_paypal = models.BooleanField(_("Enable PayPal"), default=False)
    paypal_client_id = models.CharField(_("PayPal Client ID"), max_length=255, blank=True)
    
    class Meta:
        verbose_name = _('Restaurant Settings')
        verbose_name_plural = _('Restaurant Settings')

    def __str__(self):
        return f"{self.restaurant.name} Settings"
