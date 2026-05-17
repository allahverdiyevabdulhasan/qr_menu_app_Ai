from django.urls import path
from .views import (
    ReviewDashboardView, ReviewListView, ReviewDetailView, ReviewCreateView, ProductReviewCreateView,
    ReviewDeleteView, ProductReviewDeleteView
)

urlpatterns = [
    path('', ReviewDashboardView.as_view(), name='review_dashboard'),
    path('list/', ReviewListView.as_view(), name='review_list'),
    path('<int:pk>/', ReviewDetailView.as_view(), name='review_detail'),
    path('<int:pk>/delete/', ReviewDeleteView.as_view(), name='review_delete'),
    path('product/<int:pk>/delete/', ProductReviewDeleteView.as_view(), name='product_review_delete'),
    path('add/<str:order_number>/', ReviewCreateView.as_view(), name='review_add'),
    path('product/<int:product_id>/add/', ProductReviewCreateView.as_view(), name='product_review_add'),
]
