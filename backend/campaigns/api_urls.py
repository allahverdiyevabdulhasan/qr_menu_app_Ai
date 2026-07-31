from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .api_views import CampaignViewSet, CouponViewSet

router = SimpleRouter()
router.register(r'campaigns', CampaignViewSet, basename='campaigns')
router.register(r'coupons', CouponViewSet, basename='coupons')

urlpatterns = [
    path('', include(router.urls)),
]
