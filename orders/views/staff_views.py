from decimal import Decimal
from django.utils.translation import gettext as _
from django.shortcuts import get_object_or_404, redirect
from django.views import View
from django.views.generic import ListView, DetailView, TemplateView, CreateView
from restaurants.views import RestaurantAccessMixin
from orders.models import Order, OrderItem
from menu.models import Product
from tables.models import RestaurantTable
from accounts.decorators import role_required
from django.utils.decorators import method_decorator
from django.urls import reverse_lazy
from ..utils import broadcast_order_update, log_order_status_change
from invoices.services import create_invoice_from_order

class OrderListView(RestaurantAccessMixin, ListView):
    model = Order
    template_name = 'orders/staff/order_list.html'
    context_object_name = 'orders'

    def get_queryset(self):
        return Order.objects.filter(restaurant=self.request.user.restaurant).order_by('-created_at')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from django.utils import timezone
        from datetime import timedelta
        from django.db.models import Sum
        from payments.models import Payment
        
        restaurant = self.request.user.restaurant
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        
        # Today's Orders (all orders placed today)
        context['today_orders_count'] = Order.objects.filter(
            restaurant=restaurant,
            created_at__gte=today_start,
            created_at__lte=today_end
        ).count()
        
        # Mutfaktaki Siparişler (orders in NEW, ACCEPTED, PREPARING today)
        context['kitchen_orders_count'] = Order.objects.filter(
            restaurant=restaurant,
            status__in=['NEW', 'ACCEPTED', 'PREPARING'],
            created_at__gte=today_start,
            created_at__lte=today_end
        ).count()
        
        # Tamamlananlar (completed orders today)
        context['completed_orders_count'] = Order.objects.filter(
            restaurant=restaurant,
            status='COMPLETED',
            created_at__gte=today_start,
            created_at__lte=today_end
        ).count()
        
        # Bugünün Cirosu (calculated from PAID payments today)
        context['today_revenue_total'] = Payment.objects.filter(
            restaurant=restaurant,
            status='PAID',
            created_at__gte=today_start,
            created_at__lte=today_end
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        return context

class OrderDetailView(RestaurantAccessMixin, DetailView):
    model = Order
    template_name = 'orders/staff/order_detail.html'
    context_object_name = 'order'

    def get_queryset(self):
        return Order.objects.filter(restaurant=self.request.user.restaurant)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['products'] = Product.objects.filter(restaurant=self.request.user.restaurant, is_active=True)
        return context

class KitchenScreenView(RestaurantAccessMixin, ListView):
    model = Order
    template_name = 'orders/staff/kitchen_screen.html'
    context_object_name = 'orders'

    @method_decorator(role_required(['SUPER_ADMIN', 'RESTAURANT_OWNER', 'MANAGER', 'KITCHEN_STAFF']))
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self):
        # Kitchen only sees active orders that need prep
        return Order.objects.filter(
            restaurant=self.request.user.restaurant,
            status__in=['NEW', 'ACCEPTED', 'PREPARING']
        ).order_by('-created_at')

class WaiterPanelView(RestaurantAccessMixin, ListView):
    model = Order
    template_name = 'orders/staff/waiter_panel.html'
    context_object_name = 'orders'

    @method_decorator(role_required(['SUPER_ADMIN', 'RESTAURANT_OWNER', 'MANAGER', 'WAITER']))
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self):
        return Order.objects.filter(
            restaurant=self.request.user.restaurant,
            status__in=['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED']
        ).order_by('-created_at')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from tables.models import WaiterCall, TableReservation
        restaurant = self.request.user.restaurant
        orders = self.get_queryset()
        context['pending_approval_count'] = orders.filter(status='NEW').count()
        context['preparing_count'] = orders.filter(status__in=['ACCEPTED', 'PREPARING']).count()
        context['ready_count'] = orders.filter(status='READY').count()
        context['waiter_calls'] = WaiterCall.objects.filter(restaurant=restaurant, is_active=True).order_by('-created_at')
        context['reservations'] = TableReservation.objects.filter(restaurant=restaurant, status='PENDING').order_by('reservation_time')
        return context

class CashierPanelView(RestaurantAccessMixin, ListView):
    model = Order
    template_name = 'orders/staff/cashier_panel.html'
    context_object_name = 'orders'

    @method_decorator(role_required(['SUPER_ADMIN', 'RESTAURANT_OWNER', 'MANAGER', 'CASHIER']))
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self):
        return Order.objects.filter(
            restaurant=self.request.user.restaurant,
        ).exclude(status__in=['COMPLETED', 'CANCELLED', 'REFUNDED']).order_by('-created_at')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from tables.models import TableReservation
        from django.db.models import Sum
        from payments.models import Payment
        from decimal import Decimal
        from django.utils import timezone
        
        restaurant = self.request.user.restaurant
        context['pending_reservations'] = TableReservation.objects.filter(
            restaurant=restaurant, status='PENDING'
        ).order_by('reservation_time')
        
        # Calculate Toplam Kasa Değeri (Today's Total Paid Payments)
        today = timezone.now().date()
        today_payments = Payment.objects.filter(
            order__restaurant=restaurant,
            status='PAID',
            created_at__date=today
        )
        context['total_active_value'] = today_payments.aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        return context




class OrderStatusUpdateView(RestaurantAccessMixin, View):
    def post(self, request, pk, *args, **kwargs):
        order = get_object_or_404(Order, pk=pk, restaurant=request.user.restaurant)
        new_status = request.POST.get('status')
        prep_time = request.POST.get('estimated_prep_time')
        
        # Simple validation
        valid_statuses = [c[0] for c in Order.STATUS_CHOICES]
        if new_status in valid_statuses:
            old_status = order.status
            order.status = new_status
            log_order_status_change(order, old_status, new_status, user=request.user)
            
        if prep_time:
            try:
                order.estimated_prep_time = int(prep_time)
            except (ValueError, TypeError):
                pass
                
        order.save()
        
        # Auto-generate invoice and payment if completed
        if order.status == 'COMPLETED':
            from django.utils import timezone
            from payments.models import Payment
            if not Payment.objects.filter(order=order, status='PAID').exists():
                Payment.objects.create(
                    order=order,
                    restaurant=order.restaurant,
                    amount=order.total_amount,
                    method='CASH',  # Default to cash on manual completion
                    status='PAID',
                    paid_at=timezone.now()
                )
            # Reload order object to pick up signal changes
            order.refresh_from_db()
            create_invoice_from_order(order)
            
        broadcast_order_update(order)
            
        return redirect(request.META.get('HTTP_REFERER', 'order_list'))

class StaffOrderCreateView(RestaurantAccessMixin, TemplateView):
    template_name = 'orders/staff/order_create.html'

    @method_decorator(role_required(['SUPER_ADMIN', 'RESTAURANT_OWNER', 'MANAGER', 'WAITER', 'CASHIER']))
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        restaurant = self.request.user.restaurant
        context['tables'] = RestaurantTable.objects.filter(restaurant=restaurant, is_active=True)
        context['products'] = Product.objects.filter(restaurant=restaurant, is_active=True)
        return context

    def post(self, request, *args, **kwargs):
        restaurant = request.user.restaurant
        table_id = request.POST.get('table')
        order_type = request.POST.get('order_type', 'DINE_IN')
        note = request.POST.get('note', '')
        
        # Simple implementation for now: products are passed as product_id:quantity pairs
        product_data = request.POST.getlist('products') # list of "id,qty"
        
        if not product_data:
            return redirect('staff_order_create')

        table = None
        if table_id:
            table = get_object_or_404(RestaurantTable, pk=table_id, restaurant=restaurant)

        order = Order.objects.create(
            restaurant=restaurant,
            table=table,
            order_type=order_type,
            note=note,
            created_by=request.user,
            status='NEW' # This will make it show in kitchen
        )

        total_amount = 0
        for item in product_data:
            pid, qty = item.split(',')
            product = get_object_or_404(Product, pk=pid, restaurant=restaurant)
            qty = int(qty)
            if qty > 0:
                line_total = product.price * qty
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name_snapshot=product.name,
                    quantity=qty,
                    unit_price=product.price,
                    snapshot_selling_price=product.price,
                    snapshot_cost_price=getattr(product, 'cost_price', None) or Decimal('0.00'),
                    total_price=line_total
                )
                total_amount += line_total
        
        order.subtotal = total_amount
        order.total_amount = total_amount
        order.save()
        
        broadcast_order_update(order, message=_("New order received!"), call_type='new_order')

        if request.user.is_waiter:
            return redirect('waiter_panel')
        elif request.user.is_cashier:
            return redirect('cashier_panel')
        return redirect('order_list')

class OrderItemUpdateView(RestaurantAccessMixin, View):
    @method_decorator(role_required(['SUPER_ADMIN', 'RESTAURANT_OWNER', 'MANAGER', 'WAITER', 'CASHIER']))
    def post(self, request, pk, *args, **kwargs):
        item = get_object_or_404(OrderItem, pk=pk, order__restaurant=request.user.restaurant)
        quantity = int(request.POST.get('quantity', item.quantity))
        note = request.POST.get('note', item.note)
        removed_ingredients = request.POST.getlist('removed_ingredients')
        
        if quantity > 0:
            item.quantity = quantity
            item.note = note
            # Update selected options JSON
            options = item.selected_options.get('options', [])
            item.selected_options = {
                'options': options,
                'removed_ingredients': removed_ingredients
            }
            item.total_price = item.unit_price * quantity
            item.save()
            
            # Update order total
            order = item.order
            order.subtotal = sum(i.total_price for i in order.items.all())
            # Simple tax/service re-calc
            order.tax_amount = order.subtotal * Decimal('0.08')
            if order.order_type == 'DINE_IN':
                order.service_charge = order.subtotal * Decimal('0.10')
            order.total_amount = order.subtotal + order.tax_amount + order.service_charge - order.discount_amount
            order.save()
            broadcast_order_update(order, message=_("Order items updated"), call_type='edit')
            
        return redirect(request.META.get('HTTP_REFERER', 'order_list'))

class OrderItemDeleteView(RestaurantAccessMixin, View):
    @method_decorator(role_required(['SUPER_ADMIN', 'RESTAURANT_OWNER', 'MANAGER', 'WAITER', 'CASHIER']))
    def post(self, request, pk, *args, **kwargs):
        item = get_object_or_404(OrderItem, pk=pk, order__restaurant=request.user.restaurant)
        order = item.order
        item.delete()
        
        # Update order total
        order.subtotal = sum(i.total_price for i in order.items.all())
        order.tax_amount = order.subtotal * Decimal('0.08')
        if order.order_type == 'DINE_IN':
            order.service_charge = order.subtotal * Decimal('0.10')
        order.total_amount = order.subtotal + order.tax_amount + order.service_charge - order.discount_amount
        order.save()
        broadcast_order_update(order, message=_("Order item removed"), call_type='edit')
        
        return redirect(request.META.get('HTTP_REFERER', 'order_list'))

class WaiterCallClearView(RestaurantAccessMixin, View):
    def post(self, request, pk, *args, **kwargs):
        from tables.models import WaiterCall
        call = get_object_or_404(WaiterCall, pk=pk, restaurant=request.user.restaurant)
        call.is_active = False
        call.save()
        return redirect('waiter_panel')

class OrderAddItemView(RestaurantAccessMixin, View):
    @method_decorator(role_required(['SUPER_ADMIN', 'RESTAURANT_OWNER', 'MANAGER', 'WAITER', 'CASHIER']))
    def post(self, request, pk, *args, **kwargs):
        order = get_object_or_404(Order, pk=pk, restaurant=request.user.restaurant)
        product_id = request.POST.get('product_id')
        quantity = int(request.POST.get('quantity', 1))
        product = get_object_or_404(Product, pk=product_id, restaurant=request.user.restaurant)
        
        # Create or update OrderItem
        item, created = OrderItem.objects.get_or_create(
            order=order,
            product=product,
            defaults={
                'product_name_snapshot': product.name,
                'unit_price': product.price,
                'snapshot_selling_price': product.price,
                'snapshot_cost_price': getattr(product, 'cost_price', None) or Decimal('0.00'),
                'total_price': 0
            }
        )
        
        if not created:
            item.quantity += quantity
        else:
            item.quantity = quantity
            
        item.total_price = item.unit_price * item.quantity
        item.save()
        
        # Update order total
        order.subtotal = sum(i.total_price for i in order.items.all())
        order.tax_amount = order.subtotal * Decimal('0.08')
        if order.order_type == 'DINE_IN':
            order.service_charge = order.subtotal * Decimal('0.10')
        order.total_amount = order.subtotal + order.tax_amount + order.service_charge - order.discount_amount
        order.save()
        
        broadcast_order_update(order, message=f"Added {product.name} to Order #{order.order_number}", call_type='edit')
        
        return redirect(request.META.get('HTTP_REFERER', 'order_detail'))

class NotificationAPIView(View):
    def get(self, request, *args, **kwargs):
        from django.http import JsonResponse
        if not request.user.is_authenticated:
            return JsonResponse({'count': 0, 'calls': [], 'orders': []})
        
        restaurant = getattr(request.user, 'restaurant', None)
        if not restaurant:
            return JsonResponse({'count': 0, 'calls': [], 'orders': []})
            
        from tables.models import WaiterCall
        from orders.models import Order
        
        waiter_calls = WaiterCall.objects.filter(restaurant=restaurant, is_active=True).select_related('table').order_by('-created_at')
        pending_orders = Order.objects.filter(restaurant=restaurant, status='NEW').order_by('-created_at')
        
        calls_data = []
        for c in waiter_calls[:5]:
            calls_data.append({
                'id': c.id,
                'table_number': c.table.table_number,
                'created_at': c.created_at.strftime('%H:%M')
            })
            
        orders_data = []
        for o in pending_orders[:5]:
            orders_data.append({
                'id': o.id,
                'table_number': o.table.table_number if o.table else None,
                'created_at': o.created_at.strftime('%H:%M')
            })
            
        total_count = waiter_calls.count() + pending_orders.count()
        
        return JsonResponse({
            'count': total_count,
            'calls': calls_data,
            'orders': orders_data
        })
