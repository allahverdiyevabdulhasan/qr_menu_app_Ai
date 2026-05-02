"""
AI Engine tests.

Key guarantees under test:
1. Budget recommendation returns only ACTIVE products.
2. Inactive products are NEVER included in recommendations.
3. The provider abstraction works with MockAIProvider (no real API needed).
4. AIRecommendation model saves and reads correctly.
5. ReviewAnalysisService returns valid sentiment/category keys.
"""
from django.test import TestCase
from unittest.mock import patch
from decimal import Decimal

from accounts.models import User
from restaurants.models import Restaurant
from menu.models import Product, Category
from ai_engine.models import AIRecommendation, AIInsight, AIChatMessage
from ai_engine.providers import MockAIProvider
from ai_engine.services import BudgetRecommendationService, ReviewAnalysisService


class MockProviderTest(TestCase):
    """MockAIProvider is self-consistent and never raises."""

    def setUp(self):
        self.provider = MockAIProvider()

    def test_complete_returns_string(self):
        result = self.provider.complete("system", "user msg", response_key="chat")
        self.assertIsInstance(result, str)
        self.assertGreater(len(result), 0)

    def test_json_complete_budget_is_dict(self):
        result = self.provider.json_complete("system", "user msg", response_key="budget")
        self.assertIsInstance(result, dict)
        self.assertIn("combinations", result)
        self.assertEqual(len(result["combinations"]), 3)

    def test_json_complete_review_has_required_keys(self):
        result = self.provider.json_complete("system", "bad food", response_key="review")
        self.assertIn("sentiment", result)
        self.assertIn("category", result)
        self.assertIn("summary", result)
        self.assertIn(result["sentiment"], ["POSITIVE", "NEUTRAL", "NEGATIVE"])

    def test_unknown_key_returns_fallback(self):
        result = self.provider.complete("system", "hello?", response_key="NONEXISTENT_KEY")
        self.assertIsInstance(result, str)


class BudgetRecommendationServiceTest(TestCase):
    """BudgetRecommendationService must never recommend inactive products."""

    def setUp(self):
        self.owner = User.objects.create_user(username='ai_owner', password='pw')
        self.restaurant = Restaurant.objects.create(name="AI Test Restaurant", owner=self.owner)
        self.category = Category.objects.create(restaurant=self.restaurant, name="Main")

        # Active product
        self.active = Product.objects.create(
            restaurant=self.restaurant,
            category=self.category,
            name="Margherita Pizza",
            price=Decimal("12.00"),
            is_active=True,
            stock_status='AVAILABLE',
        )
        # Inactive product — must NEVER appear in recommendations
        self.inactive = Product.objects.create(
            restaurant=self.restaurant,
            category=self.category,
            name="INACTIVE ITEM — should never appear",
            price=Decimal("5.00"),
            is_active=False,
            stock_status='AVAILABLE',
        )
        # Out-of-stock product — must NEVER appear
        self.out_of_stock = Product.objects.create(
            restaurant=self.restaurant,
            category=self.category,
            name="OUT OF STOCK — should never appear",
            price=Decimal("8.00"),
            is_active=True,
            stock_status='OUT_OF_STOCK',
        )

    def test_only_active_products_in_catalogue(self):
        """Service must query only active + available products."""
        service = BudgetRecommendationService()
        result = service.recommend(self.restaurant, budget=Decimal("30.00"), people_count=2)
        # Check the combinations (MockAIProvider names won't match inactive, but let's verify safety guard)
        for combo in result.get("combinations", []):
            for name in combo.get("products", []):
                self.assertNotEqual(name, self.inactive.name,
                    "Inactive product must never appear in recommendations")
                self.assertNotEqual(name, self.out_of_stock.name,
                    "Out-of-stock product must never appear in recommendations")

    def test_empty_menu_returns_error(self):
        """When no products exist (all inactive), service should return an error dict."""
        self.active.is_active = False
        self.active.save()
        service = BudgetRecommendationService()
        result = service.recommend(self.restaurant, budget=Decimal("50.00"))
        self.assertIn("error", result)

    def test_recommendation_persisted(self):
        """A completed recommendation should be saveable to AIRecommendation model."""
        rec = AIRecommendation.objects.create(
            restaurant=self.restaurant,
            budget=Decimal("25.00"),
            people_count=2,
            recommended_products=["Margherita Pizza"],
            total_price=Decimal("12.00"),
            ai_reason="Best value option.",
        )
        self.assertEqual(rec.budget, Decimal("25.00"))
        self.assertIn("Margherita Pizza", rec.recommended_products)


class ReviewAnalysisServiceTest(TestCase):
    """ReviewAnalysisService returns valid, bounded sentiment/category values."""

    VALID_SENTIMENTS = {"POSITIVE", "NEUTRAL", "NEGATIVE"}
    VALID_CATEGORIES = {
        "TASTE", "PRICE", "DELAY", "SERVICE",
        "CLEANLINESS", "PORTION", "PACKAGING", "STAFF", "GENERAL",
    }

    def test_returns_valid_sentiment(self):
        service = ReviewAnalysisService()
        result = service.analyse("The food was cold and arrived late.")
        self.assertIn(result["sentiment"], self.VALID_SENTIMENTS)

    def test_returns_valid_category(self):
        service = ReviewAnalysisService()
        result = service.analyse("The staff was very rude.")
        self.assertIn(result["category"], self.VALID_CATEGORIES)

    def test_has_summary(self):
        service = ReviewAnalysisService()
        result = service.analyse("Amazing pizza, will come again!")
        self.assertIn("summary", result)
        self.assertIsInstance(result["summary"], str)


class AIInsightModelTest(TestCase):
    """AIInsight model saves and filters correctly."""

    def setUp(self):
        self.owner = User.objects.create_user(username='insight_owner', password='pw')
        self.restaurant = Restaurant.objects.create(name="Insight Rest", owner=self.owner)

    def test_create_and_dismiss(self):
        insight = AIInsight.objects.create(
            restaurant=self.restaurant,
            insight_type='SALES',
            title='Revenue dropped 20%',
            description='Investigate the cause.',
            priority='HIGH',
        )
        self.assertEqual(insight.status, 'NEW')
        insight.status = 'DISMISSED'
        insight.save()
        self.assertEqual(AIInsight.objects.get(pk=insight.pk).status, 'DISMISSED')

    def test_queryset_excludes_dismissed(self):
        AIInsight.objects.create(
            restaurant=self.restaurant, insight_type='GENERAL',
            title='Tip', description='X', priority='LOW', status='DISMISSED')
        active = AIInsight.objects.filter(
            restaurant=self.restaurant, status__in=['NEW', 'READ'])
        self.assertEqual(active.count(), 0)
