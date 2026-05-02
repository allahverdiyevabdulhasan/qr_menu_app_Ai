from django import forms
from .models import Restaurant, Branch, RestaurantSettings

class RestaurantProfileForm(forms.ModelForm):
    class Meta:
        model = Restaurant
        fields = ['name', 'slug', 'logo', 'description', 'address', 'phone', 'email', 'tax_number', 'default_language', 'currency', 'opening_hours']

class BranchForm(forms.ModelForm):
    class Meta:
        model = Branch
        fields = ['name', 'address', 'phone', 'manager', 'status']

    def __init__(self, *args, **kwargs):
        restaurant = kwargs.pop('restaurant', None)
        super().__init__(*args, **kwargs)
        if restaurant:
            # Only allow assigning managers that belong to this restaurant
            from accounts.models import User
            self.fields['manager'].queryset = User.objects.filter(restaurant=restaurant, role=User.RoleChoices.MANAGER)

class RestaurantSettingsForm(forms.ModelForm):
    class Meta:
        model = RestaurantSettings
        exclude = ['restaurant']
