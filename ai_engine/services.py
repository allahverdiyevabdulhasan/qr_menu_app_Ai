"""
AI Engine Services for NeyMenu AI.

Each service class is a thin wrapper that:
  1. Prepares a structured prompt from real database data.
  2. Calls `ai().complete()` or `ai().json_complete()` (never touches an SDK directly).
  3. Returns a typed Python dict/list/str for consumption by views.

Adding a new AI provider: only `providers.py` needs to change.
"""

from __future__ import annotations
import json
import logging
from decimal import Decimal
from typing import Any

from ai_engine.providers import ai

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# 1. BudgetRecommendationService
# ---------------------------------------------------------------------------

class BudgetRecommendationService:
    """
    Recommends product combinations that fit within a budget.
    Only recommends products that are ACTIVE and available in the restaurant.
    """

    def recommend(
        self,
        restaurant,
        budget: Decimal,
        people_count: int = 1,
        preferences: str = "",
        allergens: str = "",
        diet: str = "",
        spicy_preference: str = "",
    ) -> dict:
        from menu.models import Product

        # Build a clean, bounded product catalogue — never let AI invent products
        products = list(
            Product.objects.filter(
                restaurant=restaurant,
                is_active=True,
                stock_status='AVAILABLE',
            ).values("id", "name", "price", "calories", "is_vegetarian",
                     "is_vegan", "is_gluten_free", "spicy_level", "allergens")
        )

        if not products:
            return {"error": "No active products available in this restaurant."}

        system_prompt = (
            "You are a restaurant food advisor. "
            "You MUST only recommend products from the PRODUCT CATALOGUE provided. "
            "Never invent or suggest products that are not in the catalogue. "
            "Return valid JSON with key 'combinations' (list of 3 items). "
            "Each item has: 'products' (list of product names from catalogue), "
            "'total_price' (float), 'calories' (int), 'reason' (string)."
        )
        user_message = (
            f"Budget: {budget} for {people_count} person(s). "
            f"Preferences: {preferences or 'none'}. "
            f"Allergens to avoid: {allergens or 'none'}. "
            f"Diet: {diet or 'none'}. "
            f"Spicy preference: {spicy_preference or 'any'}.\n\n"
            f"PRODUCT CATALOGUE (JSON):\n{json.dumps(products, default=str)}"
        )

        result = ai().json_complete(system_prompt, user_message, response_key="budget")

        # Safety guard: strip any suggested product not in the real catalogue
        if result and "combinations" in result:
            valid_products = {p["name"]: p for p in products}
            for combo in result["combinations"]:
                combo_items = []
                for name in combo.get("products", []):
                    if name in valid_products:
                        combo_items.append({
                            "id": valid_products[name]["id"],
                            "name": name,
                            "price": valid_products[name]["price"]
                        })
                combo["products"] = combo_items

        return result or {"combinations": []}


# ---------------------------------------------------------------------------
# 2. FoodAdvisorService
# ---------------------------------------------------------------------------

class FoodAdvisorService:
    """Natural language menu search."""

    def advise(self, restaurant, question: str) -> dict:
        from menu.models import Product

        products = list(
            Product.objects.filter(restaurant=restaurant, is_active=True)
            .values("id", "name", "price", "description", "is_vegetarian",
                    "is_vegan", "is_gluten_free", "calories")
        )

        system_prompt = (
            "You are a helpful food advisor. "
            "Answer the customer's question by recommending ONLY products from "
            "the provided catalogue. Return JSON: {'products': [name,...], 'reason': str}."
        )
        user_message = (
            f"Customer question: {question}\n\n"
            f"MENU CATALOGUE:\n{json.dumps(products, default=str)}"
        )
        result = ai().json_complete(system_prompt, user_message, response_key="advisor")
        return result or {"products": [], "reason": ""}


# ---------------------------------------------------------------------------
# 3. ComboBuilderService
# ---------------------------------------------------------------------------

class ComboBuilderService:
    """Suggests combo deals built from real products."""

    def build(self, restaurant) -> dict:
        from menu.models import Product

        products = list(
            Product.objects.filter(restaurant=restaurant, is_active=True)
            .values("id", "name", "price", "category__name")
        )

        system_prompt = (
            "You are a menu strategist. Create 2-3 compelling combo deals "
            "using ONLY the products listed. "
            "Return JSON: {'combos': [{'name': str, 'items': [names], 'discount_percent': int}]}."
        )
        user_message = f"Products:\n{json.dumps(products, default=str)}"
        result = ai().json_complete(system_prompt, user_message, response_key="combo")
        return result or {"combos": []}


# ---------------------------------------------------------------------------
# 4. UpsellService
# ---------------------------------------------------------------------------

class UpsellService:
    """Recommends complementary items for an existing cart/product."""

    def suggest(self, restaurant, product_names: list[str]) -> dict:
        from menu.models import Product

        available = list(
            Product.objects.filter(restaurant=restaurant, is_active=True)
            .exclude(name__in=product_names)
            .values("id", "name", "price", "category__name")
        )

        system_prompt = (
            "You are an upsell assistant. Based on what the customer already has, "
            "suggest 2-3 add-ons from the available items. "
            "Return JSON: {'suggestions': [names], 'reason': str}."
        )
        user_message = (
            f"Current selection: {product_names}\n"
            f"Available items:\n{json.dumps(available, default=str)}"
        )
        result = ai().json_complete(system_prompt, user_message, response_key="upsell")
        return result or {"suggestions": [], "reason": ""}


# ---------------------------------------------------------------------------
# 5. ProductDescriptionService
# ---------------------------------------------------------------------------

class ProductDescriptionService:
    """Generates a marketing description for a product."""

    def generate(self, product_name: str, ingredients: str = "", cuisine: str = "") -> str:
        system_prompt = (
            "You are a creative menu copywriter. "
            "Write a single enticing product description (2-3 sentences, max 80 words). "
            "Do not include prices or allergen warnings."
        )
        user_message = (
            f"Product: {product_name}\n"
            f"Ingredients: {ingredients or 'not specified'}\n"
            f"Cuisine style: {cuisine or 'international'}"
        )
        return ai().complete(system_prompt, user_message, response_key="description")


# ---------------------------------------------------------------------------
# 6. MenuTranslationService
# ---------------------------------------------------------------------------

class MenuTranslationService:
    """Translates a product name and description into 5 languages."""

    LANGUAGES = ["az", "tr", "en", "ru", "ar"]

    def translate(self, name: str, description: str = "") -> dict:
        system_prompt = (
            "Translate the following food product name (and optional description) "
            "into az, tr, en, ru, ar. "
            "Return ONLY valid JSON: "
            "{'az': '...', 'tr': '...', 'en': '...', 'ru': '...', 'ar': '...'}."
        )
        user_message = f"Name: {name}\nDescription: {description}"
        result = ai().json_complete(system_prompt, user_message, response_key="translation")
        return result or {lang: name for lang in self.LANGUAGES}


# ---------------------------------------------------------------------------
# 7. CampaignSuggestionService
# ---------------------------------------------------------------------------

class CampaignSuggestionService:
    """Analyses sales metrics and suggests actionable campaigns."""

    def suggest(self, restaurant) -> dict:
        from analytics.services import (
            get_revenue_metrics, get_top_products, get_order_metrics,
        )
        from django.utils import timezone

        now = timezone.now()
        month_start = now.replace(day=1, hour=0, minute=0, second=0)

        revenue = get_revenue_metrics(restaurant, month_start, now)
        orders = get_order_metrics(restaurant, month_start, now)
        top = list(get_top_products(restaurant, month_start, now, limit=5))
        low = list(get_top_products(restaurant, month_start, now, limit=5, ascending=True))

        system_prompt = (
            "You are a restaurant marketing strategist. "
            "Based on the analytics, suggest 2 concrete campaigns. "
            "Return JSON: {'suggestions': [{'title': str, 'type': str, 'value': int, 'reason': str}]}."
        )
        user_message = (
            f"Monthly revenue: {revenue}\n"
            f"Order metrics: {json.dumps(orders, default=str)}\n"
            f"Top products: {json.dumps(top, default=str)}\n"
            f"Low products: {json.dumps(low, default=str)}"
        )
        result = ai().json_complete(system_prompt, user_message, response_key="campaign")
        return result or {"suggestions": []}


# ---------------------------------------------------------------------------
# 8. SalesAnalysisService
# ---------------------------------------------------------------------------

class SalesAnalysisService:
    """Generates an owner-friendly narrative from dashboard metrics."""

    def analyse(self, restaurant) -> str:
        from analytics.services import (
            get_revenue_metrics, get_order_metrics, get_net_profit,
        )
        from django.utils import timezone

        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0)

        revenue = get_revenue_metrics(restaurant, today_start, now)
        orders = get_order_metrics(restaurant, today_start, now)
        profit = get_net_profit(restaurant, today_start, now)

        system_prompt = (
            "You are a business intelligence assistant for a restaurant owner. "
            "Write a concise, friendly 3-4 sentence summary of today's performance. "
            "Highlight wins and flag any concerns. Plain text only, no markdown."
        )
        user_message = (
            f"Today's revenue: {revenue}\n"
            f"Net profit: {profit}\n"
            f"Order metrics: {json.dumps(orders, default=str)}"
        )
        return ai().complete(system_prompt, user_message, response_key="sales_analysis")


# ---------------------------------------------------------------------------
# 9. ReviewAnalysisService
# ---------------------------------------------------------------------------

class ReviewAnalysisService:
    """Classifies a review's sentiment and category."""

    def analyse(self, comment: str) -> dict:
        system_prompt = (
            "You are a sentiment analysis engine for restaurant reviews. "
            "Classify the review and return JSON: "
            "{'sentiment': 'POSITIVE'|'NEUTRAL'|'NEGATIVE', "
            " 'category': 'TASTE'|'PRICE'|'DELAY'|'SERVICE'|'CLEANLINESS'|'PORTION'|'PACKAGING'|'STAFF'|'GENERAL', "
            " 'summary': str (max 20 words)}."
        )
        result = ai().json_complete(system_prompt, comment, response_key="review")
        return result or {"sentiment": "NEUTRAL", "category": "GENERAL", "summary": comment[:60]}


# ---------------------------------------------------------------------------
# 10. StockForecastService
# ---------------------------------------------------------------------------

class StockForecastService:
    """Predicts stock needs based on order history."""

    def forecast(self, restaurant) -> dict:
        from inventory.models import InventoryItem, StockMovement
        from django.db.models import Sum
        from django.utils import timezone
        import datetime

        week_ago = timezone.now() - datetime.timedelta(days=7)
        items = InventoryItem.objects.filter(restaurant=restaurant)

        item_data = []
        for item in items:
            usage = (
                StockMovement.objects.filter(
                    inventory_item=item,
                    movement_type='ORDER_USAGE',
                    created_at__gte=week_ago,
                ).aggregate(total=Sum('quantity'))['total'] or 0
            )
            item_data.append({
                "name": item.name,
                "unit": item.get_unit_display(),
                "current_quantity": float(item.current_quantity),
                "weekly_usage": float(abs(usage)),
                "status": item.get_status_display(),
            })

        system_prompt = (
            "You are a supply chain analyst for a restaurant. "
            "Based on past week usage, predict what needs to be ordered in the next 7 days. "
            "Return JSON: {'forecast': [{'item': str, 'predicted_usage': str, 'days': 7, 'recommendation': str}]}."
        )
        user_message = f"Inventory data:\n{json.dumps(item_data, default=str)}"
        result = ai().json_complete(system_prompt, user_message, response_key="stock_forecast")
        return result or {"forecast": []}


# ---------------------------------------------------------------------------
# 11. RestaurantManagerChatService
# ---------------------------------------------------------------------------

class RestaurantManagerChatService:
    """
    Conversational interface for the restaurant owner.
    Pulls live data and feeds it as context before every response.
    """

    def chat(self, restaurant, user_message: str, history: list[dict] | None = None) -> str:
        from analytics.services import (
            get_revenue_metrics, get_net_profit, get_top_products,
            get_order_metrics, get_customer_metrics,
        )
        from customers.models import Customer
        from django.utils import timezone

        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0)

        # Build live context snapshot
        revenue_today = get_revenue_metrics(restaurant, today_start, now)
        profit_today = get_net_profit(restaurant, today_start, now)
        orders_today = get_order_metrics(restaurant, today_start, now)
        top_products = list(get_top_products(restaurant, today_start, now, limit=5))
        low_products = list(get_top_products(restaurant, today_start, now, limit=5, ascending=True))
        customers = get_customer_metrics(restaurant)
        inactive = Customer.objects.filter(
            restaurant=restaurant
        ).exclude(last_order_at=None).count()  # simplified

        context = (
            f"Restaurant: {restaurant.name}\n"
            f"Today revenue: {revenue_today}\n"
            f"Today net profit: {profit_today}\n"
            f"Today orders: {json.dumps(orders_today, default=str)}\n"
            f"Top products today: {json.dumps(top_products, default=str)}\n"
            f"Low products today: {json.dumps(low_products, default=str)}\n"
            f"Customer metrics: {json.dumps(customers)}\n"
        )

        system_prompt = (
            "You are an intelligent business assistant for a restaurant owner. "
            "You have access to live restaurant data shown below. "
            "Answer the owner's question in a concise, actionable way (3-5 sentences max). "
            "If the question is not related to restaurant management, politely redirect.\n\n"
            f"LIVE DATA CONTEXT:\n{context}"
        )
        return ai().complete(system_prompt, user_message, response_key="chat")


# ---------------------------------------------------------------------------
# 12. FrequentlyBoughtTogetherService
# ---------------------------------------------------------------------------

class FrequentlyBoughtTogetherService:
    """
    Suggests a complementary product to buy together with the current product,
    along with a custom discounted bundle deal and Turkish promotional text.
    """

    def suggest_pairing(self, product) -> dict:
        from menu.models import Product

        # Get other active products in this restaurant
        other_products = list(
            Product.objects.filter(restaurant=product.restaurant, is_active=True, stock_status='AVAILABLE')
            .exclude(id=product.id)
            .values("id", "name", "price", "category__name")
        )

        if not other_products:
            return {}

        system_prompt = (
            "You are an expert restaurant marketing and cross-selling engine. "
            "Suggest EXACTLY ONE complementary product from the provided list to pair with the user's selected product. "
            "Choose a product that makes culinary sense (e.g. a drink, side dish, sauce, or dessert to go with a main meal). "
            "Return JSON: "
            "{"
            "  'pairing_product_name': str (exact name of the paired product from the list),"
            "  'discount_percent': int (a realistic discount like 5, 10, 15, or 20 if bought together),"
            "  'pitch': str (a highly engaging, short Turkish marketing phrase explaining why they pair well together, e.g. 'Tavuk Izgara'nın yanına çıtır çıtır patates kızartması ve buz gibi kola çok yakışır!')"
            "}"
        )
        user_message = (
            f"Selected Product: {product.name} (Price: {product.price} TL)\n"
            f"Available Products List:\n{json.dumps(other_products, default=str)}"
        )

        result = ai().json_complete(system_prompt, user_message, response_key="combo")

        # Safely match product name to actual object
        if result and "pairing_product_name" in result:
            matched_product = Product.objects.filter(
                restaurant=product.restaurant,
                name=result["pairing_product_name"],
                is_active=True
            ).first()

            if matched_product:
                discount_percent = int(result.get("discount_percent", 10))
                original_total = product.price + matched_product.price
                # Calculate discounted price
                savings = (matched_product.price * discount_percent) / 100
                discounted_total = original_total - savings

                return {
                    "product": matched_product,
                    "discount_percent": discount_percent,
                    "savings": savings,
                    "discounted_total": discounted_total,
                    "original_total": original_total,
                    "pitch": result.get("pitch", "")
                }

        # Fallback to a default product if AI fails
        fallback_product = Product.objects.filter(
            restaurant=product.restaurant,
            is_active=True,
            stock_status='AVAILABLE'
        ).exclude(id=product.id).first()

        if fallback_product:
            original_total = product.price + fallback_product.price
            savings = fallback_product.price * 0.10  # 10%
            return {
                "product": fallback_product,
                "discount_percent": 10,
                "savings": savings,
                "discounted_total": original_total - savings,
                "original_total": original_total,
                "pitch": f"Bu lezzetli yemeğin yanında {fallback_product.name} harika bir tercih olacaktır!"
            }

        return {}
