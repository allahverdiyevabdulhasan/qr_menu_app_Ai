from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal
from .models import Order, OrderItem, OrderStageHistory
from .serializers import OrderSerializer, OrderItemSerializer, OrderStageHistorySerializer
from menu.models import Product

class OrderViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        hide_z_reported = self.request.query_params.get('hide_z_reported')
        
        if start_date:
            qs = qs.filter(created_at__gte=start_date)
        if end_date:
            qs = qs.filter(created_at__lte=end_date)
            
        if hide_z_reported and hide_z_reported.lower() == 'true':
            qs = qs.filter(z_report__isnull=True)
            
        only_z_reported = self.request.query_params.get('only_z_reported')
        if only_z_reported and only_z_reported.lower() == 'true':
            qs = qs.filter(z_report__isnull=False)
            
        return qs

    def list(self, request, *args, **kwargs):
        try:
            response = super().list(request, *args, **kwargs)
            if response.status_code >= 400:
                with open('order_400.log', 'a') as f:
                    f.write(f"400 Response in list: {response.data}\n")
            return response
        except Exception as e:
            import traceback
            with open('order_400.log', 'a') as f:
                f.write(f"Exception in list: {traceback.format_exc()}\n")
            raise e

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            import traceback
            traceback_str = traceback.format_exc()
            print("ORDER CREATE ERROR:", traceback_str)
            return Response({'error': str(e), 'traceback': traceback_str}, status=status.HTTP_400_BAD_REQUEST)

    def perform_update(self, serializer):
        instance = serializer.save()
        if instance.status in ['COMPLETED', 'CANCELLED', 'REFUNDED'] and instance.table:
            active_orders = instance.table.orders.exclude(status__in=['COMPLETED', 'CANCELLED', 'REFUNDED']).count()
            if active_orders == 0:
                instance.table.status = 'AVAILABLE'
                instance.table.save()

    @action(detail=True, methods=['post'])
    def add_items(self, request, pk=None):
        try:
            order = self.get_object()
            items_data = request.data.get('items', [])
            
            if not items_data:
                return Response({'error': 'No items provided'}, status=status.HTTP_400_BAD_REQUEST)
                
            for item_data in items_data:
                product_id = item_data.get('product')
                quantity = Decimal(str(item_data.get('quantity', 1)))
                unit_price = Decimal(str(item_data.get('unit_price', 0)))
                total_price = Decimal(str(item_data.get('total_price', 0)))
                note = item_data.get('note', '')
                
                product = Product.objects.filter(id=product_id).first() if product_id else None
                
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name_snapshot=product.name if product else 'Bilinməyən Məhsul',
                    snapshot_selling_price=product.price if product else unit_price,
                    snapshot_cost_price=None,
                    quantity=quantity,
                    unit_price=unit_price,
                    total_price=total_price,
                    note=note
                )
                
            # Recalculate order total
            total = sum(item.total_price for item in order.items.all())
            order.subtotal = total
            order.total_amount = total # Ignoring tax/discount for now as requested
            order.save()
            
            serializer = self.get_serializer(order)
            return Response(serializer.data)
        except Exception as e:
            import traceback
            traceback_str = traceback.format_exc()
            print("ORDER ADD_ITEMS ERROR:", traceback_str)
            return Response({'error': str(e), 'traceback': traceback_str}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def remove_item(self, request, pk=None):
        try:
            order = self.get_object()
            item_id = request.data.get('item_id')
            if not item_id:
                return Response({'error': 'No item_id provided'}, status=status.HTTP_400_BAD_REQUEST)
                
            item = order.items.filter(id=item_id).first()
            if not item:
                return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)
                
            item.delete()
            
            # Recalculate order total
            total = sum(i.total_price for i in order.items.all())
            order.subtotal = total
            
            final_total = total - order.discount_amount
            if final_total < 0:
                final_total = Decimal('0.00')
            order.total_amount = final_total
            order.save()
            
            serializer = self.get_serializer(order)
            return Response(serializer.data)
        except Exception as e:
            import traceback
            traceback_str = traceback.format_exc()
            print("ORDER REMOVE_ITEM ERROR:", traceback_str)
            return Response({'error': str(e), 'traceback': traceback_str}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def split_order(self, request, pk=None):
        from django.db import transaction
        from tables.models import RestaurantTable
        from decimal import Decimal
        try:
            source_order = self.get_object()
            target_table_id = request.data.get('target_table_id')
            items_to_move = request.data.get('items', [])
            
            if not target_table_id:
                return Response({'error': 'Hedef masa belirtilmedi.'}, status=status.HTTP_400_BAD_REQUEST)
            if not items_to_move:
                return Response({'error': 'Taşınacak ürün belirtilmedi.'}, status=status.HTTP_400_BAD_REQUEST)
                
            target_table = RestaurantTable.objects.get(id=target_table_id)
            
            with transaction.atomic():
                # Find or create active order for target table
                target_order = target_table.orders.exclude(status__in=['COMPLETED', 'CANCELLED', 'REFUNDED']).first()
                if not target_order:
                    target_order = Order.objects.create(
                        restaurant=source_order.restaurant,
                        branch=source_order.branch,
                        table=target_table,
                        order_type='DINE_IN',
                        status='NEW'
                    )
                    target_table.status = 'OCCUPIED'
                    target_table.save()

                for item_data in items_to_move:
                    item_id = item_data.get('item_id')
                    move_quantity = Decimal(str(item_data.get('quantity', 0)))
                    
                    if move_quantity <= 0:
                        continue
                        
                    source_item = source_order.items.filter(id=item_id).first()
                    if not source_item:
                        continue
                        
                    if move_quantity >= source_item.quantity:
                        # Move entire item
                        source_item.order = target_order
                        source_item.save()
                    else:
                        # Split item
                        source_item.quantity -= move_quantity
                        source_item.total_price = source_item.quantity * source_item.unit_price
                        source_item.save()
                        
                        OrderItem.objects.create(
                            order=target_order,
                            product=source_item.product,
                            product_name_snapshot=source_item.product_name_snapshot,
                            quantity=move_quantity,
                            unit_price=source_item.unit_price,
                            total_price=move_quantity * source_item.unit_price,
                            note=source_item.note
                        )
                
                # Recalculate totals
                def update_order_total(order):
                    total = sum((Decimal(str(i.total_price)) for i in order.items.all()), Decimal('0.00'))
                    order.subtotal = total
                    order.total_amount = total - Decimal(str(order.discount_amount or 0))
                    if order.total_amount < Decimal('0.00'): 
                        order.total_amount = Decimal('0.00')
                    order.save()
                    
                update_order_total(source_order)
                update_order_total(target_order)
                
                # Check if source order is empty
                if not source_order.items.exists():
                    source_order.status = 'CANCELLED'
                    source_order.cancellation_reason = 'Masa aktarımı ile tamamen boşaltıldı.'
                    source_order.save()
                    if source_order.table:
                        source_order.table.status = 'AVAILABLE'
                        source_order.table.save()

            return Response({'success': True, 'message': 'Sipariş başarıyla bölündü/aktarıldı.'})
        except Exception as e:
            import traceback
            print("SPLIT ORDER ERROR:", traceback.format_exc())
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def checkout(self, request, pk=None):
        try:
            order = self.get_object()
            
            # 1. Update Discounts
            gift_discount = Decimal(str(request.data.get('gift_discount', 0)))
            general_discount = Decimal(str(request.data.get('general_discount', 0)))
            
            # Recalculate Subtotal just in case
            subtotal = sum(item.total_price for item in order.items.all())
            order.subtotal = subtotal
            
            # The total discount
            order.discount_amount = gift_discount + general_discount
            
            # Final Total Amount
            final_total = subtotal - order.discount_amount
            if final_total < 0:
                final_total = Decimal('0.00')
                
            order.total_amount = final_total
            order.save()
            
            # 2. Process Payments
            from payments.models import Payment
            payments_data = request.data.get('payments', [])
            for p in payments_data:
                amount = Decimal(str(p.get('amount', 0)))
                method = p.get('method', 'CASH')
                
                if amount > 0:
                    Payment.objects.create(
                        order=order,
                        restaurant=order.restaurant,
                        amount=amount,
                        method=method,
                        status='PAID'
                    )
            
            # The post_save signal on Payment will update order.payment_status
            order.refresh_from_db()
            
            # 3. Close order if fully paid and requested
            close_order = request.data.get('close_order', True)
            if close_order and order.payment_status == 'PAID':
                order.status = 'COMPLETED'
                order.save()
                
                # Free the table if no other active orders exist
                if order.table:
                    active_orders = order.table.orders.exclude(status__in=['COMPLETED', 'CANCELLED', 'REFUNDED']).count()
                    if active_orders == 0:
                        order.table.status = 'AVAILABLE'
                        order.table.save()
                
            serializer = self.get_serializer(order)
            return Response(serializer.data)
            
        except Exception as e:
            import traceback
            traceback_str = traceback.format_exc()
            print("ORDER CHECKOUT ERROR:", traceback_str)
            return Response({'error': str(e), 'traceback': traceback_str}, status=status.HTTP_400_BAD_REQUEST)


class OrderItemViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer

class OrderStageHistoryViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = OrderStageHistory.objects.all()
    serializer_class = OrderStageHistorySerializer

