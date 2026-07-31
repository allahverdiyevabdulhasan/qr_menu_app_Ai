from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from .public_views import (
    PublicMenuAPIView, PublicOrderAPIView, PublicOrderStatusAPIView, 
    CustomerRegisterAPIView, CustomerProfileOrdersAPIView,
    CustomerAddressAPIView, CustomerAddressDetailAPIView,
    CustomerPreferencesAPIView, WaiterCallAPIView, PublicAIChatAPIView,
    PublicAIBudgetAPIView, CourierOrdersAPIView, CourierOrderStatusUpdateAPIView,
    PublicReviewAPIView, PublicReservationAPIView, PublicAIUpsellAPIView
)

urlpatterns = [
    path('auth/login/', TokenObtainPairView.as_view(), name='public_login'),
    path('auth/register/', CustomerRegisterAPIView.as_view(), name='public_register'),
    path('auth/orders/', CustomerProfileOrdersAPIView.as_view(), name='public_orders'),
    path('menu/<slug:slug>/', PublicMenuAPIView.as_view(), name='public_menu'),
    path('order/', PublicOrderAPIView.as_view(), name='public_order'),
    path('order_status/<int:order_id>/', PublicOrderStatusAPIView.as_view(), name='public_order_status'),
    path('auth/addresses/', CustomerAddressAPIView.as_view(), name='public_addresses'),
    path('auth/addresses/<int:pk>/', CustomerAddressDetailAPIView.as_view(), name='public_address_detail'),
    path('auth/me/preferences/', CustomerPreferencesAPIView.as_view(), name='public_preferences'),
    path('tables/call/', WaiterCallAPIView.as_view(), name='public_table_call'),
    path('ai/chat/<slug:slug>/', PublicAIChatAPIView.as_view(), name='public_ai_chat'),
    path('ai/budget/<slug:slug>/', PublicAIBudgetAPIView.as_view(), name='public_ai_budget'),
    
    # Courier routes
    path('courier/orders/', CourierOrdersAPIView.as_view(), name='public_courier_orders'),
    path('courier/orders/<int:pk>/status/', CourierOrderStatusUpdateAPIView.as_view(), name='public_courier_order_status'),

    # Phase 5: Review & Reservation
    path('review/', PublicReviewAPIView.as_view(), name='public_review'),
    path('reservation/<slug:slug>/', PublicReservationAPIView.as_view(), name='public_reservation'),

    # Phase 6: Upselling
    path('ai/upsell/<slug:slug>/', PublicAIUpsellAPIView.as_view(), name='public_ai_upsell'),
]
