from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RestaurantTableViewSet, TableReservationViewSet, WaiterCallViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'restauranttable', RestaurantTableViewSet)
router.register(r'tablereservation', TableReservationViewSet)
router.register(r'waitercall', WaiterCallViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

