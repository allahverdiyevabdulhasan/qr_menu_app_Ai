from django.urls import path
from .views.public_views import TableScanView

urlpatterns = [
    path('', TableScanView.as_view(), name='table_scan'),
]
