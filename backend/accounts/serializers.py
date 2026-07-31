from rest_framework import serializers
from .models import CustomRole, User
from restaurants.serializers import RestaurantSettingsSerializer

class CustomRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomRole
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    restaurant_settings = serializers.SerializerMethodField()
    restaurant_currency = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = '__all__'

    def get_restaurant_settings(self, obj):
        if obj.restaurant and hasattr(obj.restaurant, 'settings'):
            return RestaurantSettingsSerializer(obj.restaurant.settings).data
        return None

    def get_restaurant_currency(self, obj):
        if obj.restaurant:
            return obj.restaurant.currency
        return 'USD'
