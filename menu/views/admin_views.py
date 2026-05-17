from django.views.generic import ListView, CreateView, UpdateView, DeleteView, DetailView
from django.urls import reverse_lazy, reverse
from django.shortcuts import get_object_or_404, redirect
from django.http import HttpResponseRedirect
from restaurants.views import OwnerOnlyMixin, RestaurantAccessMixin, PermissionRequiredMixin
from menu.models import Category, Product, ProductOption
from menu.forms import CategoryForm, ProductForm, ProductOptionForm

class CategoryListView(PermissionRequiredMixin, ListView):
    permission_name = 'can_manage_menu'

    model = Category
    template_name = 'menu/category_list.html'
    context_object_name = 'categories'

    def get_queryset(self):
        return Category.objects.filter(restaurant=self.request.user.restaurant)

class CategoryCreateView(PermissionRequiredMixin, CreateView):
    permission_name = 'can_manage_menu'

    model = Category
    form_class = CategoryForm
    template_name = 'menu/category_form.html'
    success_url = reverse_lazy('category_list')

    def form_valid(self, form):
        form.instance.restaurant = self.request.user.restaurant
        return super().form_valid(form)

class CategoryUpdateView(PermissionRequiredMixin, UpdateView):
    permission_name = 'can_manage_menu'

    model = Category
    form_class = CategoryForm
    template_name = 'menu/category_form.html'
    success_url = reverse_lazy('category_list')

    def get_queryset(self):
        return Category.objects.filter(restaurant=self.request.user.restaurant)

class CategoryDeleteView(PermissionRequiredMixin, DeleteView):
    permission_name = 'can_manage_menu'

    model = Category
    success_url = reverse_lazy('category_list')

    def get_queryset(self):
        return Category.objects.filter(restaurant=self.request.user.restaurant)


class ProductListView(PermissionRequiredMixin, ListView):
    permission_name = 'can_manage_menu'

    model = Product
    template_name = 'menu/product_list.html'
    context_object_name = 'products'

    def get_queryset(self):
        return Product.objects.filter(restaurant=self.request.user.restaurant)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        restaurant = self.request.user.restaurant
        context['categories'] = Category.objects.filter(restaurant=restaurant)
        
        from django.db.models import Avg
        avg_val = self.get_queryset().aggregate(Avg('price'))['price__avg']
        context['avg_price'] = round(avg_val, 2) if avg_val is not None else 0
        return context

class ProductCreateView(PermissionRequiredMixin, CreateView):
    permission_name = 'can_manage_menu'

    model = Product
    form_class = ProductForm
    template_name = 'menu/product_form.html'
    success_url = reverse_lazy('product_list')

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['restaurant'] = self.request.user.restaurant
        return kwargs

    def form_valid(self, form):
        form.instance.restaurant = self.request.user.restaurant
        return super().form_valid(form)

class ProductUpdateView(PermissionRequiredMixin, UpdateView):
    permission_name = 'can_manage_menu'

    model = Product
    form_class = ProductForm
    template_name = 'menu/product_form.html'
    success_url = reverse_lazy('product_list')

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['restaurant'] = self.request.user.restaurant
        return kwargs

    def get_queryset(self):
        return Product.objects.filter(restaurant=self.request.user.restaurant)

class ProductDetailAdminView(RestaurantAccessMixin, DetailView):
    model = Product
    template_name = 'menu/product_detail_admin.html'
    context_object_name = 'product'

    def get_queryset(self):
        return Product.objects.filter(restaurant=self.request.user.restaurant)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['option_form'] = ProductOptionForm()
        return context

class ProductOptionCreateView(PermissionRequiredMixin, CreateView):
    permission_name = 'can_manage_menu'

    model = ProductOption
    form_class = ProductOptionForm

    def form_valid(self, form):
        product = get_object_or_404(Product, pk=self.kwargs['product_id'], restaurant=self.request.user.restaurant)
        form.instance.product = product
        return super().form_valid(form)

    def get_success_url(self):
        return reverse('product_detail_admin', kwargs={'pk': self.kwargs['product_id']})

class ProductToggleActionView(PermissionRequiredMixin, DetailView):
    permission_name = 'can_manage_menu'

    model = Product

    def get_queryset(self):
        return Product.objects.filter(restaurant=self.request.user.restaurant)

    def get(self, request, *args, **kwargs):
        product = self.get_object()
        action = kwargs.get('action')
        
        if action == 'active':
            product.is_active = not product.is_active
        elif action == 'popular':
            product.is_popular = not product.is_popular
        elif action == 'featured':
            product.is_featured = not product.is_featured
        elif action == 'stock':
            # Cycle through stock status
            statuses = ['in_stock', 'low_stock', 'out_of_stock']
            current_idx = statuses.index(product.stock_status)
            product.stock_status = statuses[(current_idx + 1) % len(statuses)]
            
        product.save()
        return HttpResponseRedirect(request.META.get('HTTP_REFERER', reverse('product_list')))
