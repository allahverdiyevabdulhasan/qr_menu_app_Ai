from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import StaffProfile, Payroll, StaffShift
from .serializers import StaffProfileSerializer, PayrollSerializer, StaffShiftSerializer

class StaffProfileViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = StaffProfileSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return StaffProfile.objects.all()

class PayrollViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = PayrollSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Payroll.objects.all()

class StaffShiftViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = StaffShiftSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return StaffShift.objects.all()

