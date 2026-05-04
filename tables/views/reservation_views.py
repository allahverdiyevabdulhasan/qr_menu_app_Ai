from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404, redirect
from django.views import View
from restaurants.views import RestaurantAccessMixin
from tables.models import TableReservation, RestaurantTable
from tables.forms import TableReservationForm
from accounts.decorators import role_required

class ReservationListView(RestaurantAccessMixin, ListView):
    model = TableReservation
    template_name = 'tables/reservation_list.html'
    context_object_name = 'reservations'

    def get_queryset(self):
        return TableReservation.objects.filter(restaurant=self.request.user.restaurant).select_related('table', 'branch')

class ReservationCreateView(RestaurantAccessMixin, CreateView):
    model = TableReservation
    form_class = TableReservationForm
    template_name = 'tables/reservation_form.html'
    success_url = reverse_lazy('reservation_list')

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['restaurant'] = self.request.user.restaurant
        return kwargs

    def form_valid(self, form):
        form.instance.restaurant = self.request.user.restaurant
        form.instance.created_by = self.request.user
        # For legacy compatibility or if reservation_time is still used as the primary DateTime
        import datetime
        if form.cleaned_data.get('reservation_date') and form.cleaned_data.get('reservation_time_only'):
            form.instance.reservation_time = datetime.datetime.combine(
                form.cleaned_data['reservation_date'], 
                form.cleaned_data['reservation_time_only']
            )
        return super().form_valid(form)

class ReservationUpdateView(RestaurantAccessMixin, UpdateView):
    model = TableReservation
    form_class = TableReservationForm
    template_name = 'tables/reservation_form.html'
    success_url = reverse_lazy('reservation_list')

    def get_queryset(self):
        return TableReservation.objects.filter(restaurant=self.request.user.restaurant)

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['restaurant'] = self.request.user.restaurant
        return kwargs

    def form_valid(self, form):
        import datetime
        if form.cleaned_data.get('reservation_date') and form.cleaned_data.get('reservation_time_only'):
            form.instance.reservation_time = datetime.datetime.combine(
                form.cleaned_data['reservation_date'], 
                form.cleaned_data['reservation_time_only']
            )
        return super().form_valid(form)

class ReservationStatusUpdateView(RestaurantAccessMixin, View):
    def post(self, request, pk, *args, **kwargs):
        reservation = get_object_or_404(TableReservation, pk=pk, restaurant=request.user.restaurant)
        new_status = request.POST.get('status')
        if new_status in [s[0] for s in TableReservation.STATUS_CHOICES]:
            reservation.status = new_status
            reservation.save()
            
            # If seated, we might want to mark the table as occupied
            if new_status == 'SEATED' and reservation.table:
                reservation.table.status = 'OCCUPIED'
                reservation.table.save()
            elif new_status == 'COMPLETED' and reservation.table:
                reservation.table.status = 'AVAILABLE'
                reservation.table.save()

        return redirect('reservation_list')
