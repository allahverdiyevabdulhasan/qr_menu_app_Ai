from django.views.generic import CreateView
from django.urls import reverse_lazy
from django.shortcuts import get_object_or_404
from reviews.models import Review, ProductReview
from orders.models import Order
from menu.models import Product
from reviews.services import analyze_review_text

class ReviewCreateView(CreateView):
    model = Review
    template_name = 'reviews/review_form.html'
    fields = ['rating', 'comment', 'taste_rating', 'service_rating', 'speed_rating', 'price_rating']
    
    def get_success_url(self):
        return reverse_lazy('public_menu', kwargs={'restaurant_slug': self.object.restaurant.slug})

    def form_valid(self, form):
        order_number = self.kwargs.get('order_number')
        order = get_object_or_404(Order, order_number=order_number)
        
        form.instance.restaurant = order.restaurant
        form.instance.order = order
        # Order.customer is a User, but Review.customer is a Customer profile
        from customers.models import Customer
        if order.customer:
             customer = Customer.objects.filter(restaurant=order.restaurant, email=order.customer.email).first()
             form.instance.customer = customer
        
        # AI Enrichment
        if form.instance.comment:
            analysis = analyze_review_text(form.instance.comment)
            form.instance.ai_sentiment = analysis['sentiment']
            form.instance.ai_category = analysis['category']
            form.instance.ai_summary = analysis['summary']
            
        return super().form_valid(form)

class ProductReviewCreateView(CreateView):
    model = ProductReview
    template_name = 'reviews/product_review_form.html'
    fields = ['rating', 'comment']

    def form_valid(self, form):
        product_id = self.kwargs.get('product_id')
        product = get_object_or_404(Product, id=product_id)
        form.instance.product = product
        
        if self.request.user.is_authenticated:
            try:
                from customers.models import Customer
                customer, created = Customer.objects.get_or_create(
                    restaurant=product.restaurant,
                    email=self.request.user.email,
                    defaults={
                        'name': self.request.user.get_full_name() or self.request.user.username,
                    }
                )
                form.instance.customer = customer
            except Exception as e:
                pass
        return super().form_valid(form)

    def get_success_url(self):
        return reverse_lazy('public_menu', kwargs={'restaurant_slug': self.object.product.restaurant.slug})
