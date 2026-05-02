from django.urls import path
from .views import (
    CategoryListView, CategoryCreateView, CategoryUpdateView, CategoryDeleteView,
    ProductListView, ProductCreateView, ProductUpdateView, ProductDetailAdminView,
    ProductOptionCreateView, ProductToggleActionView,
    PublicMenuView, PublicCategoryProductsView, PublicProductDetailView
)

urlpatterns = [
    # Admin/Staff URLs
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('categories/add/', CategoryCreateView.as_view(), name='category_add'),
    path('categories/<int:pk>/edit/', CategoryUpdateView.as_view(), name='category_edit'),
    path('categories/<int:pk>/delete/', CategoryDeleteView.as_view(), name='category_delete'),

    path('products/', ProductListView.as_view(), name='product_list'),
    path('products/add/', ProductCreateView.as_view(), name='product_add'),
    path('products/<int:pk>/edit/', ProductUpdateView.as_view(), name='product_edit'),
    path('products/<int:pk>/', ProductDetailAdminView.as_view(), name='product_detail_admin'),
    path('products/<int:product_id>/options/add/', ProductOptionCreateView.as_view(), name='product_option_add'),
    path('products/<int:pk>/toggle/<str:action>/', ProductToggleActionView.as_view(), name='product_toggle_action'),
]
