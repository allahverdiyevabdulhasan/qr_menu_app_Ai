from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Category, Product, ModifierGroup, ProductModifier, ProductOption, ProductIngredient
from .serializers import CategorySerializer, ProductSerializer, ModifierGroupSerializer, ProductModifierSerializer, ProductOptionSerializer, ProductIngredientSerializer

class CategoryViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Category.objects.all()

class ProductViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Product.objects.all()

class ModifierGroupViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = ModifierGroupSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return ModifierGroup.objects.all()

class ProductModifierViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = ProductModifierSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return ProductModifier.objects.all()

class ProductOptionViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = ProductOptionSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return ProductOption.objects.all()

class ProductIngredientViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = ProductIngredientSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return ProductIngredient.objects.all()

