from ai_engine.services import ReviewAnalysisService
from django.urls import reverse
from .models import Review, ProductReview

def analyze_review_text(text):
    """
    Calls the AI engine to analyze the review text.
    """
    return ReviewAnalysisService().analyse(text)

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
            'delete_url': reverse('review_delete', args=[r.pk]),
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
            'delete_url': reverse('product_review_delete', args=[r.pk]),
        })
        
    # Sort by created_at desc
    unified.sort(key=lambda x: x['created_at'], reverse=True)
    return unified
