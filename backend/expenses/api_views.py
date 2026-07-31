from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Expense
from .serializers import ExpenseSerializer

class ExpenseViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Expense.objects.all()

