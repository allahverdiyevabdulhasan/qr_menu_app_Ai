from django.views.generic import ListView, DetailView
from django.db.models import Q
from restaurants.views import RestaurantAccessMixin
from accounts.decorators import role_required
from django.utils.decorators import method_decorator
from customers.models import Customer
from orders.models import Order

class CustomerListView(RestaurantAccessMixin, ListView):
    model = Customer
    template_name = 'customers/customer_list.html'
    context_object_name = 'customers'

    @method_decorator(role_required(['SUPER_ADMIN', 'RESTAURANT_OWNER', 'MANAGER', 'CASHIER']))
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self):
        qs = Customer.objects.filter(restaurant=self.request.user.restaurant)
        
        search = self.request.GET.get('q')
        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(phone__icontains=search) | Q(email__icontains=search))
            
        return qs

class CustomerDetailView(RestaurantAccessMixin, DetailView):
    model = Customer
    template_name = 'customers/customer_detail.html'
    context_object_name = 'customer'

    @method_decorator(role_required(['SUPER_ADMIN', 'RESTAURANT_OWNER', 'MANAGER', 'CASHIER']))
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self):
        return Customer.objects.filter(restaurant=self.request.user.restaurant)

class CustomerOrdersView(RestaurantAccessMixin, ListView):
    model = Order
    template_name = 'customers/customer_orders.html'
    context_object_name = 'orders'

    @method_decorator(role_required(['SUPER_ADMIN', 'RESTAURANT_OWNER', 'MANAGER', 'CASHIER']))
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self):
        # We find orders linked to this customer via the customer model's phone/email
        # Or directly if customer FK is set on the order
        customer_id = self.kwargs.get('pk')
        return Order.objects.filter(restaurant=self.request.user.restaurant, customer_id=customer_id).order_by('-created_at')

class CustomerSegmentsView(RestaurantAccessMixin, ListView):
    model = Customer
    template_name = 'customers/customer_segments.html'
    context_object_name = 'customers'

    @method_decorator(role_required(['SUPER_ADMIN', 'RESTAURANT_OWNER', 'MANAGER']))
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def get_queryset(self):
        return Customer.objects.filter(restaurant=self.request.user.restaurant)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Process segments in memory (small datasets) or do complex ORM. 
        # Since we use a dynamic get_segment method, we group in memory for this view.
        segments = {'New': [], 'Repeat': [], 'VIP': [], 'Inactive': [], 'Standard': []}
        for c in context['customers']:
            seg = c.get_segment()
            if seg in segments:
                segments[seg].append(c)
                
        context['segments'] = segments
        return context
