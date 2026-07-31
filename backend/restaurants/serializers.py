from rest_framework import serializers
from .models import Restaurant, Branch, RestaurantSettings

class RestaurantSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantSettings
        fields = '__all__'

class BranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branch
        fields = '__all__'

class RestaurantSerializer(serializers.ModelSerializer):
    settings = RestaurantSettingsSerializer(read_only=True)
    branches = BranchSerializer(many=True, read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            'id', 'owner', 'name', 'slug', 'industry', 'custom_domain', 'logo', 'description', 
            'address', 'phone', 'email', 'tax_number', 'default_language', 
            'currency', 'opening_hours', 'status', 'subscription_plan',
            'average_rating', 'review_count', 'settings', 'branches', 'created_at', 'updated_at'
        ]
