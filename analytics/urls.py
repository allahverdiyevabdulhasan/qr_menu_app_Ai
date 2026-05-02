from django.urls import path
from .views import (
    AnalyticsDashboardView, RevenueReportView, ProductReportView, NetProfitReportView
)

urlpatterns = [
    path('', AnalyticsDashboardView.as_view(), name='analytics_dashboard'),
    path('revenue/', RevenueReportView.as_view(), name='revenue_report'),
    path('products/', ProductReportView.as_view(), name='product_report'),
    path('net-profit/', NetProfitReportView.as_view(), name='net_profit_report'),
]
