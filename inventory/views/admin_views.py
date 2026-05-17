from django.views.generic import ListView, CreateView, UpdateView, TemplateView
from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404
from restaurants.views import RestaurantAccessMixin, PermissionRequiredMixin
from inventory.models import InventoryItem, ProductIngredient, StockMovement
from menu.models import Product
from inventory.services import ai_stock_forecast

class InventoryListView(PermissionRequiredMixin, ListView):
    permission_name = 'can_manage_inventory'

    model = InventoryItem
    template_name = 'inventory/inventory_list.html'
    context_object_name = 'items'

    def get_queryset(self):
        return InventoryItem.objects.filter(restaurant=self.request.user.restaurant)

class InventoryCreateView(PermissionRequiredMixin, CreateView):
    permission_name = 'can_manage_inventory'

    model = InventoryItem
    template_name = 'inventory/inventory_form.html'
    fields = ['name', 'unit', 'current_quantity', 'minimum_quantity', 'cost_per_unit', 'supplier_name']
    success_url = reverse_lazy('inventory_list')

    def form_valid(self, form):
        form.instance.restaurant = self.request.user.restaurant
        return super().form_valid(form)

class InventoryUpdateView(PermissionRequiredMixin, UpdateView):
    permission_name = 'can_manage_inventory'

    model = InventoryItem
    template_name = 'inventory/inventory_form.html'
    fields = ['name', 'unit', 'current_quantity', 'minimum_quantity', 'cost_per_unit', 'supplier_name', 'status']
    success_url = reverse_lazy('inventory_list')

    def get_queryset(self):
        return InventoryItem.objects.filter(restaurant=self.request.user.restaurant)

class ProductIngredientView(PermissionRequiredMixin, ListView):
    permission_name = 'can_manage_inventory'

    model = ProductIngredient
    template_name = 'inventory/product_ingredients.html'
    context_object_name = 'ingredients'

    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        return ProductIngredient.objects.filter(product_id=product_id, product__restaurant=self.request.user.restaurant)
        
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['product'] = get_object_or_404(Product, id=self.kwargs.get('product_id'), restaurant=self.request.user.restaurant)
        return context

class StockMovementListView(PermissionRequiredMixin, ListView):
    permission_name = 'can_manage_inventory'

    model = StockMovement
    template_name = 'inventory/stock_movements.html'
    context_object_name = 'movements'

    def get_queryset(self):
        return StockMovement.objects.filter(restaurant=self.request.user.restaurant)

class StockAlertsView(PermissionRequiredMixin, ListView):
    permission_name = 'can_manage_inventory'

    model = InventoryItem
    template_name = 'inventory/stock_alerts.html'
    context_object_name = 'alerts'

    def get_queryset(self):
        return InventoryItem.objects.filter(
            restaurant=self.request.user.restaurant, 
            status__in=['LOW_STOCK', 'OUT_OF_STOCK']
        )

class StockForecastView(PermissionRequiredMixin, TemplateView):
    permission_name = 'can_manage_inventory'

    template_name = 'inventory/stock_forecast.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['forecast'] = ai_stock_forecast(self.request.user.restaurant)
        return context
