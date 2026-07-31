from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .api_views import LoyaltyRuleViewSet, LoyaltyTransactionViewSet, LoyaltyRewardViewSet, CustomerLevelViewSet

router = SimpleRouter()
router.register(r'loyaltyrules', LoyaltyRuleViewSet, basename='loyaltyrules')
router.register(r'loyaltytransactions', LoyaltyTransactionViewSet, basename='loyaltytransactions')
router.register(r'loyaltyrewards', LoyaltyRewardViewSet, basename='loyaltyrewards')
router.register(r'customerlevels', CustomerLevelViewSet, basename='customerlevels')

urlpatterns = [
    path('', include(router.urls)),
]
