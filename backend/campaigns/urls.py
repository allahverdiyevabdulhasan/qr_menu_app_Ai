from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CampaignViewSet, CouponViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'campaign', CampaignViewSet)
router.register(r'coupon', CouponViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

