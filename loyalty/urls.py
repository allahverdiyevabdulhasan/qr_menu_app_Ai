from django.urls import path
from .views import LoyaltyDashboardView, RewardListView, RewardCreateView, CustomerLoyaltyView

urlpatterns = [
    path('', LoyaltyDashboardView.as_view(), name='loyalty_dashboard'),
    path('rewards/', RewardListView.as_view(), name='loyalty_reward_list'),
    path('rewards/add/', RewardCreateView.as_view(), name='loyalty_reward_add'),
    path('customer/<int:pk>/', CustomerLoyaltyView.as_view(), name='customer_loyalty'),
]
