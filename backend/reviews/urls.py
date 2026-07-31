from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReviewViewSet, ProductReviewViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'review', ReviewViewSet)
router.register(r'productreview', ProductReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

