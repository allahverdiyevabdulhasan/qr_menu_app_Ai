from django.views.generic import CreateView
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse
from django.http import JsonResponse
from django.views import View
from ..models import RestaurantTable, TableReservation, WaiterCall
from restaurants.models import Restaurant

class TableReservationCreateView(CreateView):
    model = TableReservation
    fields = ['customer_name', 'customer_phone', 'reservation_time', 'number_of_people', 'note']
    template_name = 'tables/public_reservation.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        restaurant_slug = self.kwargs['restaurant_slug']
        context['restaurant'] = get_object_or_404(Restaurant, slug=restaurant_slug)
        return context

    def form_valid(self, form):
        restaurant_slug = self.kwargs['restaurant_slug']
        restaurant = get_object_or_404(Restaurant, slug=restaurant_slug)
        form.instance.restaurant = restaurant
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('public_menu', kwargs={'restaurant_slug': self.kwargs['restaurant_slug']})

class CallWaiterView(View):
    def post(self, request, *args, **kwargs):
        restaurant_slug = self.kwargs['restaurant_slug']
        restaurant = get_object_or_404(Restaurant, slug=restaurant_slug)
        table_token = self.kwargs.get('table_token')
        table = get_object_or_404(RestaurantTable, token=table_token, restaurant=restaurant)
        
        # Create a waiter call if one doesn't already exist for this table
        created = WaiterCall.objects.get_or_create(
            restaurant=restaurant,
            table=table,
            is_active=True
        )[1]
        
        if created:
            from orders.utils import broadcast_waiter_call
            broadcast_waiter_call(restaurant, table)
        
        return JsonResponse({'status': 'success', 'message': 'Waiter called!'})

class RequestBillView(View):
    def post(self, request, *args, **kwargs):
        restaurant_slug = self.kwargs['restaurant_slug']
        restaurant = get_object_or_404(Restaurant, slug=restaurant_slug)
        table_token = self.kwargs.get('table_token')
        table = get_object_or_404(RestaurantTable, token=table_token, restaurant=restaurant)
        
        from orders.utils import broadcast_staff_alert
        broadcast_staff_alert(restaurant, table, 'bill_request')
        
        return JsonResponse({'status': 'success', 'message': 'Bill requested!'})
