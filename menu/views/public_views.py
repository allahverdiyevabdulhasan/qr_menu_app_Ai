from django.views.generic import ListView, DetailView
from django.shortcuts import get_object_or_404
from menu.models import Category, Product
from restaurants.models import Restaurant
from menu.forms import ProductFilterForm

class PublicMenuView(ListView):
    model = Category
    template_name = 'menu/public_menu.html'
    context_object_name = 'categories'

    def get_queryset(self):
        self.restaurant = get_object_or_404(Restaurant, slug=self.kwargs['restaurant_slug'], status='active')
        return Category.objects.filter(restaurant=self.restaurant, is_active=True)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['restaurant'] = self.restaurant
        context['featured_products'] = Product.objects.filter(restaurant=self.restaurant, is_active=True, is_featured=True)
        return context

class PublicCategoryProductsView(ListView):
    model = Product
    template_name = 'menu/public_category_products.html'
    context_object_name = 'products'

    def get_queryset(self):
        self.restaurant = get_object_or_404(Restaurant, slug=self.kwargs['restaurant_slug'], status='active')
        qs = Product.objects.filter(restaurant=self.restaurant, is_active=True)
        
        # Apply filters
        form = ProductFilterForm(self.request.GET, restaurant=self.restaurant)
        if form.is_valid():
            if form.cleaned_data.get('category'):
                qs = qs.filter(category=form.cleaned_data['category'])
            if form.cleaned_data.get('is_vegetarian'):
                qs = qs.filter(is_vegetarian=True)
            if form.cleaned_data.get('is_vegan'):
                qs = qs.filter(is_vegan=True)
            if form.cleaned_data.get('is_gluten_free'):
                qs = qs.filter(is_gluten_free=True)
            if form.cleaned_data.get('spicy_level'):
                qs = qs.filter(spicy_level__gte=form.cleaned_data['spicy_level'])
            if form.cleaned_data.get('min_price'):
                qs = qs.filter(price__gte=form.cleaned_data['min_price'])
            if form.cleaned_data.get('max_price'):
                qs = qs.filter(price__lte=form.cleaned_data['max_price'])
            if form.cleaned_data.get('available_only'):
                qs = qs.exclude(stock_status='out_of_stock')
                
        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['restaurant'] = self.restaurant
        context['filter_form'] = ProductFilterForm(self.request.GET, restaurant=self.restaurant)
        return context

class PublicProductDetailView(DetailView):
    model = Product
    template_name = 'menu/public_product_detail.html'
    context_object_name = 'product'

    def get_queryset(self):
        restaurant = get_object_or_404(Restaurant, slug=self.kwargs['restaurant_slug'], status='active')
        return Product.objects.filter(restaurant=restaurant, is_active=True)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        from ai_engine.services import FoodAdvisorService, FrequentlyBoughtTogetherService
        
        product = self.get_object()
        
        # 1. AI eşleştirme ve sepet tavsiye motoru
        try:
            pairing_service = FrequentlyBoughtTogetherService()
            context['recommendation'] = pairing_service.suggest_pairing(product)
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning("FrequentlyBoughtTogetherService failed: %s", e)
            context['recommendation'] = {}
            
        # 2. Genel yapay zeka tavsiyesi
        try:
            advisor = FoodAdvisorService()
            result = advisor.advise(product.restaurant, f"Tell me about {product.name} and what it pairs well with.")
            context['ai_advice'] = result.get('reason', '')
        except Exception as e:
            context['ai_advice'] = ''
            
        context['restaurant'] = product.restaurant
        return context
