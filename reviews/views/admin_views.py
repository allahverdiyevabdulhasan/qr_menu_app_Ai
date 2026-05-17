from django.views.generic import ListView, DetailView, TemplateView, DeleteView
from django.urls import reverse, reverse_lazy
from restaurants.views import RestaurantAccessMixin, PermissionRequiredMixin
from reviews.models import Review, ProductReview

from reviews.services import get_unified_reviews

class ReviewDashboardView(PermissionRequiredMixin, TemplateView):
    permission_name = 'can_view_reviews'

    template_name = 'reviews/review_dashboard.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        unified = get_unified_reviews(self.request.user.restaurant)
        context['recent_reviews'] = unified[:10]
        context['total_reviews'] = len(unified)
        return context

class ReviewListView(PermissionRequiredMixin, ListView):
    permission_name = 'can_view_reviews'

    model = Review
    template_name = 'reviews/review_list.html'
    context_object_name = 'reviews'

    def get_queryset(self):
        rating = self.request.GET.get('rating')
        sentiment = self.request.GET.get('sentiment')
        category = self.request.GET.get('category')
        
        return get_unified_reviews(
            self.request.user.restaurant,
            rating=rating,
            sentiment=sentiment,
            category=category
        )

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        unified = get_unified_reviews(self.request.user.restaurant)
        
        # Calculate stats
        ratings = [r['rating'] for r in unified]
        context['avg_rating'] = sum(ratings) / len(ratings) if ratings else 4.8
        context['positive_count'] = len([r for r in unified if r['sentiment'] == 'POSITIVE'])
        context['neutral_count'] = len([r for r in unified if r['sentiment'] == 'NEUTRAL'])
        context['negative_count'] = len([r for r in unified if r['sentiment'] == 'NEGATIVE'])
        
        return context

class ReviewDetailView(PermissionRequiredMixin, DetailView):
    permission_name = 'can_view_reviews'

    model = Review
    template_name = 'reviews/review_detail.html'
    context_object_name = 'review'

    def get_queryset(self):
        return Review.objects.filter(restaurant=self.request.user.restaurant)

class ReviewDeleteView(PermissionRequiredMixin, DeleteView):
    permission_name = 'can_view_reviews'

    model = Review
    success_url = reverse_lazy('review_list')

    def get_queryset(self):
        return Review.objects.filter(restaurant=self.request.user.restaurant)

class ProductReviewDeleteView(PermissionRequiredMixin, DeleteView):
    permission_name = 'can_view_reviews'

    model = ProductReview
    success_url = reverse_lazy('review_list')

    def get_queryset(self):
        return ProductReview.objects.filter(product__restaurant=self.request.user.restaurant)
