from django.views.generic import ListView, DetailView, TemplateView
from restaurants.views import RestaurantAccessMixin
from reviews.models import Review

class ReviewDashboardView(RestaurantAccessMixin, TemplateView):
    template_name = 'reviews/review_dashboard.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        qs = Review.objects.filter(restaurant=self.request.user.restaurant)
        context['recent_reviews'] = qs[:10]
        context['total_reviews'] = qs.count()
        # Mock summary or aggregate stats here
        return context

class ReviewListView(RestaurantAccessMixin, ListView):
    model = Review
    template_name = 'reviews/review_list.html'
    context_object_name = 'reviews'

    def get_queryset(self):
        qs = Review.objects.filter(restaurant=self.request.user.restaurant)
        
        rating = self.request.GET.get('rating')
        if rating:
            qs = qs.filter(rating=rating)
            
        sentiment = self.request.GET.get('sentiment')
        if sentiment:
            qs = qs.filter(ai_sentiment=sentiment)
            
        category = self.request.GET.get('category')
        if category:
            qs = qs.filter(ai_category=category)
            
        return qs

class ReviewDetailView(RestaurantAccessMixin, DetailView):
    model = Review
    template_name = 'reviews/review_detail.html'
    context_object_name = 'review'

    def get_queryset(self):
        return Review.objects.filter(restaurant=self.request.user.restaurant)
