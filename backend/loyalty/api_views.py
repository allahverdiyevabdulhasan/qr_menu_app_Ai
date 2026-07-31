from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import LoyaltyRule, LoyaltyTransaction, LoyaltyReward, CustomerLevel
from .serializers import LoyaltyRuleSerializer, LoyaltyTransactionSerializer, LoyaltyRewardSerializer, CustomerLevelSerializer

class LoyaltyRuleViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = LoyaltyRuleSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return LoyaltyRule.objects.all()

class LoyaltyTransactionViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = LoyaltyTransactionSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return LoyaltyTransaction.objects.all()

class LoyaltyRewardViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = LoyaltyRewardSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return LoyaltyReward.objects.all()

class CustomerLevelViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = CustomerLevelSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return CustomerLevel.objects.all()

