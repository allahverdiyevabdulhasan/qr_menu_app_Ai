from django.urls import path
from .views import (
    InventoryListView, InventoryCreateView, InventoryUpdateView, 
    ProductIngredientView, StockMovementListView, StockAlertsView, StockForecastView
)

urlpatterns = [
    path('', InventoryListView.as_view(), name='inventory_list'),
    path('add/', InventoryCreateView.as_view(), name='inventory_add'),
    path('<int:pk>/edit/', InventoryUpdateView.as_view(), name='inventory_edit'),
    path('product/<int:product_id>/ingredients/', ProductIngredientView.as_view(), name='product_ingredients'),
    path('movements/', StockMovementListView.as_view(), name='stock_movements'),
    path('alerts/', StockAlertsView.as_view(), name='stock_alerts'),
    path('forecast/', StockForecastView.as_view(), name='stock_forecast'),
]
