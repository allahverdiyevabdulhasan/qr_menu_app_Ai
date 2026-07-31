from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .api_views import RestaurantTableViewSet, TableReservationViewSet, WaiterCallViewSet

router = SimpleRouter()
router.register(r'restauranttables', RestaurantTableViewSet, basename='restauranttables')
router.register(r'tablereservations', TableReservationViewSet, basename='tablereservations')
router.register(r'waitercalls', WaiterCallViewSet, basename='waitercalls')

urlpatterns = [
    path('', include(router.urls)),
]
