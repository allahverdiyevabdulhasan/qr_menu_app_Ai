from django.urls import path
from .views import (
    CustomerListView, CustomerDetailView, CustomerOrdersView, CustomerSegmentsView
)

urlpatterns = [
    path('', CustomerListView.as_view(), name='customer_list'),
    path('segments/', CustomerSegmentsView.as_view(), name='customer_segments'),
    path('<int:pk>/', CustomerDetailView.as_view(), name='customer_detail'),
    path('<int:pk>/orders/', CustomerOrdersView.as_view(), name='customer_orders'),
]
