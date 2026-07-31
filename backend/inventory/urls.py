from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InventoryItemViewSet, ProductIngredientViewSet, StockMovementViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'inventoryitem', InventoryItemViewSet)
router.register(r'productingredient', ProductIngredientViewSet)
router.register(r'stockmovement', StockMovementViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

