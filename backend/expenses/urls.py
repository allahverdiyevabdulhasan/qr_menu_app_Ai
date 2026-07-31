from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'expense', ExpenseViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

