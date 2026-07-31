from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from .models import StaffProfile, Payroll, StaffShift
from .serializers import StaffProfileSerializer, PayrollSerializer, StaffShiftSerializer

class StaffProfileViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = StaffProfile.objects.all()
    serializer_class = StaffProfileSerializer

class PayrollViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer

class StaffShiftViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = StaffShift.objects.all()
    serializer_class = StaffShiftSerializer
