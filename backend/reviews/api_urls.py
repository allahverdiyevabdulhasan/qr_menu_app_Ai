from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .api_views import ReviewViewSet, ProductReviewViewSet

router = SimpleRouter()
router.register(r'reviews', ReviewViewSet, basename='reviews')
router.register(r'productreviews', ProductReviewViewSet, basename='productreviews')

urlpatterns = [
    path('', include(router.urls)),
]
