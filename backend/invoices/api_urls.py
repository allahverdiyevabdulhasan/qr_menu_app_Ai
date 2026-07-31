from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .api_views import InvoiceViewSet

router = SimpleRouter()
router.register(r'invoices', InvoiceViewSet, basename='invoices')

urlpatterns = [
    path('', include(router.urls)),
]
