from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import AIRecommendation, AIInsight, AIChatMessage
from .serializers import AIRecommendationSerializer, AIInsightSerializer, AIChatMessageSerializer

from core.permissions import IsAIEnabled

class AIRecommendationViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = AIRecommendationSerializer
    permission_classes = [IsAuthenticated, IsAIEnabled]
    def get_queryset(self):
        return AIRecommendation.objects.all()

class AIInsightViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = AIInsightSerializer
    permission_classes = [IsAuthenticated, IsAIEnabled]
    def get_queryset(self):
        return AIInsight.objects.all()

class AIChatMessageViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    serializer_class = AIChatMessageSerializer
    permission_classes = [IsAuthenticated, IsAIEnabled]
    def get_queryset(self):
        return AIChatMessage.objects.all()

