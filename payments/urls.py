from django.urls import path
from .views import (
    PaymentListView, PaymentDetailView, PaymentCreateView, RefundPaymentView, DailyPaymentSummaryView
)

urlpatterns = [
    path('', PaymentListView.as_view(), name='payment_list'),
    path('summary/', DailyPaymentSummaryView.as_view(), name='daily_payment_summary'),
    path('<int:pk>/', PaymentDetailView.as_view(), name='payment_detail'),
    path('create/<int:order_id>/', PaymentCreateView.as_view(), name='payment_create'),
    path('refund/<int:pk>/', RefundPaymentView.as_view(), name='payment_refund'),
]
