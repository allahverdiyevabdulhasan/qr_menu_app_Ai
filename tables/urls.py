from django.urls import path
from .views import (
    TableListView, TableCreateView, TableUpdateView, TableDeleteView,
    TableQRDetailView, TableQRPrintView
)

urlpatterns = [
    path('', TableListView.as_view(), name='table_list'),
    path('add/', TableCreateView.as_view(), name='table_add'),
    path('<int:pk>/edit/', TableUpdateView.as_view(), name='table_edit'),
    path('<int:pk>/delete/', TableDeleteView.as_view(), name='table_delete'),
    path('<int:pk>/qr/', TableQRDetailView.as_view(), name='table_qr_detail'),
    path('<int:pk>/print/', TableQRPrintView.as_view(), name='table_qr_print'),
]
