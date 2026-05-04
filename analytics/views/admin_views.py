from django.views.generic import TemplateView
from restaurants.views import RestaurantAccessMixin
from accounts.decorators import role_required
from django.utils.decorators import method_decorator
from django.utils import timezone
from datetime import timedelta
from analytics.services import (
    get_revenue_metrics, get_order_metrics, get_payment_metrics,
    get_net_profit, get_top_products, get_sales_by_hour, get_customer_metrics
)
from orders.models import Order
from analytics.forms import DateRangeFilterForm

class AnalyticsBaseView(RestaurantAccessMixin, TemplateView):
    @method_decorator(role_required(['SUPER_ADMIN', 'RESTAURANT_OWNER', 'MANAGER', 'CASHIER']))
    def dispatch(self, request, *args, **kwargs):
        user = request.user
        if user.is_cashier and not user.can_view_analytics:
            from django.core.exceptions import PermissionDenied
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        form = DateRangeFilterForm(self.request.GET or None)
        
        if form.is_valid():
            start_date, end_date = form.get_date_range()
        else:
            # Default to today
            now = timezone.now()
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = now
            
        context['form'] = form
        context['start_date'] = start_date
        context['end_date'] = end_date
        context['restaurant'] = self.request.user.restaurant
        return context

class AnalyticsDashboardView(AnalyticsBaseView):
    template_name = 'analytics/analytics_dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        r = context['restaurant']
        
        # Today vs Yesterday quick metrics
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        yesterday_start = today_start - timedelta(days=1)
        
        u = self.request.user
        
        if not u.is_cashier or u.can_view_daily_revenue:
            context['today_revenue'] = get_revenue_metrics(r, today_start, now)
            context['yesterday_revenue'] = get_revenue_metrics(r, yesterday_start, today_start)
        else:
            context['today_revenue'] = context['yesterday_revenue'] = None

        if not u.is_cashier or u.can_view_net_profit:
            context['net_profit'] = get_net_profit(r, context['start_date'], context['end_date'])
        else:
            context['net_profit'] = None
        
        order_metrics = get_order_metrics(r, context['start_date'], context['end_date'])
        context.update(order_metrics)
        
        context['top_products'] = get_top_products(r, context['start_date'], context['end_date'], limit=5)
        
        # Operational Stats
        from tables.models import RestaurantTable, TableReservation
        context['active_tables_count'] = RestaurantTable.objects.filter(restaurant=r, status='OCCUPIED').count()
        context['preparing_orders_count'] = Order.objects.filter(restaurant=r, status='PREPARING').count()
        context['pending_reservations_count'] = TableReservation.objects.filter(restaurant=r, status='PENDING').count()
        
        # Chart Data
        payment_metrics = get_payment_metrics(r, context['start_date'], context['end_date'])
        context['payment_labels'] = list(payment_metrics.keys())
        context['payment_data'] = list(payment_metrics.values())
        
        return context

class RevenueReportView(AnalyticsBaseView):
    template_name = 'analytics/revenue_report.html'
    
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_cashier and not request.user.can_view_daily_revenue:
            from django.core.exceptions import PermissionDenied
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        r = context['restaurant']
        
        context['revenue'] = get_revenue_metrics(r, context['start_date'], context['end_date'])
        context['payment_metrics'] = get_payment_metrics(r, context['start_date'], context['end_date'])
        order_metrics = get_order_metrics(r, context['start_date'], context['end_date'])
        
        context['dine_in_revenue'] = order_metrics['dine_in_revenue']
        context['takeaway_revenue'] = order_metrics['takeaway_revenue']
        context['pre_order_revenue'] = order_metrics['pre_order_revenue']
        
        return context

class ProductReportView(AnalyticsBaseView):
    template_name = 'analytics/product_report.html'
    
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_cashier and not request.user.can_view_analytics:
            from django.core.exceptions import PermissionDenied
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        r = context['restaurant']
        
        context['top_products'] = get_top_products(r, context['start_date'], context['end_date'], limit=10)
        context['low_products'] = get_top_products(r, context['start_date'], context['end_date'], limit=10, ascending=True)
        return context

class NetProfitReportView(AnalyticsBaseView):
    template_name = 'analytics/net_profit_report.html'
    
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_cashier and not request.user.can_view_net_profit:
            from django.core.exceptions import PermissionDenied
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        r = context['restaurant']
        
        context['revenue'] = get_revenue_metrics(r, context['start_date'], context['end_date'])
        context['net_profit'] = get_net_profit(r, context['start_date'], context['end_date'])
        context['costs'] = context['revenue'] - context['net_profit'] # Simplified visualization
        
        return context
