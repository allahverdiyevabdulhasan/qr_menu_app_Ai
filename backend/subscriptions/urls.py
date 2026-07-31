from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlanViewSet, SubscriptionViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'plan', PlanViewSet)
router.register(r'subscription', SubscriptionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

