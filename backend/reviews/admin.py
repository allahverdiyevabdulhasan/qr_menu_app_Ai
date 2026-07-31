from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('customer', 'restaurant', 'rating', 'ai_sentiment', 'ai_category', 'created_at')
    list_filter = ('restaurant', 'rating', 'ai_sentiment', 'ai_category')
