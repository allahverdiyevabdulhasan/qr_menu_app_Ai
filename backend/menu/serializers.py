from rest_framework import serializers
from .models import Category, Product, ModifierGroup, ProductModifier, ProductOption, ProductIngredient

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'
        extra_kwargs = {'restaurant': {'required': False}}

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        extra_kwargs = {'restaurant': {'required': False}}

class ModifierGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModifierGroup
        fields = '__all__'
        extra_kwargs = {'restaurant': {'required': False}}

class ProductModifierSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductModifier
        fields = '__all__'

class ProductOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductOption
        fields = '__all__'

class ProductIngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductIngredient
        fields = '__all__'

