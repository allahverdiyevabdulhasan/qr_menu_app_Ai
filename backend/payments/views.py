from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from decimal import Decimal
from orders.models import Order
from .models import ZReport, Payment
from .serializers import ZReportSerializer, PaymentSerializer

class ZReportViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = ZReport.objects.all()
    serializer_class = ZReportSerializer

    @action(detail=False, methods=['post'])
    def generate_z_report(self, request):
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')
        restaurant = request.user.restaurant

        if not start_time or not end_time:
            return Response({"error": "start_time and end_time are required"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            orders = Order.objects.filter(
                restaurant=restaurant,
                z_report__isnull=True,
                status__in=['COMPLETED', 'CANCELLED'],
                created_at__gte=start_time,
                created_at__lte=end_time
            )

            # Calculate totals
            net_sales = Decimal('0.00')
            total_discount = Decimal('0.00')
            cash = Decimal('0.00')
            card = Decimal('0.00')
            meal_card = Decimal('0.00')
            online = Decimal('0.00')
            completed = 0
            cancelled = 0

            for order in orders:
                if order.status == 'COMPLETED':
                    completed += 1
                    net_sales += order.total_amount
                    total_discount += order.discount_amount
                    for payment in order.payments.filter(status='PAID'):
                        if payment.method == 'CASH':
                            cash += payment.amount
                        elif payment.method == 'CARD':
                            card += payment.amount
                        elif payment.method == 'MEAL_CARD':
                            meal_card += payment.amount
                        elif payment.method == 'ONLINE':
                            online += payment.amount
                elif order.status == 'CANCELLED':
                    cancelled += 1

            # Get next z_number
            last_z = ZReport.objects.filter(restaurant=restaurant).order_by('-z_number').first()
            z_number = last_z.z_number + 1 if last_z else 1

            z_report = ZReport.objects.create(
                restaurant=restaurant,
                staff=request.user,
                z_number=z_number,
                start_time=start_time,
                end_time=end_time,
                gross_sales=net_sales + total_discount,
                total_discount=total_discount,
                net_sales=net_sales,
                cash_total=cash,
                card_total=card,
                meal_card_total=meal_card,
                online_total=online,
                completed_orders_count=completed,
                cancelled_orders_count=cancelled
            )

            orders.update(z_report=z_report)
            Payment.objects.filter(order__in=orders).update(z_report=z_report)

        return Response(self.get_serializer(z_report).data)

class PaymentViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
