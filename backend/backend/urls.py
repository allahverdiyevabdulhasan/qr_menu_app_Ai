from django.contrib import admin
from django.urls import path, include

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('rest_framework.urls')),
    path('api/v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/accounts/', include('accounts.urls')),
    path('api/v1/ai_engine/', include('ai_engine.urls')),
    path('api/v1/campaigns/', include('campaigns.urls')),
    path('api/v1/customers/', include('customers.urls')),
    path('api/v1/expenses/', include('expenses.urls')),
    path('api/v1/finance/', include('finance.urls')),
    path('api/v1/inventory/', include('inventory.urls')),
    path('api/v1/invoices/', include('invoices.urls')),
    path('api/v1/loyalty/', include('loyalty.urls')),
    path('api/v1/menu/', include('menu.urls')),
    path('api/v1/orders/', include('orders.urls')),
    path('api/v1/payments/', include('payments.urls')),
    path('api/v1/reservations/', include('reservations.urls')),
    path('api/v1/restaurants/', include('restaurants.urls')),
    path('api/v1/reviews/', include('reviews.urls')),
    path('api/v1/staff/', include('staff.urls')),
    path('api/v1/subscriptions/', include('subscriptions.urls')),
    path('api/v1/support/', include('support.urls')),
    path('api/v1/tables/', include('tables.urls')),
    path('api/public/', include('core.public_urls')),
    path('api/', include('core.api_urls')),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
