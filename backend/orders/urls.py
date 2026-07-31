from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, OrderItemViewSet, OrderStageHistoryViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'order', OrderViewSet)
router.register(r'orderitem', OrderItemViewSet)
router.register(r'orderstagehistory', OrderStageHistoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

