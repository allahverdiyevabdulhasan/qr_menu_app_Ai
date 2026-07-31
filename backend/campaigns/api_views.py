from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Campaign, Coupon
from .serializers import CampaignSerializer, CouponSerializer

class CampaignViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = CampaignSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Campaign.objects.all()

class CouponViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = CouponSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Coupon.objects.all()

