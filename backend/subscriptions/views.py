from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from .models import Plan, Subscription
from .serializers import PlanSerializer, SubscriptionSerializer

class PlanViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer

class SubscriptionViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer
