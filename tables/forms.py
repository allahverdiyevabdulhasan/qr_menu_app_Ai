from django import forms
from .models import RestaurantTable

class RestaurantTableForm(forms.ModelForm):
    class Meta:
        model = RestaurantTable
        fields = ['branch', 'table_number', 'table_name', 'status', 'is_active']

    def __init__(self, *args, **kwargs):
        restaurant = kwargs.pop('restaurant', None)
        super().__init__(*args, **kwargs)
        if restaurant:
            from restaurants.models import Branch
            self.fields['branch'].queryset = Branch.objects.filter(restaurant=restaurant)
