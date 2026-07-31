from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from .models import RestaurantTable, TableReservation, WaiterCall
from .serializers import RestaurantTableSerializer, TableReservationSerializer, WaiterCallSerializer

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from orders.models import Order
from decimal import Decimal

from django.db import IntegrityError

class RestaurantTableViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = RestaurantTable.objects.all()
    serializer_class = RestaurantTableSerializer

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except IntegrityError:
            return Response(
                {"error": "Bu masa nömrəsi artıq mövcuddur."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    def destroy(self, request, *args, **kwargs):
        table = self.get_object()
        has_active_orders = table.orders.exclude(status__in=['COMPLETED', 'CANCELLED', 'REFUNDED']).exists()
        
        if table.status == 'OCCUPIED' or has_active_orders:
            return Response(
                {"error": "Dolu masayı silemezsiniz. Lütfen silmeden önce siparişi başka bir masaya taşıyın veya hesabı kapatın."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'])
    def merge(self, request, pk=None):
        source_table = self.get_object()
        target_table_id = request.data.get('target_table_id')
        
        if not target_table_id:
            return Response({'error': 'target_table_id is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        target_table = get_object_or_404(RestaurantTable, pk=target_table_id, restaurant=source_table.restaurant)
        
        if source_table.id == target_table.id:
            return Response({'error': 'Cannot merge table to itself'}, status=status.HTTP_400_BAD_REQUEST)

        source_order = source_table.orders.exclude(status__in=['COMPLETED', 'CANCELLED', 'REFUNDED']).first()
        target_order = target_table.orders.exclude(status__in=['COMPLETED', 'CANCELLED', 'REFUNDED']).first()

        if not source_order:
            return Response({'error': 'Source table has no active order'}, status=status.HTTP_400_BAD_REQUEST)

        if target_order:
            # Move items to target order
            source_order.items.update(order=target_order)
            
            # Recalculate target order totals
            subtotal = sum(item.total_price for item in target_order.items.all())
            target_order.subtotal = subtotal
            target_order.tax_amount = subtotal * Decimal('0.10') # Mock 10%
            target_order.total_amount = target_order.subtotal + target_order.tax_amount
            target_order.save()
            
            source_order.status = 'CANCELLED'
            source_order.cancellation_reason = f"Merged into table {target_table.table_number}"
            source_order.save()
        else:
            # Just move the source order to the target table
            source_order.table = target_table
            source_order.save()

        source_table.status = 'AVAILABLE'
        source_table.save()
        
        target_table.status = 'OCCUPIED'
        target_table.save()

        return Response({'status': 'merged_successfully'})

class TableReservationViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = TableReservation.objects.all()
    serializer_class = TableReservationSerializer

class WaiterCallViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = WaiterCall.objects.all()
    serializer_class = WaiterCallSerializer
