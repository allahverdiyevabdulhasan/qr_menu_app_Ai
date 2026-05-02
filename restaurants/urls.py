from django.urls import path
from .views import (
    RestaurantDashboardView, RestaurantProfileUpdateView, 
    BranchListView, BranchCreateView, BranchUpdateView, BranchDeleteView,
    RestaurantSettingsUpdateView
)

urlpatterns = [
    path('dashboard/', RestaurantDashboardView.as_view(), name='restaurant_dashboard'),
    path('profile/', RestaurantProfileUpdateView.as_view(), name='restaurant_profile'),
    path('settings/', RestaurantSettingsUpdateView.as_view(), name='restaurant_settings'),
    path('branches/', BranchListView.as_view(), name='branch_list'),
    path('branches/add/', BranchCreateView.as_view(), name='branch_add'),
    path('branches/<int:pk>/edit/', BranchUpdateView.as_view(), name='branch_edit'),
    path('branches/<int:pk>/delete/', BranchDeleteView.as_view(), name='branch_delete'),
]
