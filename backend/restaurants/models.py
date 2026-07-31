from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

def restaurant_logo_upload_path(instance, filename):
    return f"restaurants/{instance.slug}/logos/{filename}"

class Restaurant(models.Model):
    INDUSTRY_CHOICES = [
        ('restaurant', _('Restaurant & Cafe')),
        ('hotel', _('Hotel / Accommodation')),
        ('retail', _('Retail / Store')),
        ('beauty', _('Beauty Salon / Spa')),
        ('service', _('General Service')),
    ]
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_restaurants', verbose_name=_("Owner"))
    name = models.CharField(_("Name"), max_length=255)
    slug = models.SlugField(_("Slug"), unique=True, max_length=255)
    industry = models.CharField(_("Industry / Sector"), max_length=50, choices=INDUSTRY_CHOICES, default='restaurant')
    custom_domain = models.CharField(_("Custom Domain"), max_length=255, unique=True, null=True, blank=True, help_text=_("e.g. menu.myrestaurant.com or haket.neymanmenu.com"))
    logo = models.ImageField(_("Logo"), upload_to=restaurant_logo_upload_path, blank=True, null=True)
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
    subscription_end_date = models.DateField(_("Subscription End Date"), null=True, blank=True)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    @property
    def average_rating(self):
        from reviews.models import Review, ProductReview
        from django.db.models import Avg
        
        # Combined reviews for a unified score
        restaurant_reviews = list(Review.objects.filter(restaurant=self).values_list('rating', flat=True))
        product_reviews = list(ProductReview.objects.filter(product__restaurant=self).values_list('rating', flat=True))
        
        all_ratings = restaurant_reviews + product_reviews
        if not all_ratings:
            return 0.0
            
        result = sum(all_ratings) / len(all_ratings)
        return round(result, 1)

    @property
    def review_count(self):
        from reviews.models import Review, ProductReview
        return Review.objects.filter(restaurant=self).count() + ProductReview.objects.filter(product__restaurant=self).count()

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
    require_login_for_orders = models.BooleanField(_("Require Login for Table Orders"), default=False)
    allow_takeaway_orders = models.BooleanField(_("Allow Takeaway Orders"), default=True)
    allow_pre_orders = models.BooleanField(_("Allow Pre-orders"), default=False)
    allow_ai_recommendations = models.BooleanField(_("Allow AI Recommendations"), default=True)
    allow_loyalty = models.BooleanField(_("Allow Loyalty Program"), default=False)
    allow_reviews = models.BooleanField(_("Allow Reviews"), default=True)
    enable_tax_feature = models.BooleanField(_("Enable Tax/VAT Feature"), default=True)
    service_charge_percent = models.DecimalField(_("Service Charge Percent"), max_digits=5, decimal_places=2, default=0)
    tax_percent = models.DecimalField(_("Tax Percent"), max_digits=5, decimal_places=2, default=0)
    average_preparation_time = models.IntegerField(_("Average Preparation Time (mins)"), default=15)
    theme_color = models.CharField(_("Theme Color"), max_length=7, default='#000000')
    show_calories = models.BooleanField(_("Show Calories"), default=False)
    show_allergens = models.BooleanField(_("Show Allergens"), default=True)
    
    # Module Toggles
    enable_kds = models.BooleanField(_("Enable Kitchen Display System"), default=True)
    enable_waiter = models.BooleanField(_("Enable Waiter Panel"), default=True)
    enable_cashier = models.BooleanField(_("Enable Cashier Panel"), default=True)
    enable_courier = models.BooleanField(_("Enable Courier/Delivery"), default=False)
    enable_reservations = models.BooleanField(_("Enable Reservations"), default=True)
    enable_online_payment = models.BooleanField(_("Enable Online Payment"), default=False)
    
    # Granular Modüller
    enable_overview = models.BooleanField(_("Enable Overview"), default=True)
    enable_orders = models.BooleanField(_("Enable Orders History"), default=True)
    enable_pos = models.BooleanField(_("Enable POS / New Order"), default=True)
    
    enable_finance_z_reports = models.BooleanField(_("Enable Z-Reports"), default=True)
    enable_finance_refunds = models.BooleanField(_("Enable Refunds"), default=True)
    enable_finance_expenses = models.BooleanField(_("Enable Expenses"), default=True)
    
    enable_hr_shifts = models.BooleanField(_("Enable HR Shifts"), default=True)
    enable_hr_payroll = models.BooleanField(_("Enable HR Payroll"), default=True)
    enable_hr_roles = models.BooleanField(_("Enable HR Roles"), default=True)
    
    enable_menu_items = models.BooleanField(_("Enable Menu Items"), default=True)
    enable_inventory_ingredients = models.BooleanField(_("Enable Ingredients"), default=True)
    enable_inventory_stock = models.BooleanField(_("Enable Stock & Inventory"), default=True)
    enable_inventory_predictions = models.BooleanField(_("Enable Stock Predictions"), default=True)
    
    enable_ai_reports = models.BooleanField(_("Enable AI Reports"), default=True)
    enable_ai_assistant = models.BooleanField(_("Enable AI Assistant"), default=True)
    enable_marketing_campaigns = models.BooleanField(_("Enable Campaigns"), default=True)
    enable_marketing_loyalty = models.BooleanField(_("Enable Loyalty Program"), default=True)
    
    # Eski Genel Toggles (Geriye Dönük Uyumluluk için tutulabilir)
    enable_menu_management = models.BooleanField(_("Enable Menu Management"), default=True)
    enable_finance = models.BooleanField(_("Enable Finance & Accounting"), default=True)
    enable_hr = models.BooleanField(_("Enable HR & Payroll"), default=True)
    enable_inventory = models.BooleanField(_("Enable Inventory"), default=True)
    enable_ai = models.BooleanField(_("Enable AI Features"), default=True)
    enable_marketing = models.BooleanField(_("Enable Marketing"), default=True)
    enable_reports = models.BooleanField(_("Enable Reports"), default=True)
    enable_settings = models.BooleanField(_("Enable System Settings"), default=True)
    # WhatsApp Ordering
    enable_whatsapp_ordering = models.BooleanField(_("Enable WhatsApp Ordering"), default=False)
    whatsapp_number = models.CharField(_("WhatsApp Number"), max_length=20, blank=True, help_text=_("Include country code, e.g. +90555..."))
    
    # Branches
    enable_branches = models.BooleanField(_("Enable Branch Management"), default=False)
    
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
