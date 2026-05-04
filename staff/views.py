from django.views.generic import ListView, CreateView, UpdateView, DetailView
from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404, redirect
from restaurants.views import OwnerOnlyMixin, RestaurantAccessMixin
from .models import StaffProfile, Payroll
from accounts.models import User
from django.db import transaction

class StaffListView(RestaurantAccessMixin, ListView):
    model = StaffProfile
    template_name = 'staff/staff_list.html'
    context_object_name = 'staff_list'

    def get_queryset(self):
        return StaffProfile.objects.filter(user__restaurant=self.request.user.restaurant).select_related('user')

class StaffCreateView(OwnerOnlyMixin, CreateView):
    model = StaffProfile
    fields = ['salary_type', 'salary_amount', 'hire_date', 'is_active']
    template_name = 'staff/staff_form.html'
    success_url = reverse_lazy('staff_list')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Only show users from this restaurant who don't have a profile yet
        context['available_users'] = User.objects.filter(
            restaurant=self.request.user.restaurant,
            staff_profile__isnull=True
        ).exclude(role='CUSTOMER')
        return context

    def form_valid(self, form):
        user_id = self.request.POST.get('user_id')
        user = get_object_or_404(User, pk=user_id, restaurant=self.request.user.restaurant)
        form.instance.user = user
        return super().form_valid(form)

class StaffUpdateView(OwnerOnlyMixin, UpdateView):
    model = StaffProfile
    fields = ['salary_type', 'salary_amount', 'hire_date', 'is_active']
    template_name = 'staff/staff_form.html'
    success_url = reverse_lazy('staff_list')

    def get_queryset(self):
        return StaffProfile.objects.filter(user__restaurant=self.request.user.restaurant)

class PayrollListView(RestaurantAccessMixin, ListView):
    model = Payroll
    template_name = 'staff/payroll_list.html'
    context_object_name = 'payrolls'

    def get_queryset(self):
        return Payroll.objects.filter(staff__user__restaurant=self.request.user.restaurant).select_related('staff__user')

class PayrollCreateView(OwnerOnlyMixin, CreateView):
    model = Payroll
    fields = ['staff', 'amount', 'salary_period', 'payment_date', 'payment_status', 'note']
    template_name = 'staff/payroll_form.html'
    success_url = reverse_lazy('payroll_list')

    def get_initial(self):
        initial = super().get_initial()
        staff_id = self.request.GET.get('staff')
        if staff_id:
            staff = get_object_or_404(StaffProfile, pk=staff_id, user__restaurant=self.request.user.restaurant)
            initial['staff'] = staff
            initial['amount'] = staff.salary_amount
        return initial

    def get_form(self, form_class=None):
        form = super().get_form(form_class)
        # Limit staff to current restaurant
        form.fields['staff'].queryset = StaffProfile.objects.filter(user__restaurant=self.request.user.restaurant)
        return form

    def form_valid(self, form):
        from invoices.services import create_invoice_from_payroll
        form.instance.created_by = self.request.user
        response = super().form_valid(form)
        create_invoice_from_payroll(self.object)
        return response
