from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Restaurant, Branch, RestaurantSettings
from .serializers import RestaurantSerializer, BranchSerializer, RestaurantSettingsSerializer

class RestaurantViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    """
    API endpoint that allows restaurants to be viewed or edited.
    """
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # A manager/admin only sees restaurants they own, superusers see all
        user = self.request.user
        if user.is_superuser:
            return Restaurant.objects.all()
        return Restaurant.objects.filter(owner=user)

class BranchViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = BranchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or getattr(user, 'is_super_admin', False):
            return Branch.objects.all()
            
        # Eğer kullanıcının doğrudan bağlı olduğu bir restoran varsa
        if hasattr(user, 'restaurant') and user.restaurant:
            if getattr(user.restaurant, 'settings', None) and user.restaurant.settings.enable_branches:
                return Branch.objects.filter(restaurant=user.restaurant)
            return Branch.objects.none()
            
        # Eğer birden fazla restorana sahipse
        return Branch.objects.filter(restaurant__owner=user, restaurant__settings__enable_branches=True)

class RestaurantSettingsViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = RestaurantSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return RestaurantSettings.objects.all()
        return RestaurantSettings.objects.filter(restaurant__owner=user)
