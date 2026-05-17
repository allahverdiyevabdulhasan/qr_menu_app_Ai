from django.views.generic import TemplateView, UpdateView, ListView, CreateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
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
        # Managers and users with explicit branch management permission can edit branches
        return user.is_authenticated and (
            user.is_super_admin or user.is_owner or user.is_manager or getattr(user, 'can_manage_branches', False)
        )

class PermissionRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    permission_name = None
    raise_exception = True

    def test_func(self):
        user = self.request.user
        if not user.is_authenticated:
            return False
        
        # Super admin, Owner and Manager bypass checks
        if user.is_super_admin or user.role in ['RESTAURANT_OWNER', 'MANAGER']:
            return True
            
        if self.permission_name and getattr(user, self.permission_name, False):
            return True
            
        return False


class RestaurantDashboardView(RestaurantAccessMixin, TemplateView):
    template_name = 'restaurants/restaurant_dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        user = self.request.user
        if user.is_super_admin:
            context['restaurants'] = Restaurant.objects.all()
            # Default to first restaurant for superadmin overview
            restaurant = Restaurant.objects.first()
            context['restaurant'] = restaurant
        else:
            restaurant = user.restaurant
            context['restaurant'] = restaurant

        if restaurant:
            # Calculate metrics
            today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
            today_end = today_start + timedelta(days=1)
            yesterday_start = today_start - timedelta(days=1)
            yesterday_end = today_start
            thirty_days_ago = today_start - timedelta(days=30)

            from analytics.services import (
                get_revenue_metrics,
                get_order_metrics,
                get_net_profit,
                get_top_products
            )
            from orders.models import Order

            # Today vs Yesterday Revenue
            today_rev = get_revenue_metrics(restaurant, start_date=today_start, end_date=today_end)
            yesterday_rev = get_revenue_metrics(restaurant, start_date=yesterday_start, end_date=yesterday_end)
            context['today_revenue'] = {'total': today_rev}
            context['yesterday_revenue'] = {'total': yesterday_rev}

            # Net Profit (last 30 days)
            net_profit = get_net_profit(restaurant, start_date=thirty_days_ago)
            context['net_profit'] = net_profit

            # Orders (Today)
            order_metrics = get_order_metrics(restaurant, start_date=today_start, end_date=today_end)
            context['total_orders'] = order_metrics['total_orders']
            context['completed_orders'] = order_metrics['completed_orders']

            # Recent Orders (Today/Overall)
            context['recent_orders'] = Order.objects.filter(restaurant=restaurant).order_by('-created_at')[:5]

            # Top Products (last 30 days)
            top_products_raw = get_top_products(restaurant, start_date=thirty_days_ago)
            top_products = []
            for p in top_products_raw:
                top_products.append({
                    'name': p['product__name'],
                    'total_quantity': p['total_sold'],
                    'total_revenue': p['revenue']
                })
            context['top_products'] = top_products

            # Avg. Rating (Unified across restaurant and product reviews)
            from reviews.services import get_unified_reviews
            unified_reviews = get_unified_reviews(restaurant)
            if unified_reviews:
                ratings = [r['rating'] for r in unified_reviews]
                context['avg_rating'] = sum(ratings) / len(ratings)
            else:
                context['avg_rating'] = 0.0

        return context

class RestaurantProfileUpdateView(PermissionRequiredMixin, UpdateView):
    permission_name = 'can_manage_settings'

    model = Restaurant
    form_class = RestaurantProfileForm
    template_name = 'restaurants/restaurant_profile.html'
    success_url = reverse_lazy('restaurant_dashboard')

    def get_object(self, queryset=None):
        restaurant = self.request.user.restaurant
        if not restaurant and self.request.user.is_super_admin:
            restaurant = Restaurant.objects.first()
        
        if not restaurant:
            from django.http import Http404
            raise Http404(_("No restaurant found for this user."))
        return restaurant

    def form_valid(self, form):
        if not form.instance.owner_id:
            form.instance.owner = self.request.user
        return super().form_valid(form)

class BranchListView(RestaurantAccessMixin, ListView):
    model = Branch
    template_name = 'restaurants/branch_list.html'
    context_object_name = 'branches'

    def get_queryset(self):
        user = self.request.user
        if user.is_super_admin:
            return Branch.objects.all()
        elif user.is_owner or user.is_manager or getattr(user, 'can_manage_branches', False):
            return Branch.objects.filter(restaurant=user.restaurant)
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

class RestaurantSettingsUpdateView(PermissionRequiredMixin, UpdateView):
    permission_name = 'can_manage_settings'

    model = RestaurantSettings
    form_class = RestaurantSettingsForm
    template_name = 'restaurants/restaurant_settings.html'
    success_url = reverse_lazy('restaurant_dashboard')

    def get_object(self):
        restaurant = self.request.user.restaurant
        settings, created = RestaurantSettings.objects.get_or_create(restaurant=restaurant)
        return settings
