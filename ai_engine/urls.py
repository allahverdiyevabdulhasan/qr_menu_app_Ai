from django.urls import path
from .views import (
    AIBudgetRecommendationView,
    AIFoodAdvisorView,
    AIComboBuilderView,
    AIUpsellView,
    AIProductDescriptionView,
    AITranslateProductView,
    AICampaignSuggestionView,
    AISalesAnalysisView,
    AIReviewAnalysisView,
    AIStockForecastView,
    AIRestaurantManagerChatView,
    AIInsightsDashboardView,
)

urlpatterns = [
    # Staff dashboards
    path('insights/', AIInsightsDashboardView.as_view(), name='ai_insights'),
    path('manager-chat/', AIRestaurantManagerChatView.as_view(), name='ai_manager_chat'),
    path('campaign-suggestions/', AICampaignSuggestionView.as_view(), name='ai_campaign_suggestions'),
    path('stock-forecast/', AIStockForecastView.as_view(), name='ai_stock_forecast'),

    # Customer-accessible tools
    path('budget-recommendation/', AIBudgetRecommendationView.as_view(), name='ai_budget_recommendation'),
    path('food-advisor/', AIFoodAdvisorView.as_view(), name='ai_food_advisor'),

    # Internal AJAX endpoints (called by frontend JS)
    path('combo-builder/', AIComboBuilderView.as_view(), name='ai_combo_builder'),
    path('upsell/', AIUpsellView.as_view(), name='ai_upsell'),
    path('product-description/', AIProductDescriptionView.as_view(), name='ai_product_description'),
    path('translate/', AITranslateProductView.as_view(), name='ai_translate_product'),
    path('sales-analysis/', AISalesAnalysisView.as_view(), name='ai_sales_analysis'),
    path('review-analysis/', AIReviewAnalysisView.as_view(), name='ai_review_analysis'),
]
