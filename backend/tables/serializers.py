from rest_framework import serializers
from .models import RestaurantTable, TableReservation, WaiterCall

class RestaurantTableSerializer(serializers.ModelSerializer):
    active_order_id = serializers.SerializerMethodField()

    class Meta:
        model = RestaurantTable
        fields = '__all__'
        extra_kwargs = {'restaurant': {'required': False}}
        validators = []

    def get_active_order_id(self, obj):
        # Find any order that isn't completed/cancelled/refunded
        active_order = obj.orders.exclude(status__in=['COMPLETED', 'CANCELLED', 'REFUNDED']).first()
        return active_order.id if active_order else None

class TableReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TableReservation
        fields = '__all__'
        extra_kwargs = {'restaurant': {'required': False}}

class WaiterCallSerializer(serializers.ModelSerializer):
    class Meta:
        model = WaiterCall
        fields = '__all__'
        extra_kwargs = {'restaurant': {'required': False}}

