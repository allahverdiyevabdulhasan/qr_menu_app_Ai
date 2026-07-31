from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StaffProfileViewSet, PayrollViewSet, StaffShiftViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'staffprofile', StaffProfileViewSet)
router.register(r'payroll', PayrollViewSet)
router.register(r'staffshift', StaffShiftViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

