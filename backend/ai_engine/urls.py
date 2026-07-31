from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AIRecommendationViewSet, AIInsightViewSet, AIChatMessageViewSet

router = DefaultRouter()
router.include_format_suffixes = False
router.register(r'airecommendation', AIRecommendationViewSet)
router.register(r'aiinsight', AIInsightViewSet)
router.register(r'aichatmessage', AIChatMessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

