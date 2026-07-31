from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RestaurantViewSet, BranchViewSet, RestaurantSettingsViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'restaurant', RestaurantViewSet)
router.register(r'branch', BranchViewSet)
router.register(r'restaurantsettings', RestaurantSettingsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

