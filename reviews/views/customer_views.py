from django.views.generic import CreateView
from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404
from reviews.models import Review
from orders.models import Order
from reviews.services import analyze_review_text

class ReviewCreateView(CreateView):
    model = Review
    template_name = 'reviews/review_form.html'
    fields = ['rating', 'comment', 'taste_rating', 'service_rating', 'speed_rating', 'price_rating']
    
    def get_success_url(self):
        return reverse_lazy('public_menu', kwargs={'slug': self.object.restaurant.slug})

    def form_valid(self, form):
        order_number = self.kwargs.get('order_number')
        order = get_object_or_404(Order, order_number=order_number)
        
        form.instance.restaurant = order.restaurant
        form.instance.order = order
        form.instance.customer = order.customer
        
        # AI Enrichment
        if form.instance.comment:
            analysis = analyze_review_text(form.instance.comment)
            form.instance.ai_sentiment = analysis['sentiment']
            form.instance.ai_category = analysis['category']
            form.instance.ai_summary = analysis['summary']
            
        return super().form_valid(form)
