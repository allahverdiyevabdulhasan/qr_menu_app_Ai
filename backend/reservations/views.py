from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from .models import Reservation
from .serializers import ReservationSerializer

class ReservationViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
