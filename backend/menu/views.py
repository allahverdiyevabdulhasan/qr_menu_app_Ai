from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from .models import Category, Product, ModifierGroup, ProductModifier, ProductOption, ProductIngredient
from .serializers import CategorySerializer, ProductSerializer, ModifierGroupSerializer, ProductModifierSerializer, ProductOptionSerializer, ProductIngredientSerializer

class CategoryViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ModifierGroupViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = ModifierGroup.objects.all()
    serializer_class = ModifierGroupSerializer

class ProductModifierViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = ProductModifier.objects.all()
    serializer_class = ProductModifierSerializer

class ProductOptionViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = ProductOption.objects.all()
    serializer_class = ProductOptionSerializer

class ProductIngredientViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = ProductIngredient.objects.all()
    serializer_class = ProductIngredientSerializer
