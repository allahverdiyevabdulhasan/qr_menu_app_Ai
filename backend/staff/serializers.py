from rest_framework import serializers
from .models import StaffProfile, Payroll, StaffShift

class StaffProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffProfile
        fields = '__all__'
        read_only_fields = ['restaurant']

class PayrollSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payroll
        fields = '__all__'
        read_only_fields = ['restaurant']

class StaffShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = StaffShift
        fields = '__all__'
        read_only_fields = ['restaurant']

