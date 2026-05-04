from django import forms
from django.conf import settings
from .models import Category, Product, ProductOption
from django.utils.translation import gettext_lazy as _

class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['name', 'description', 'sort_order', 'is_active']

    def clean(self):
        cleaned_data = super().clean()
        name = cleaned_data.get('name')
        if name:
            # Sync to translation fields if they are empty
            for lang_code, lang_name in settings.LANGUAGES:
                field_name = f'name_{lang_code}'
                if not cleaned_data.get(field_name):
                    cleaned_data[field_name] = name
                    self.instance.__setattr__(field_name, name)
        return cleaned_data

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        exclude = ['restaurant']

    def __init__(self, *args, **kwargs):
        restaurant = kwargs.pop('restaurant', None)
        super().__init__(*args, **kwargs)
        if restaurant:
            self.fields['category'].queryset = Category.objects.filter(restaurant=restaurant)
        
        # Make translation fields optional in the form to prevent validation errors
        for field_name in self.fields:
            if any(lang[0] in field_name for lang in settings.LANGUAGES if field_name != 'name'):
                self.fields[field_name].required = False

    def clean(self):
        cleaned_data = super().clean()
        name = cleaned_data.get('name')
        if name:
            for lang_code, lang_name in settings.LANGUAGES:
                field_name = f'name_{lang_code}'
                if not cleaned_data.get(field_name):
                    cleaned_data[field_name] = name
                    self.instance.__setattr__(field_name, name)
        return cleaned_data

class ProductOptionForm(forms.ModelForm):
    class Meta:
        model = ProductOption
        exclude = ['product']

class ProductFilterForm(forms.Form):
    category = forms.ModelChoiceField(queryset=Category.objects.none(), required=False, empty_label=_("All Categories"))
    is_vegetarian = forms.BooleanField(required=False, label=_("Vegetarian"))
    is_vegan = forms.BooleanField(required=False, label=_("Vegan"))
    is_gluten_free = forms.BooleanField(required=False, label=_("Gluten Free"))
    is_diet = forms.BooleanField(required=False, label=_("Diet"))
    spicy_level = forms.IntegerField(required=False, label=_("Min Spicy Level (0-5)"))
    min_price = forms.DecimalField(required=False, label=_("Min Price"))
    max_price = forms.DecimalField(required=False, label=_("Max Price"))
    available_only = forms.BooleanField(required=False, label=_("In Stock Only"))

    def __init__(self, *args, **kwargs):
        restaurant = kwargs.pop('restaurant', None)
        super().__init__(*args, **kwargs)
        if restaurant:
            self.fields['category'].queryset = Category.objects.filter(restaurant=restaurant)
