from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .api_views import RestaurantViewSet, BranchViewSet, RestaurantSettingsViewSet

router = SimpleRouter()
router.register(r'restaurant', RestaurantViewSet, basename='restaurant')
router.register(r'branches', BranchViewSet, basename='branch')
router.register(r'settings', RestaurantSettingsViewSet, basename='settings')

urlpatterns = [
    path('', include(router.urls)),
]
