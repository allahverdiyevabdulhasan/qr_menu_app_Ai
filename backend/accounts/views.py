from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from .models import CustomRole, User
from .serializers import CustomRoleSerializer, UserSerializer

class CustomRoleViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = CustomRole.objects.all()
    serializer_class = CustomRoleSerializer

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

class UserViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
