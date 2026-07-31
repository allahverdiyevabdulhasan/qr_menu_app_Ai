from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet, PayrollRecordViewSet, InvoiceViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'expense', ExpenseViewSet)
router.register(r'payrollrecord', PayrollRecordViewSet)
router.register(r'invoice', InvoiceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

