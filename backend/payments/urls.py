from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ZReportViewSet, PaymentViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'zreport', ZReportViewSet)
router.register(r'payment', PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

