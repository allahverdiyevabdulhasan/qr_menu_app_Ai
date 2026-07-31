from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomRoleViewSet, UserViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'customrole', CustomRoleViewSet)
router.register(r'user', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

