from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .api_views import CategoryViewSet, ProductViewSet, ModifierGroupViewSet, ProductModifierViewSet, ProductOptionViewSet, ProductIngredientViewSet

router = SimpleRouter()
router.register(r'categorys', CategoryViewSet, basename='categorys')
router.register(r'products', ProductViewSet, basename='products')
router.register(r'modifiergroups', ModifierGroupViewSet, basename='modifiergroups')
router.register(r'productmodifiers', ProductModifierViewSet, basename='productmodifiers')
router.register(r'productoptions', ProductOptionViewSet, basename='productoptions')
router.register(r'productingredients', ProductIngredientViewSet, basename='productingredients')

urlpatterns = [
    path('', include(router.urls)),
]
