from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .api_views import StaffProfileViewSet, PayrollViewSet, StaffShiftViewSet

router = SimpleRouter()
router.register(r'staffprofiles', StaffProfileViewSet, basename='staffprofiles')
router.register(r'payrolls', PayrollViewSet, basename='payrolls')
router.register(r'staffshifts', StaffShiftViewSet, basename='staffshifts')

urlpatterns = [
    path('', include(router.urls)),
]
