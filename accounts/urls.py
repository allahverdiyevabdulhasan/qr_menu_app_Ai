from django.urls import path
from .views import CustomLoginView, CustomLogoutView, ProfileView, StaffListView, StaffCreateView, StaffUpdateView

urlpatterns = [
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', CustomLogoutView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('staff/', StaffListView.as_view(), name='staff_list'),
    path('staff/add/', StaffCreateView.as_view(), name='staff_add'),
    path('staff/<int:pk>/edit/', StaffUpdateView.as_view(), name='staff_edit'),
]
