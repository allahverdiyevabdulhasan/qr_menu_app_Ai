from django.views.generic import TemplateView, ListView, CreateView, UpdateView, DetailView
from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404
from restaurants.views import RestaurantAccessMixin
from accounts.decorators import role_required
from django.utils.decorators import method_decorator
from loyalty.models import LoyaltyReward, LoyaltyTransaction
from customers.models import Customer

class LoyaltyDashboardView(RestaurantAccessMixin, TemplateView):
    template_name = 'loyalty/loyalty_dashboard.html'

    @method_decorator(role_required(['SUPER_ADMIN', 'RESTAURANT_OWNER', 'MANAGER']))
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        r = self.request.user.restaurant
        context['recent_transactions'] = LoyaltyTransaction.objects.filter(restaurant=r)[:10]
        context['rewards'] = LoyaltyReward.objects.filter(restaurant=r)
        return context

class RewardListView(RestaurantAccessMixin, ListView):
    model = LoyaltyReward
    template_name = 'loyalty/reward_list.html'
    context_object_name = 'rewards'

    def get_queryset(self):
        return LoyaltyReward.objects.filter(restaurant=self.request.user.restaurant)

class RewardCreateView(RestaurantAccessMixin, CreateView):
    model = LoyaltyReward
    template_name = 'loyalty/reward_form.html'
    fields = ['title', 'description', 'required_points', 'reward_type', 'discount_value', 'free_product', 'is_active']
    success_url = reverse_lazy('loyalty_reward_list')

    def form_valid(self, form):
        form.instance.restaurant = self.request.user.restaurant
        return super().form_valid(form)

class CustomerLoyaltyView(RestaurantAccessMixin, DetailView):
    # This might also be accessed by customers themselves in a real PWA
    model = Customer
    template_name = 'loyalty/customer_loyalty.html'
    context_object_name = 'customer'

    def get_queryset(self):
        return Customer.objects.filter(restaurant=self.request.user.restaurant)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        r = self.request.user.restaurant
        context['transactions'] = LoyaltyTransaction.objects.filter(customer=self.object, restaurant=r)
        context['available_rewards'] = LoyaltyReward.objects.filter(restaurant=r, is_active=True, required_points__lte=self.object.loyalty_points)
        return context
