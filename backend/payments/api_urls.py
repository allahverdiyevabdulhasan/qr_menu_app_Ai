from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import ZReportViewSet, PaymentViewSet

router = SimpleRouter()
router.register(r'zreport', ZReportViewSet, basename='zreport')
router.register(r'payments', PaymentViewSet, basename='payments')

urlpatterns = [
    path('', include(router.urls)),
]
