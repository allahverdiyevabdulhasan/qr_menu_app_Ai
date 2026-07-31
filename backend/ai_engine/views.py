from core.mixins import RestaurantFilterMixin
from rest_framework import viewsets
from .models import AIRecommendation, AIInsight, AIChatMessage
from .serializers import AIRecommendationSerializer, AIInsightSerializer, AIChatMessageSerializer

class AIRecommendationViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = AIRecommendation.objects.all()
    serializer_class = AIRecommendationSerializer

class AIInsightViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = AIInsight.objects.all()
    serializer_class = AIInsightSerializer

class AIChatMessageViewSet(RestaurantFilterMixin, viewsets.ModelViewSet):
    queryset = AIChatMessage.objects.all()
    serializer_class = AIChatMessageSerializer
