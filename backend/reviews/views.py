from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from .models import Review, ProductReview
from .serializers import ReviewSerializer, ProductReviewSerializer

class ReviewViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer

class ProductReviewViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = ProductReview.objects.all()
    serializer_class = ProductReviewSerializer
