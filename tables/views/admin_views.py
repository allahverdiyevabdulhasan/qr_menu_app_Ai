from django.views.generic import ListView, CreateView, UpdateView, DeleteView, DetailView
from django.urls import reverse_lazy
from django.http import HttpResponse
from restaurants.views import OwnerOnlyMixin, RestaurantAccessMixin
from tables.models import RestaurantTable
from tables.forms import RestaurantTableForm

class TableListView(RestaurantAccessMixin, ListView):
    model = RestaurantTable
    template_name = 'tables/table_list.html'
    context_object_name = 'tables'

    def get_queryset(self):
        # Waiters can view tables, managers can view
        return RestaurantTable.objects.filter(restaurant=self.request.user.restaurant)

class TableCreateView(OwnerOnlyMixin, CreateView):
    model = RestaurantTable
    form_class = RestaurantTableForm
    template_name = 'tables/table_form.html'
    success_url = reverse_lazy('table_list')

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['restaurant'] = self.request.user.restaurant
        return kwargs

    def form_valid(self, form):
        form.instance.restaurant = self.request.user.restaurant
        return super().form_valid(form)

class TableUpdateView(OwnerOnlyMixin, UpdateView):
    model = RestaurantTable
    form_class = RestaurantTableForm
    template_name = 'tables/table_form.html'
    success_url = reverse_lazy('table_list')

    def get_queryset(self):
        return RestaurantTable.objects.filter(restaurant=self.request.user.restaurant)

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['restaurant'] = self.request.user.restaurant
        return kwargs

class TableDeleteView(OwnerOnlyMixin, DeleteView):
    model = RestaurantTable
    success_url = reverse_lazy('table_list')

    def get_queryset(self):
        return RestaurantTable.objects.filter(restaurant=self.request.user.restaurant)

class TableQRDetailView(OwnerOnlyMixin, DetailView):
    model = RestaurantTable
    template_name = 'tables/table_qr_detail.html'
    context_object_name = 'table'

    def get_queryset(self):
        return RestaurantTable.objects.filter(restaurant=self.request.user.restaurant)

class TableQRPrintView(OwnerOnlyMixin, DetailView):
    model = RestaurantTable
    template_name = 'tables/table_qr_print.html'
    context_object_name = 'table'

    def get_queryset(self):
        return RestaurantTable.objects.filter(restaurant=self.request.user.restaurant)
