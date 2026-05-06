from django.db import models
from django.utils.translation import gettext_lazy as _
from restaurants.models import Restaurant

class Category(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='categories', verbose_name=_("Restaurant"))
    name = models.CharField(_("Name"), max_length=100)
    description = models.TextField(_("Description"), blank=True)
    sort_order = models.IntegerField(_("Sort Order"), default=0)
    is_active = models.BooleanField(_("Is Active"), default=True)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")
        ordering = ['sort_order', 'name']

    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"

class Product(models.Model):
    STOCK_STATUS_CHOICES = [
        ('in_stock', _('In Stock')),
        ('low_stock', _('Low Stock')),
        ('out_of_stock', _('Out of Stock')),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='products', verbose_name=_("Restaurant"))
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products', verbose_name=_("Category"))
    name = models.CharField(_("Name"), max_length=200)
    description = models.TextField(_("Description"), blank=True)
    price = models.DecimalField(_("Price"), max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(_("Cost Price"), max_digits=10, decimal_places=2, null=True, blank=True)
    image = models.ImageField(_("Image"), upload_to='products/', null=True, blank=True)
    
    # Nutritional info
    calories = models.IntegerField(_("Calories"), null=True, blank=True)
    protein = models.DecimalField(_("Protein (g)"), max_digits=6, decimal_places=2, null=True, blank=True)
    carbs = models.DecimalField(_("Carbs (g)"), max_digits=6, decimal_places=2, null=True, blank=True)
    fat = models.DecimalField(_("Fat (g)"), max_digits=6, decimal_places=2, null=True, blank=True)
    allergens = models.JSONField(_("Allergens"), default=list, blank=True)
    preparation_time = models.IntegerField(_("Preparation Time (mins)"), null=True, blank=True)
    
    # Toggles
    is_active = models.BooleanField(_("Is Active"), default=True, blank=True)
    is_popular = models.BooleanField(_("Is Popular"), default=False, blank=True)
    is_featured = models.BooleanField(_("Is Featured"), default=False, blank=True)
    is_discounted = models.BooleanField(_("Is Discounted"), default=False, blank=True)
    stock_status = models.CharField(_("Stock Status"), max_length=20, choices=STOCK_STATUS_CHOICES, default='in_stock', blank=True)
    
    # Dietary info
    spicy_level = models.IntegerField(_("Spicy Level (0-5)"), default=0, blank=True)
    is_vegetarian = models.BooleanField(_("Is Vegetarian"), default=False, blank=True)
    is_vegan = models.BooleanField(_("Is Vegan"), default=False, blank=True)
    is_gluten_free = models.BooleanField(_("Is Gluten Free"), default=False, blank=True)
    is_diet = models.BooleanField(_("Is Diet"), default=False, blank=True)
    
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    @property
    def average_rating(self):
        from reviews.models import ProductReview
        reviews = ProductReview.objects.filter(product=self, is_active=True)
        if not reviews.exists():
            return 0
        return sum(r.rating for r in reviews) / reviews.count()

    @property
    def review_count(self):
        from reviews.models import ProductReview
        return ProductReview.objects.filter(product=self, is_active=True).count()

    class Meta:
        verbose_name = _("Product")
        verbose_name_plural = _("Products")

    def __str__(self):
        return self.name

class ModifierGroup(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='modifier_groups')
    name = models.CharField(_("Group Name"), max_length=100)
    is_required = models.BooleanField(_("Is Required"), default=False)
    min_choices = models.IntegerField(_("Minimum Choices"), default=0)
    max_choices = models.IntegerField(_("Maximum Choices"), default=1)
    products = models.ManyToManyField(Product, related_name='modifier_groups', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Modifier Group")
        verbose_name_plural = _("Modifier Groups")

    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"

class ProductModifier(models.Model):
    group = models.ForeignKey(ModifierGroup, on_delete=models.CASCADE, related_name='modifiers')
    name = models.CharField(_("Modifier Name"), max_length=100)
    price = models.DecimalField(_("Additional Price"), max_digits=10, decimal_places=2, default=0.00)
    is_active = models.BooleanField(_("Is Active"), default=True)

    class Meta:
        verbose_name = _("Product Modifier")
        verbose_name_plural = _("Product Modifiers")

    def __str__(self):
        return f"{self.group.name} -> {self.name} (+{self.price})"

class ProductOption(models.Model):
    OPTION_TYPE_CHOICES = [
        ('single', _('Single Choice')),
        ('multiple', _('Multiple Choice')),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='options', verbose_name=_("Product"))
    name = models.CharField(_("Name"), max_length=100)
    option_type = models.CharField(_("Option Type"), max_length=20, choices=OPTION_TYPE_CHOICES, default='single')
    price = models.DecimalField(_("Additional Price"), max_digits=10, decimal_places=2, default=0.00)
    is_active = models.BooleanField(_("Is Active"), default=True)

    class Meta:
        verbose_name = _("Product Option")
        verbose_name_plural = _("Product Options")

    def __str__(self):
        return f"{self.product.name} - {self.name} (+{self.price})"

class ProductIngredient(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='display_ingredients')
    name = models.CharField(_("Ingredient Name"), max_length=100)
    is_removable = models.BooleanField(_("Is Removable"), default=True)

    def __str__(self):
        return f"{self.product.name} - {self.name}"
