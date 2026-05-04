from django.urls import path
from .views.admin_views import (
    TableListView, TableCreateView, TableUpdateView, TableDeleteView,
    TableQRDetailView, TableQRPrintView
)
from .views import reservation_views
from .views.public_views import TableReservationCreateView, CallWaiterView

urlpatterns = [
    # Admin/Staff URLs
    path('', TableListView.as_view(), name='table_list'),
    path('add/', TableCreateView.as_view(), name='table_add'),
    path('<int:pk>/edit/', TableUpdateView.as_view(), name='table_edit'),
    path('<int:pk>/delete/', TableDeleteView.as_view(), name='table_delete'),
    path('<int:pk>/qr/', TableQRDetailView.as_view(), name='table_qr_detail'),
    path('<int:pk>/print/', TableQRPrintView.as_view(), name='table_qr_print'),

    # Reservation Management
    path('reservations/', reservation_views.ReservationListView.as_view(), name='reservation_list'),
    path('reservations/add/', reservation_views.ReservationCreateView.as_view(), name='reservation_add'),
    path('reservations/<int:pk>/edit/', reservation_views.ReservationUpdateView.as_view(), name='reservation_edit'),
    path('reservations/<int:pk>/status/', reservation_views.ReservationStatusUpdateView.as_view(), name='reservation_status_update'),

    # Public Customer URLs (usually accessed via restaurant slug)
    path('reserve/<slug:restaurant_slug>/', TableReservationCreateView.as_view(), name='public_reservation'),
    path('call-waiter/<slug:restaurant_slug>/<uuid:table_token>/', CallWaiterView.as_view(), name='call_waiter'),
]
