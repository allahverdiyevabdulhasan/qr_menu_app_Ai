from django import forms
from django.utils import timezone
from datetime import timedelta

class DateRangeFilterForm(forms.Form):
    PRESET_CHOICES = [
        ('today', 'Today'),
        ('yesterday', 'Yesterday'),
        ('this_week', 'This Week'),
        ('this_month', 'This Month'),
        ('this_year', 'This Year'),
        ('custom', 'Custom Range'),
    ]
    
    preset = forms.ChoiceField(choices=PRESET_CHOICES, required=False, initial='this_month')
    start_date = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date'}))
    end_date = forms.DateField(required=False, widget=forms.DateInput(attrs={'type': 'date'}))

    def get_date_range(self):
        preset = self.cleaned_data.get('preset')
        start = self.cleaned_data.get('start_date')
        end = self.cleaned_data.get('end_date')
        
        now = timezone.now()
        today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        if preset == 'today':
            return today, now
        elif preset == 'yesterday':
            return today - timedelta(days=1), today
        elif preset == 'this_week':
            return today - timedelta(days=now.weekday()), now
        elif preset == 'this_month':
            return today.replace(day=1), now
        elif preset == 'this_year':
            return today.replace(month=1, day=1), now
        elif preset == 'custom' and start and end:
            return start, end + timedelta(days=1)
            
        # Default to this month
        return today.replace(day=1), now
