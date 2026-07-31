from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Review, ProductReview
from .serializers import ReviewSerializer, ProductReviewSerializer

class ReviewViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Review.objects.all()

class ProductReviewViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = ProductReviewSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return ProductReview.objects.all()

