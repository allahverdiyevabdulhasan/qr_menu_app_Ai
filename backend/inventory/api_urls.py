from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .api_views import InventoryItemViewSet, ProductIngredientViewSet, StockMovementViewSet

router = SimpleRouter()
router.register(r'inventoryitems', InventoryItemViewSet, basename='inventoryitems')
router.register(r'productingredients', ProductIngredientViewSet, basename='productingredients')
router.register(r'stockmovements', StockMovementViewSet, basename='stockmovements')

urlpatterns = [
    path('', include(router.urls)),
]
