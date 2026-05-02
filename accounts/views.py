from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import UpdateView, ListView, CreateView
from django.urls import reverse_lazy
from django.shortcuts import redirect
from .models import User
from .forms import LoginForm, StaffCreateForm, UserProfileForm
from .mixins import OwnerRequiredMixin, ManagerRequiredMixin

class CustomLoginView(LoginView):
    template_name = 'accounts/login.html'
    form_class = LoginForm
    redirect_authenticated_user = True

    def get_success_url(self):
        user = self.request.user
        if user.is_super_admin:
            return reverse_lazy('admin:index') # or a custom super admin dashboard
        elif user.is_owner or user.is_manager:
            return reverse_lazy('restaurant_dashboard')
        elif user.is_customer:
            if user.restaurant:
                return reverse_lazy('public_menu', kwargs={'slug': user.restaurant.slug})
            return reverse_lazy('logout') # Safely logout if no restaurant context for customer
        else:
            return reverse_lazy('restaurant_dashboard') # Staff dashboard

class CustomLogoutView(LogoutView):
    next_page = 'login'

class ProfileView(LoginRequiredMixin, UpdateView):
    model = User
    form_class = UserProfileForm
    template_name = 'accounts/profile.html'
    success_url = reverse_lazy('profile')

    def get_object(self):
        return self.request.user

class StaffListView(OwnerRequiredMixin, ListView):
    model = User
    template_name = 'accounts/staff_list.html'
    context_object_name = 'staff_members'

    def get_queryset(self):
        restaurant = self.request.user.restaurant
        if restaurant:
            return User.objects.filter(restaurant=restaurant).exclude(id=self.request.user.id)
        return User.objects.none()

class StaffCreateView(OwnerRequiredMixin, CreateView):
    model = User
    form_class = StaffCreateForm
    template_name = 'accounts/staff_form.html'
    success_url = reverse_lazy('staff_list')

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['restaurant'] = self.request.user.restaurant
        return kwargs

    def form_valid(self, form):
        form.instance.restaurant = self.request.user.restaurant
        return super().form_valid(form)

class StaffUpdateView(OwnerRequiredMixin, UpdateView):
    model = User
    template_name = 'accounts/staff_form.html'
    fields = ['first_name', 'last_name', 'email', 'phone', 'role', 'branch']
    success_url = reverse_lazy('staff_list')

    def get_queryset(self):
        return User.objects.filter(restaurant=self.request.user.restaurant)
