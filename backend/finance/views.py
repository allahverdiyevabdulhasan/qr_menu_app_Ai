from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from .models import Expense, PayrollRecord, Invoice
from .serializers import ExpenseSerializer, PayrollRecordSerializer, InvoiceSerializer

class ExpenseViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer

class PayrollRecordViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = PayrollRecord.objects.all()
    serializer_class = PayrollRecordSerializer

class InvoiceViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
