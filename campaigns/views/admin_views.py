from django.views.generic import ListView, CreateView, UpdateView, TemplateView
from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404, redirect
from django.http import JsonResponse
from restaurants.models import Restaurant
from restaurants.views import RestaurantAccessMixin
from campaigns.models import Campaign, Coupon
from campaigns.services import validate_coupon

class CampaignListView(RestaurantAccessMixin, ListView):
    model = Campaign
    template_name = 'campaigns/campaign_list.html'
    context_object_name = 'campaigns'

    def get_queryset(self):
        return Campaign.objects.filter(restaurant=self.request.user.restaurant)

class CampaignCreateView(RestaurantAccessMixin, CreateView):
    model = Campaign
    template_name = 'campaigns/campaign_form.html'
    fields = ['title', 'description', 'campaign_type', 'discount_value', 'start_date', 'end_date', 'min_order_amount', 'is_active']
    success_url = reverse_lazy('campaign_list')

    def form_valid(self, form):
        form.instance.restaurant = self.request.user.restaurant
        return super().form_valid(form)

class CampaignUpdateView(RestaurantAccessMixin, UpdateView):
    model = Campaign
    template_name = 'campaigns/campaign_form.html'
    fields = ['title', 'description', 'campaign_type', 'discount_value', 'start_date', 'end_date', 'min_order_amount', 'is_active']
    success_url = reverse_lazy('campaign_list')

class CouponListView(RestaurantAccessMixin, ListView):
    model = Coupon
    template_name = 'campaigns/coupon_list.html'
    context_object_name = 'coupons'

    def get_queryset(self):
        return Coupon.objects.filter(restaurant=self.request.user.restaurant)

class CouponCreateView(RestaurantAccessMixin, CreateView):
    model = Coupon
    template_name = 'campaigns/coupon_form.html'
    fields = ['code', 'discount_type', 'discount_value', 'usage_limit', 'start_date', 'end_date', 'is_active']
    success_url = reverse_lazy('coupon_list')

    def form_valid(self, form):
        form.instance.restaurant = self.request.user.restaurant
        return super().form_valid(form)

class CouponUpdateView(RestaurantAccessMixin, UpdateView):
    model = Coupon
    template_name = 'campaigns/coupon_form.html'
    fields = ['code', 'discount_type', 'discount_value', 'usage_limit', 'start_date', 'end_date', 'is_active']
    success_url = reverse_lazy('coupon_list')

class PublicCampaignsView(TemplateView):
    template_name = 'campaigns/public_campaigns.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        r = get_object_or_404(Restaurant, slug=self.kwargs['slug'])
        context['campaigns'] = Campaign.objects.filter(restaurant=r, is_active=True)
        context['restaurant'] = r
        return context
