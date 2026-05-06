from django.contrib import admin
from modeltranslation.admin import TranslationAdmin
from .models import Category, Product, ProductOption, ProductIngredient, ModifierGroup, ProductModifier

@admin.register(Category)
class CategoryAdmin(TranslationAdmin):
    list_display = ('name', 'restaurant', 'sort_order', 'is_active')
    list_filter = ('restaurant', 'is_active')
    search_fields = ('name', 'restaurant__name')

class ProductOptionInline(admin.TabularInline):
    model = ProductOption
    extra = 1

class ProductIngredientInline(admin.TabularInline):
    model = ProductIngredient
    extra = 1

@admin.register(Product)
class ProductAdmin(TranslationAdmin):
    list_display = ('name', 'restaurant', 'category', 'price', 'stock_status', 'is_active')
    list_filter = ('restaurant', 'category', 'is_active', 'stock_status')
    search_fields = ('name', 'restaurant__name')
    inlines = [ProductOptionInline, ProductIngredientInline]

class ProductModifierInline(admin.TabularInline):
    model = ProductModifier
    extra = 1

@admin.register(ModifierGroup)
class ModifierGroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'restaurant', 'is_required', 'min_choices', 'max_choices')
    list_filter = ('restaurant', 'is_required')
    search_fields = ('name', 'restaurant__name')
    inlines = [ProductModifierInline]
    filter_horizontal = ('products',)
