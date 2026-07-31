from django.contrib.admin import register
from django.contrib import admin
from .models import AIRecommendation, AIInsight, AIChatMessage


@register(AIRecommendation)
class AIRecommendationAdmin(admin.ModelAdmin):
    list_display = ('restaurant', 'budget', 'people_count', 'total_price', 'created_at')
    list_filter = ('restaurant',)
    readonly_fields = ('recommended_products', 'ai_reason', 'created_at')


@register(AIInsight)
class AIInsightAdmin(admin.ModelAdmin):
    list_display = ('title', 'restaurant', 'insight_type', 'priority', 'status', 'created_at')
    list_filter = ('restaurant', 'insight_type', 'priority', 'status')
    search_fields = ('title', 'description')


@register(AIChatMessage)
class AIChatMessageAdmin(admin.ModelAdmin):
    list_display = ('restaurant', 'user', 'role', 'created_at')
    list_filter = ('restaurant', 'role')
    search_fields = ('message', 'response')
