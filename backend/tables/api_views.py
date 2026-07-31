from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import RestaurantTable, TableReservation, WaiterCall
from .serializers import RestaurantTableSerializer, TableReservationSerializer, WaiterCallSerializer

class RestaurantTableViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = RestaurantTableSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return RestaurantTable.objects.all()

class TableReservationViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = TableReservationSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return TableReservation.objects.all()

class WaiterCallViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = WaiterCallSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return WaiterCall.objects.all()

