from django.views.generic import ListView, DetailView, TemplateView
from django.urls import reverse
from restaurants.views import RestaurantAccessMixin
from reviews.models import Review, ProductReview

def get_unified_reviews(restaurant, rating=None, sentiment=None, category=None):
    # Order reviews
    order_reviews = Review.objects.filter(restaurant=restaurant)
    if rating:
        order_reviews = order_reviews.filter(rating=rating)
    if sentiment:
        order_reviews = order_reviews.filter(ai_sentiment=sentiment)
    if category:
        order_reviews = order_reviews.filter(ai_category=category)
        
    # Product reviews
    product_reviews = ProductReview.objects.filter(product__restaurant=restaurant)
    if rating:
        product_reviews = product_reviews.filter(rating=rating)
        
    unified = []
    for r in order_reviews:
        unified.append({
            'pk': r.pk,
            'is_product_review': False,
            'created_at': r.created_at,
            'customer_name': r.customer.name if r.customer else (r.order.customer.get_full_name() if r.order and r.order.customer else "Anonymous"),
            'rating': r.rating,
            'sentiment': r.ai_sentiment,
            'category': r.get_ai_category_display() if hasattr(r, 'get_ai_category_display') else r.ai_category,
            'comment': r.comment,
            'detail_url': reverse('review_detail', args=[r.pk]),
        })
        
    for r in product_reviews:
        p_sentiment = 'POSITIVE' if r.rating >= 4 else ('NEGATIVE' if r.rating <= 2 else 'NEUTRAL')
        if sentiment and p_sentiment != sentiment:
            continue
        if category and category != 'PRODUCT':
            continue
            
        unified.append({
            'pk': r.pk,
            'is_product_review': True,
            'created_at': r.created_at,
            'customer_name': r.customer.name if r.customer else "Anonymous",
            'rating': r.rating,
            'sentiment': p_sentiment,
            'category': f"Ürün: {r.product.name}",
            'comment': r.comment,
            'detail_url': '#',
        })
        
    # Sort by created_at desc
    unified.sort(key=lambda x: x['created_at'], reverse=True)
    return unified

class ReviewDashboardView(RestaurantAccessMixin, TemplateView):
    template_name = 'reviews/review_dashboard.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        unified = get_unified_reviews(self.request.user.restaurant)
        context['recent_reviews'] = unified[:10]
        context['total_reviews'] = len(unified)
        return context

class ReviewListView(RestaurantAccessMixin, ListView):
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

class ReviewDetailView(RestaurantAccessMixin, DetailView):
    model = Review
    template_name = 'reviews/review_detail.html'
    context_object_name = 'review'

    def get_queryset(self):
        return Review.objects.filter(restaurant=self.request.user.restaurant)
