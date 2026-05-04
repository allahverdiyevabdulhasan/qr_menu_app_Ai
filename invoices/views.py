from django.views.generic import ListView, DetailView
from restaurants.views import RestaurantAccessMixin
from .models import Invoice

class InvoiceListView(RestaurantAccessMixin, ListView):
    model = Invoice
    template_name = 'invoices/invoice_list.html'
    context_object_name = 'invoices'

    def get_queryset(self):
        return Invoice.objects.filter(restaurant=self.request.user.restaurant).select_related('order', 'payroll')

class InvoiceDetailView(RestaurantAccessMixin, DetailView):
    model = Invoice
    template_name = 'invoices/invoice_detail.html'
    context_object_name = 'invoice'

    def get_queryset(self):
        return Invoice.objects.filter(restaurant=self.request.user.restaurant)
