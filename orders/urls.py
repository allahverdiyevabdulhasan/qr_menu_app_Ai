from django.urls import path
from .views import (
    OrderListView, OrderDetailView, OrderStatusUpdateView,
    KitchenScreenView, WaiterPanelView, CashierPanelView,
)

# Staff-only Order URLs. Customer cart/checkout flows live in neymenu_ai/urls.py
# under the m/<slug>/ prefix so they always have restaurant context.
urlpatterns = [
    path('', OrderListView.as_view(), name='order_list'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order_detail'),
    path('<int:pk>/status/', OrderStatusUpdateView.as_view(), name='order_status_update'),
    path('kitchen/', KitchenScreenView.as_view(), name='kitchen_screen'),
    path('waiter/', WaiterPanelView.as_view(), name='waiter_panel'),
    path('cashier/', CashierPanelView.as_view(), name='cashier_panel'),
]
