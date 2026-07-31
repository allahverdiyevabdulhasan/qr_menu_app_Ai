from rest_framework import serializers
from .models import LoyaltyRule, LoyaltyTransaction, LoyaltyReward, CustomerLevel

class LoyaltyRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltyRule
        fields = '__all__'
        read_only_fields = ['restaurant']

class LoyaltyTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltyTransaction
        fields = '__all__'

class LoyaltyRewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoyaltyReward
        fields = '__all__'
        read_only_fields = ['restaurant']

class CustomerLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerLevel
        fields = '__all__'
        read_only_fields = ['restaurant']

