from django import forms
from .models import RestaurantTable

from .models import RestaurantTable, TableReservation

class RestaurantTableForm(forms.ModelForm):
    class Meta:
        model = RestaurantTable
        fields = ['branch', 'table_number', 'table_name', 'status', 'capacity', 'is_active']

    def __init__(self, *args, **kwargs):
        restaurant = kwargs.pop('restaurant', None)
        super().__init__(*args, **kwargs)
        if restaurant:
            from restaurants.models import Branch
            self.fields['branch'].queryset = Branch.objects.filter(restaurant=restaurant)

class TableReservationForm(forms.ModelForm):
    class Meta:
        model = TableReservation
        fields = ['branch', 'table', 'customer_name', 'customer_phone', 'customer_email', 
                  'reservation_date', 'reservation_time_only', 'number_of_people', 'note', 'status']
        widgets = {
            'reservation_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'reservation_time_only': forms.TimeInput(attrs={'type': 'time', 'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        restaurant = kwargs.pop('restaurant', None)
        super().__init__(*args, **kwargs)
        if restaurant:
            from restaurants.models import Branch
            self.fields['branch'].queryset = Branch.objects.filter(restaurant=restaurant)
            self.fields['table'].queryset = RestaurantTable.objects.filter(restaurant=restaurant)
        for field in self.fields.values():
            field.widget.attrs.update({'class': 'form-control'})
