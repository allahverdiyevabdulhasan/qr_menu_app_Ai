from django.urls import path
from .views import ReviewDashboardView, ReviewListView, ReviewDetailView, ReviewCreateView

urlpatterns = [
    path('', ReviewDashboardView.as_view(), name='review_dashboard'),
    path('list/', ReviewListView.as_view(), name='review_list'),
    path('<int:pk>/', ReviewDetailView.as_view(), name='review_detail'),
    path('add/<str:order_number>/', ReviewCreateView.as_view(), name='review_add'),
]
