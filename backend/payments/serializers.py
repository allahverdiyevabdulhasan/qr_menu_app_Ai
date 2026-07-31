from rest_framework import serializers
from .models import ZReport, Payment

class ZReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZReport
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
