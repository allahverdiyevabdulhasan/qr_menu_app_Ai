from django.views import View
from django.shortcuts import render, get_object_or_404
from restaurants.models import Restaurant
from ai_engine.services import BudgetRecommendationService, FoodAdvisorService
from decimal import Decimal

class PublicAIBudgetRecommendationView(View):
    template_name = 'ai_engine/ai_budget_recommendation.html'

    def get(self, request, restaurant_slug, *args, **kwargs):
        restaurant = get_object_or_404(Restaurant, slug=restaurant_slug, status='active')
        return render(request, self.template_name, {'restaurant': restaurant})

    def post(self, request, restaurant_slug, *args, **kwargs):
        restaurant = get_object_or_404(Restaurant, slug=restaurant_slug, status='active')
        budget = request.POST.get("budget", "0")
        people_count = int(request.POST.get("people_count", 1))
        preferences = request.POST.get("preferences", "")
        
        result = BudgetRecommendationService().recommend(
            restaurant,
            budget=Decimal(budget),
            people_count=people_count,
            preferences=preferences,
        )

        return render(request, self.template_name, {
            "result": result, 
            "budget": budget,
            "restaurant": restaurant
        })

class PublicAIFoodAdvisorView(View):
    template_name = 'ai_engine/ai_food_advisor.html'

    def get(self, request, restaurant_slug, *args, **kwargs):
        restaurant = get_object_or_404(Restaurant, slug=restaurant_slug, status='active')
        return render(request, self.template_name, {'restaurant': restaurant})

    def post(self, request, restaurant_slug, *args, **kwargs):
        restaurant = get_object_or_404(Restaurant, slug=restaurant_slug, status='active')
        question = request.POST.get("question", "")
        result = FoodAdvisorService().advise(restaurant, question)
        return render(request, self.template_name, {
            "result": result, 
            "question": question,
            "restaurant": restaurant
        })
