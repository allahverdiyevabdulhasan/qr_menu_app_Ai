from django.urls import path
from . import views

urlpatterns = [
    path('', views.StaffListView.as_view(), name='staff_profile_list'),
    path('add/', views.StaffCreateView.as_view(), name='staff_profile_add'),
    path('<int:pk>/edit/', views.StaffUpdateView.as_view(), name='staff_profile_edit'),
    
    path('payrolls/', views.PayrollListView.as_view(), name='payroll_list'),
    path('payrolls/add/', views.PayrollCreateView.as_view(), name='payroll_add'),
]
