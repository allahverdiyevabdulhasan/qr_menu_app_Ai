from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls.i18n import i18n_patterns, set_language
from menu.views.public_views import PublicMenuView, PublicCategoryProductsView, PublicProductDetailView
from ai_engine.views.public_views import PublicAIBudgetRecommendationView, PublicAIFoodAdvisorView
from orders.views.customer_views import (
    CartView, CartAddView, CartUpdateView, CartClearView,
    CheckoutView, OrderSuccessView, OrderTrackingView, OrderPaymentView
)

from core.views import SuperAdminDashboardView

urlpatterns = [
    path('i18n/setlang/', set_language, name='set_language'),
    path('admin/', admin.site.urls),
]

urlpatterns += i18n_patterns(
    path('super-admin/', SuperAdminDashboardView.as_view(), name='super_admin_dashboard'),
    path('accounts/', include('accounts.urls')),
    path('restaurant/', include('restaurants.urls')),
    path('menu/', include('menu.urls')),
    path('tables/', include('tables.urls')),
    path('orders/', include('orders.urls')),
    path('payments/', include('payments.urls')),
    path('analytics/', include('analytics.urls')),
    path('customers/', include('customers.urls')),
    path('loyalty/', include('loyalty.urls')),
    path('campaigns/', include('campaigns.urls')),
    path('reviews/', include('reviews.urls')),
    path('inventory/', include('inventory.urls')),
    path('expenses/', include('expenses.urls')),
    path('ai/', include('ai_engine.urls')),
    path('staff/', include('staff.urls')),
    path('invoices/', include('invoices.urls')),

    # ── Public Customer Menu ────────────────────────────────────────────────
    path('m/<slug:restaurant_slug>/', include([
        path('', PublicMenuView.as_view(), name='public_menu'),
        path('c/<int:category_id>/', PublicCategoryProductsView.as_view(), name='public_category'),
        path('p/<int:pk>/', PublicProductDetailView.as_view(), name='public_product'),
        path('ai/budget/', PublicAIBudgetRecommendationView.as_view(), name='ai_budget_recommendation'),
        path('ai/advisor/', PublicAIFoodAdvisorView.as_view(), name='ai_food_advisor'),
        path('cart/', CartView.as_view(), name='cart_view'),
        path('cart/add/', CartAddView.as_view(), name='cart_add'),
        path('cart/update/', CartUpdateView.as_view(), name='cart_update'),
        path('cart/clear/', CartClearView.as_view(), name='cart_clear'),
        path('checkout/', CheckoutView.as_view(), name='checkout'),
        path('checkout/<uuid:token>/', CheckoutView.as_view(), name='checkout_table'),
        path('order/<str:order_number>/payment/', OrderPaymentView.as_view(), name='order_payment'),
        path('order/<str:order_number>/success/', OrderSuccessView.as_view(), name='order_success'),
        path('order/<str:order_number>/track/', OrderTrackingView.as_view(), name='order_tracking'),
        
        # Table actions
        path('<uuid:table_token>/call-waiter/', include([
            path('', include('tables.urls_public')), # We'll create this to keep it clean
        ])),
    ])),
)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
