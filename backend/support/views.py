from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from .models import Ticket, TicketReply
from .serializers import TicketSerializer, TicketReplySerializer

class TicketViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer

class TicketReplyViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = TicketReply.objects.all()
    serializer_class = TicketReplySerializer
