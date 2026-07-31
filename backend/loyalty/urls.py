from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoyaltyRuleViewSet, LoyaltyTransactionViewSet, LoyaltyRewardViewSet, CustomerLevelViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'loyaltyrule', LoyaltyRuleViewSet)
router.register(r'loyaltytransaction', LoyaltyTransactionViewSet)
router.register(r'loyaltyreward', LoyaltyRewardViewSet)
router.register(r'customerlevel', CustomerLevelViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

