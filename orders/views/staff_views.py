from django.shortcuts import get_object_or_404, redirect
from django.views import View
from django.views.generic import ListView, DetailView, TemplateView
from restaurants.views import RestaurantAccessMixin
from orders.models import Order
from accounts.decorators import role_required
from django.utils.decorators import method_decorator

class OrderListView(RestaurantAccessMixin, ListView):
    model = Order
    template_name = 'orders/staff/order_list.html'
    context_object_name = 'orders'

    def get_queryset(self):
        return Order.objects.filter(restaurant=self.request.user.restaurant)

class OrderDetailView(RestaurantAccessMixin, DetailView):
    model = Order
    template_name = 'orders/staff/order_detail.html'
    context_object_name = 'order'

    def get_queryset(self):
        return Order.objects.filter(restaurant=self.request.user.restaurant)

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
        ).order_by('created_at')

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
            status__in=['READY', 'SERVED']
        ).order_by('updated_at')

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



class OrderStatusUpdateView(RestaurantAccessMixin, View):
    def post(self, request, pk, *args, **kwargs):
        order = get_object_or_404(Order, pk=pk, restaurant=request.user.restaurant)
        new_status = request.POST.get('status')
        
        # Simple validation
        valid_statuses = [c[0] for c in Order.STATUS_CHOICES]
        if new_status in valid_statuses:
            order.status = new_status
            order.save()
            
        return redirect(request.META.get('HTTP_REFERER', 'order_list'))
