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
        context['table_token'] = self.request.session.get('table_token', '')
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
        context['restaurant'] = self.get_object().restaurant
        return context


from django.views import View
from django.http import JsonResponse
from django.core.cache import cache

class PublicProductAIDataView(View):
    """
    Asynchronously provides cached AI recommendations and insights.
    Optimizes page load time to under 100ms and avoids rate limits.
    """
    def get(self, request, restaurant_slug, pk, *args, **kwargs):
        restaurant = get_object_or_404(Restaurant, slug=restaurant_slug, status='active')
        product = get_object_or_404(Product, pk=pk, restaurant=restaurant, is_active=True)
        
        # 1. Cache Kontrolü (24 Saatlik Ön Bellek)
        cache_key = f"product_ai_data_optimized_{product.id}"
        cached_data = cache.get(cache_key)
        if cached_data:
            return JsonResponse(cached_data)
            
        # 2. Eğer Önbellekte Yoksa Hesapla
        from ai_engine.services import FoodAdvisorService, FrequentlyBoughtTogetherService
        
        recommendation_data = {}
        try:
            pairing_service = FrequentlyBoughtTogetherService()
            rec = pairing_service.suggest_pairing(product)
            if rec and "product" in rec:
                pairing_product = rec["product"]
                recommendation_data = {
                    "product_id": pairing_product.id,
                    "product_name": pairing_product.name,
                    "product_price": float(pairing_product.price),
                    "product_image_url": pairing_product.image.url if pairing_product.image else None,
                    "discount_percent": rec["discount_percent"],
                    "savings": float(rec["savings"]),
                    "discounted_total": float(rec["discounted_total"]),
                    "original_total": float(rec["original_total"]),
                    "pitch": rec["pitch"]
                }
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning("FrequentlyBoughtTogetherService failed in API: %s", e)
            
        ai_advice = ""
        try:
            advisor = FoodAdvisorService()
            result = advisor.advise(product.restaurant, f"Tell me about {product.name} and what it pairs well with.")
            ai_advice = result.get('reason', '')
        except Exception as e:
            pass
            
        response_data = {
            "ai_advice": ai_advice,
            "recommendation": recommendation_data
        }
        
        # 24 Saatlik Önbelleğe Kaydet
        cache.set(cache_key, response_data, 86400)
        
        return JsonResponse(response_data)
