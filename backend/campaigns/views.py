from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from .models import Campaign, Coupon
from .serializers import CampaignSerializer, CouponSerializer

class CampaignViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer

class CouponViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
