from django.views.generic import TemplateView, UpdateView, ListView, CreateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404
from .models import Restaurant, Branch, RestaurantSettings
from .forms import RestaurantProfileForm, BranchForm, RestaurantSettingsForm

class RestaurantAccessMixin(LoginRequiredMixin, UserPassesTestMixin):
    raise_exception = True
    def test_func(self):
        user = self.request.user
        return user.is_authenticated and (
            user.is_super_admin or user.is_owner or user.is_manager
            or user.is_waiter or user.is_kitchen or user.is_cashier
        )

class OwnerOnlyMixin(LoginRequiredMixin, UserPassesTestMixin):
    raise_exception = True
    def test_func(self):
        user = self.request.user
        # Managers can view settings but only owners/admins can edit
        return user.is_authenticated and (user.is_super_admin or user.is_owner or user.is_manager)

class RestaurantDashboardView(RestaurantAccessMixin, TemplateView):
    template_name = 'restaurants/restaurant_dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        if user.is_super_admin:
            context['restaurants'] = Restaurant.objects.all()
        else:
            context['restaurant'] = user.restaurant
        return context

class RestaurantProfileUpdateView(OwnerOnlyMixin, UpdateView):
    model = Restaurant
    form_class = RestaurantProfileForm
    template_name = 'restaurants/restaurant_profile.html'
    success_url = reverse_lazy('restaurant_dashboard')

    def get_object(self):
        # Super admin could potentially pass pk, but for now we bind to the owner's restaurant
        return self.request.user.restaurant

class BranchListView(RestaurantAccessMixin, ListView):
    model = Branch
    template_name = 'restaurants/branch_list.html'
    context_object_name = 'branches'

    def get_queryset(self):
        user = self.request.user
        if user.is_super_admin:
            return Branch.objects.all()
        elif user.is_owner:
            return Branch.objects.filter(restaurant=user.restaurant)
        elif user.is_manager:
            return Branch.objects.filter(id=user.branch_id)
        return Branch.objects.none()

class BranchCreateView(OwnerOnlyMixin, CreateView):
    model = Branch
    form_class = BranchForm
    template_name = 'restaurants/branch_form.html'
    success_url = reverse_lazy('branch_list')

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['restaurant'] = self.request.user.restaurant
        return kwargs

    def form_valid(self, form):
        form.instance.restaurant = self.request.user.restaurant
        return super().form_valid(form)

class BranchUpdateView(OwnerOnlyMixin, UpdateView):
    model = Branch
    form_class = BranchForm
    template_name = 'restaurants/branch_form.html'
    success_url = reverse_lazy('branch_list')

    def get_queryset(self):
        return Branch.objects.filter(restaurant=self.request.user.restaurant)

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['restaurant'] = self.request.user.restaurant
        return kwargs

class BranchDeleteView(OwnerOnlyMixin, DeleteView):
    model = Branch
    success_url = reverse_lazy('branch_list')

    def get_queryset(self):
        return Branch.objects.filter(restaurant=self.request.user.restaurant)

class RestaurantSettingsUpdateView(OwnerOnlyMixin, UpdateView):
    model = RestaurantSettings
    form_class = RestaurantSettingsForm
    template_name = 'restaurants/restaurant_settings.html'
    success_url = reverse_lazy('restaurant_dashboard')

    def get_object(self):
        restaurant = self.request.user.restaurant
        settings, created = RestaurantSettings.objects.get_or_create(restaurant=restaurant)
        return settings
