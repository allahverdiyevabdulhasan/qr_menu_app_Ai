from django.urls import path
from .views.public_views import CallWaiterView, RequestBillView

urlpatterns = [
    path('', CallWaiterView.as_view(), name='call_waiter'),
    path('bill/', RequestBillView.as_view(), name='request_bill'),
]
