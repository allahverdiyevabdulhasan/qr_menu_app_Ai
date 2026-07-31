from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .api_views import CustomerViewSet

router = SimpleRouter()
router.register(r'customers', CustomerViewSet, basename='customers')

urlpatterns = [
    path('', include(router.urls)),
]
