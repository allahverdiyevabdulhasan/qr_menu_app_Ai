from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from .models import LoyaltyRule, LoyaltyTransaction, LoyaltyReward, CustomerLevel
from .serializers import LoyaltyRuleSerializer, LoyaltyTransactionSerializer, LoyaltyRewardSerializer, CustomerLevelSerializer

class LoyaltyRuleViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = LoyaltyRule.objects.all()
    serializer_class = LoyaltyRuleSerializer

class LoyaltyTransactionViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = LoyaltyTransaction.objects.all()
    serializer_class = LoyaltyTransactionSerializer

class LoyaltyRewardViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = LoyaltyReward.objects.all()
    serializer_class = LoyaltyRewardSerializer

class CustomerLevelViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = CustomerLevel.objects.all()
    serializer_class = CustomerLevelSerializer
