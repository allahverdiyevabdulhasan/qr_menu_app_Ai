from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .api_views import ExpenseViewSet

router = SimpleRouter()
router.register(r'expenses', ExpenseViewSet, basename='expenses')

urlpatterns = [
    path('', include(router.urls)),
]
