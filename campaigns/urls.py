from django.urls import path
from .views import CampaignListView, CampaignCreateView, CouponListView, CouponCreateView

urlpatterns = [
    path('', CampaignListView.as_view(), name='campaign_list'),
    path('add/', CampaignCreateView.as_view(), name='campaign_add'),
    path('coupons/', CouponListView.as_view(), name='coupon_list'),
    path('coupons/add/', CouponCreateView.as_view(), name='coupon_add'),
]
