from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from core.api_views import (
    me, public_menu, public_order_create, public_waiter_call,
    public_ai_budget, public_ai_chat, dashboard_analytics
)

urlpatterns = [
    # Dashboard Analytics
    path('dashboard/analytics/', dashboard_analytics, name='dashboard_analytics'),
    
    # JWT Authentication Endpoints
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', me, name='auth_me'),
    path('public/menu/<slug:slug>/', public_menu, name='public_menu'),
    path('public/order/', public_order_create, name='public_order_create'),
    path('public/waitercall/', public_waiter_call, name='public_waiter_call'),
    path('public/ai/budget/<slug:slug>/', public_ai_budget, name='public_ai_budget'),
    path('public/ai/chat/<slug:slug>/', public_ai_chat, name='public_ai_chat'),
    
    # We will include app-specific API routers here as we build them.
    path('restaurants/', include('restaurants.api_urls')),
    path('menu/', include('menu.api_urls')),
    path('orders/', include('orders.api_urls')),
    path('ai/', include('ai_engine.api_urls')),
    path('tables/', include('tables.api_urls')),
    path('customers/', include('customers.api_urls')),
    path('loyalty/', include('loyalty.api_urls')),
    path('ai_engine/', include('ai_engine.api_urls')),
    path('inventory/', include('inventory.api_urls')),
    path('expenses/', include('expenses.api_urls')),
    path('staff/', include('staff.api_urls')),
    path('invoices/', include('invoices.api_urls')),
    path('campaigns/', include('campaigns.api_urls')),
    path('reviews/', include('reviews.api_urls')),
    path('payments/', include('payments.api_urls')),
]