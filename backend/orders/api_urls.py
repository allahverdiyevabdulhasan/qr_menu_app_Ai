from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .api_views import OrderViewSet, OrderItemViewSet, OrderStageHistoryViewSet

router = SimpleRouter()
router.register(r'orders', OrderViewSet, basename='orders')
router.register(r'orderitems', OrderItemViewSet, basename='orderitems')
router.register(r'orderstagehistorys', OrderStageHistoryViewSet, basename='orderstagehistorys')

urlpatterns = [
    path('', include(router.urls)),
]
