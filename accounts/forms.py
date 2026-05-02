from django import forms
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm, UserChangeForm
from .models import User
from django.utils.translation import gettext_lazy as _

class LoginForm(AuthenticationForm):
    username = forms.CharField(label=_("Username"), widget=forms.TextInput(attrs={'class': 'form-control'}))
    password = forms.CharField(label=_("Password"), widget=forms.PasswordInput(attrs={'class': 'form-control'}))

class StaffCreateForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('username', 'email', 'first_name', 'last_name', 'phone', 'role', 'branch')
        
    def __init__(self, *args, **kwargs):
        restaurant = kwargs.pop('restaurant', None)
        super().__init__(*args, **kwargs)
        # Remove Owner and Super Admin from choices
        choices = [(k, v) for k, v in User.RoleChoices.choices if k not in ['SUPER_ADMIN', 'RESTAURANT_OWNER', 'CUSTOMER']]
        self.fields['role'].choices = choices
        
        if restaurant:
            # Filter branches to only those belonging to this restaurant
            from restaurants.models import Branch
            self.fields['branch'].queryset = Branch.objects.filter(restaurant=restaurant)
            self.fields['branch'].required = False

    def save(self, commit=True):
        user = super().save(commit=False)
        if commit:
            user.save()
        return user

class UserProfileForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'phone', 'avatar')
