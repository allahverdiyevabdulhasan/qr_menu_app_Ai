from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .api_views import AIRecommendationViewSet, AIInsightViewSet, AIChatMessageViewSet

router = SimpleRouter()
router.register(r'airecommendations', AIRecommendationViewSet, basename='airecommendations')
router.register(r'aiinsights', AIInsightViewSet, basename='aiinsights')
router.register(r'aichatmessages', AIChatMessageViewSet, basename='aichatmessages')

urlpatterns = [
    path('', include(router.urls)),
]
