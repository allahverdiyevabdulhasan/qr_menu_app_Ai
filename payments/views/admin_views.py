from django.shortcuts import get_object_or_404, redirect
from django.views import View
from django.views.generic import ListView, DetailView, TemplateView
from django.utils import timezone
from django.db.models import Sum
from restaurants.views import RestaurantAccessMixin
from orders.models import Order
from payments.models import Payment
from accounts.decorators import role_required
from django.utils.decorators import method_decorator

class PaymentListView(RestaurantAccessMixin, ListView):
    model = Payment
    template_name = 'payments/payment_list.html'
    context_object_name = 'payments'

    @method_decorator(role_required(['SUPER_ADMIN', 'RESTAURANT_OWNER', 'MANAGER', 'CASHIER']))
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self):
        return Payment.objects.filter(restaurant=self.request.user.restaurant).order_by('-created_at')

class PaymentDetailView(RestaurantAccessMixin, DetailView):
    model = Payment
    template_name = 'payments/payment_detail.html'
    context_object_name = 'payment'

    @method_decorator(role_required(['SUPER_ADMIN', 'RESTAURANT_OWNER', 'MANAGER', 'CASHIER']))
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self):
        return Payment.objects.filter(restaurant=self.request.user.restaurant)


class PaymentCreateView(RestaurantAccessMixin, View):
    @method_decorator(role_required(['SUPER_ADMIN', 'RESTAURANT_OWNER', 'MANAGER', 'CASHIER']))
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, order_id, *args, **kwargs):
        order = get_object_or_404(Order, pk=order_id, restaurant=request.user.restaurant)
        amount = request.POST.get('amount')
        method = request.POST.get('method', 'CASH')
        
        if not amount:
            amount = order.total_amount # Full payment assumption if empty
            
        Payment.objects.create(
            order=order,
            restaurant=order.restaurant,
            amount=amount,
            method=method,
            status='PAID',
            paid_at=timezone.now()
        )
        
        # Close the order
        if request.POST.get('close_order') == 'true':
            order.status = 'COMPLETED'
            order.save()
            
        messages.success(request, f"Payment recorded for Order #{order.order_number}")
        return redirect(request.META.get('HTTP_REFERER', 'order_list'))

class RefundPaymentView(RestaurantAccessMixin, View):
    @method_decorator(role_required(['SUPER_ADMIN', 'RESTAURANT_OWNER', 'MANAGER', 'CASHIER']))
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, pk, *args, **kwargs):
        payment = get_object_or_404(Payment, pk=pk, restaurant=request.user.restaurant)
        
        if payment.status == 'PAID':
            payment.status = 'REFUNDED'
            payment.save()
            
        return redirect(request.META.get('HTTP_REFERER', 'payment_list'))

class DailyPaymentSummaryView(RestaurantAccessMixin, TemplateView):
    template_name = 'payments/daily_payment_summary.html'

    @method_decorator(role_required(['SUPER_ADMIN', 'RESTAURANT_OWNER', 'MANAGER', 'CASHIER']))
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        today = timezone.now().date()
        payments = Payment.objects.filter(
            restaurant=self.request.user.restaurant,
            status='PAID',
            paid_at__date=today
        )
        
        # Aggregate by method
        summary = payments.values('method').annotate(total=Sum('amount'))
        context['summary'] = summary
        context['total_today'] = payments.aggregate(total=Sum('amount'))['total'] or 0
        context['today'] = today
        return context
