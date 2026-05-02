"""
AI Engine Views — staff-facing (RestaurantAccessMixin required).
All AI calls go through the service layer; views only handle HTTP I/O.
"""
from django.views import View
from django.views.generic import TemplateView, ListView
from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib.auth.mixins import LoginRequiredMixin
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_POST

from restaurants.views import RestaurantAccessMixin
from ai_engine.rate_limit import check_rate_limit
from ai_engine.models import AIRecommendation, AIInsight, AIChatMessage
from ai_engine.services import (
    BudgetRecommendationService,
    FoodAdvisorService,
    ComboBuilderService,
    UpsellService,
    ProductDescriptionService,
    MenuTranslationService,
    CampaignSuggestionService,
    SalesAnalysisService,
    ReviewAnalysisService,
    StockForecastService,
    RestaurantManagerChatService,
)


def _rate_check(request, action, **kwargs):
    """Helper: returns JsonResponse 429 on limit breach, else None."""
    if not check_rate_limit(request.user.restaurant.id, action, **kwargs):
        return JsonResponse({"error": "Rate limit exceeded. Try again later."}, status=429)
    return None


# ---------------------------------------------------------------------------
# Budget Recommendation (public-friendly, also used by staff)
# ---------------------------------------------------------------------------

class AIBudgetRecommendationView(LoginRequiredMixin, View):
    template_name = 'ai_engine/ai_budget_recommendation.html'

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)

    def post(self, request, *args, **kwargs):
        if (resp := _rate_check(request, "budget")):
            return resp

        restaurant = request.user.restaurant
        budget = request.POST.get("budget", "0")
        people_count = int(request.POST.get("people_count", 1))
        preferences = request.POST.get("preferences", "")
        allergens = request.POST.get("allergens", "")
        diet = request.POST.get("diet", "")
        spicy = request.POST.get("spicy_preference", "")

        from decimal import Decimal
        result = BudgetRecommendationService().recommend(
            restaurant,
            budget=Decimal(budget),
            people_count=people_count,
            preferences=preferences,
            allergens=allergens,
            diet=diet,
            spicy_preference=spicy,
        )

        # Persist recommendation
        if result.get("combinations"):
            first = result["combinations"][0]
            AIRecommendation.objects.create(
                restaurant=restaurant,
                budget=Decimal(budget),
                people_count=people_count,
                preferences=preferences,
                recommended_products=first.get("products", []),
                total_price=first.get("total_price"),
                ai_reason=first.get("reason", ""),
            )

        return render(request, self.template_name, {"result": result, "budget": budget})


# ---------------------------------------------------------------------------
# Food Advisor
# ---------------------------------------------------------------------------

class AIFoodAdvisorView(LoginRequiredMixin, View):
    template_name = 'ai_engine/ai_food_advisor.html'

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)

    def post(self, request, *args, **kwargs):
        if (resp := _rate_check(request, "advisor")):
            return resp
        question = request.POST.get("question", "")
        result = FoodAdvisorService().advise(request.user.restaurant, question)
        return render(request, self.template_name, {"result": result, "question": question})


# ---------------------------------------------------------------------------
# Combo Builder (AJAX-friendly JSON response)
# ---------------------------------------------------------------------------

class AIComboBuilderView(RestaurantAccessMixin, View):
    def get(self, request, *args, **kwargs):
        if (resp := _rate_check(request, "combo")):
            return resp
        result = ComboBuilderService().build(request.user.restaurant)
        return JsonResponse(result)


# ---------------------------------------------------------------------------
# Upsell (AJAX-friendly JSON response)
# ---------------------------------------------------------------------------

class AIUpsellView(RestaurantAccessMixin, View):
    def post(self, request, *args, **kwargs):
        import json as _json
        if (resp := _rate_check(request, "upsell")):
            return resp
        product_names = _json.loads(request.body).get("products", [])
        result = UpsellService().suggest(request.user.restaurant, product_names)
        return JsonResponse(result)


# ---------------------------------------------------------------------------
# Product Description Generator
# ---------------------------------------------------------------------------

class AIProductDescriptionView(RestaurantAccessMixin, View):
    def post(self, request, *args, **kwargs):
        if (resp := _rate_check(request, "description")):
            return resp
        name = request.POST.get("product_name", "")
        ingredients = request.POST.get("ingredients", "")
        cuisine = request.POST.get("cuisine", "")
        description = ProductDescriptionService().generate(name, ingredients, cuisine)
        return JsonResponse({"description": description})


# ---------------------------------------------------------------------------
# Menu Translation
# ---------------------------------------------------------------------------

class AITranslateProductView(RestaurantAccessMixin, View):
    def post(self, request, *args, **kwargs):
        if (resp := _rate_check(request, "translation")):
            return resp
        name = request.POST.get("name", "")
        desc = request.POST.get("description", "")
        result = MenuTranslationService().translate(name, desc)
        return JsonResponse(result)


# ---------------------------------------------------------------------------
# Campaign Suggestion
# ---------------------------------------------------------------------------

class AICampaignSuggestionView(RestaurantAccessMixin, TemplateView):
    template_name = 'ai_engine/ai_campaign_suggestions.html'

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        if check_rate_limit(self.request.user.restaurant.id, "campaign"):
            ctx["suggestions"] = CampaignSuggestionService().suggest(
                self.request.user.restaurant
            ).get("suggestions", [])
        else:
            ctx["rate_limited"] = True
        return ctx


# ---------------------------------------------------------------------------
# Sales Analysis
# ---------------------------------------------------------------------------

class AISalesAnalysisView(RestaurantAccessMixin, View):
    def get(self, request, *args, **kwargs):
        if (resp := _rate_check(request, "sales_analysis")):
            return resp
        analysis = SalesAnalysisService().analyse(request.user.restaurant)
        return JsonResponse({"analysis": analysis})


# ---------------------------------------------------------------------------
# Review Analysis (internal AJAX called from review form/detail)
# ---------------------------------------------------------------------------

class AIReviewAnalysisView(RestaurantAccessMixin, View):
    def post(self, request, *args, **kwargs):
        if (resp := _rate_check(request, "review")):
            return resp
        comment = request.POST.get("comment", "")
        result = ReviewAnalysisService().analyse(comment)
        return JsonResponse(result)


# ---------------------------------------------------------------------------
# Stock Forecast
# ---------------------------------------------------------------------------

class AIStockForecastView(RestaurantAccessMixin, TemplateView):
    template_name = 'inventory/stock_forecast.html'  # reuses existing template

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        if check_rate_limit(self.request.user.restaurant.id, "stock_forecast"):
            ctx["forecast"] = StockForecastService().forecast(
                self.request.user.restaurant
            )
        else:
            ctx["rate_limited"] = True
        return ctx


# ---------------------------------------------------------------------------
# Restaurant Manager Chat
# ---------------------------------------------------------------------------

class AIRestaurantManagerChatView(RestaurantAccessMixin, View):
    template_name = 'ai_engine/ai_restaurant_manager.html'

    def get(self, request, *args, **kwargs):
        history = AIChatMessage.objects.filter(
            restaurant=request.user.restaurant
        ).order_by('-created_at')[:20]
        return render(request, self.template_name, {"history": history})

    def post(self, request, *args, **kwargs):
        if (resp := _rate_check(request, "chat", max_calls=30)):
            return resp

        message = request.POST.get("message", "").strip()
        if not message:
            if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                return JsonResponse({"error": "Empty message"}, status=400)
            return redirect("ai_manager_chat")

        restaurant = request.user.restaurant
        response = RestaurantManagerChatService().chat(restaurant, message)

        msg_obj = AIChatMessage.objects.create(
            restaurant=restaurant,
            user=request.user,
            role="user",
            message=message,
            response=response,
        )

        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({
                "message": message,
                "response": response,
                "created_at": msg_obj.created_at.strftime("%M %d, %H:%M")
            })

        return redirect("ai_manager_chat")


# ---------------------------------------------------------------------------
# AI Insights Dashboard
# ---------------------------------------------------------------------------

class AIInsightsDashboardView(RestaurantAccessMixin, ListView):
    model = AIInsight
    template_name = 'ai_engine/ai_insights.html'
    context_object_name = 'insights'

    def get_queryset(self):
        return AIInsight.objects.filter(
            restaurant=self.request.user.restaurant,
            status__in=['NEW', 'READ'],
        )

    def post(self, request, *args, **kwargs):
        """Mark an insight as dismissed."""
        insight_id = request.POST.get("insight_id")
        AIInsight.objects.filter(
            id=insight_id,
            restaurant=request.user.restaurant,
        ).update(status='DISMISSED')
        return redirect("ai_insights")
