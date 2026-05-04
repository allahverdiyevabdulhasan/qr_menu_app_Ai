from django.urls import path
from .views import (
    CampaignListView, CampaignCreateView, CampaignUpdateView,
    CouponListView, CouponCreateView, CouponUpdateView
)

urlpatterns = [
    path('', CampaignListView.as_view(), name='campaign_list'),
    path('add/', CampaignCreateView.as_view(), name='campaign_add'),
    path('<int:pk>/edit/', CampaignUpdateView.as_view(), name='campaign_edit'),
    path('coupons/', CouponListView.as_view(), name='coupon_list'),
    path('coupons/add/', CouponCreateView.as_view(), name='coupon_add'),
    path('coupons/<int:pk>/edit/', CouponUpdateView.as_view(), name='coupon_edit'),
]
