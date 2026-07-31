from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, ModifierGroupViewSet, ProductModifierViewSet, ProductOptionViewSet, ProductIngredientViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'category', CategoryViewSet)
router.register(r'product', ProductViewSet)
router.register(r'modifiergroup', ModifierGroupViewSet)
router.register(r'productmodifier', ProductModifierViewSet)
router.register(r'productoption', ProductOptionViewSet)
router.register(r'productingredient', ProductIngredientViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

