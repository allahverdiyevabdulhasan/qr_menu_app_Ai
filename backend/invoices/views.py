from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from .models import Invoice
from .serializers import InvoiceSerializer

class InvoiceViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
