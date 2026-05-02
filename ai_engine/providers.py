"""
AI Provider layer for NeyMenu AI.

Architecture:
  BaseAIProvider  (abstract interface)
  ├── MockAIProvider      (always active, zero dependencies, used in dev/test)
  └── OpenAICompatibleProvider  (activated when AI_API_KEY env var is set)

The active provider is resolved once at import time by `get_provider()`.
All services in ai_engine/services/ depend exclusively on this interface —
they never import an SDK directly.
"""

from __future__ import annotations
import os
import json
import logging
from abc import ABC, abstractmethod
from typing import Any

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Base interface
# ---------------------------------------------------------------------------

class BaseAIProvider(ABC):
    """Every provider must implement exactly this contract."""

    @abstractmethod
    def complete(self, system_prompt: str, user_message: str, **kwargs) -> str:
        """
        Return a plain-text completion for the given prompt pair.
        Implementations must never raise — return an empty string on failure.
        """

    def json_complete(self, system_prompt: str, user_message: str, **kwargs) -> Any:
        """
        Like `complete`, but parses the response as JSON.
        Returns None when parsing fails.
        """
        raw = self.complete(system_prompt, user_message, **kwargs)
        try:
            # Strip markdown code fences that some models add
            clean = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
            return json.loads(clean)
        except (json.JSONDecodeError, TypeError):
            logger.warning("AI provider returned non-JSON: %s", raw[:200])
            return None


# ---------------------------------------------------------------------------
# Mock provider (development / testing — no API key required)
# ---------------------------------------------------------------------------

class MockAIProvider(BaseAIProvider):
    """
    Deterministic stub that returns readable fake responses.
    Keeps the whole project functional without any external API.
    """

    _RESPONSES: dict[str, str] = {
        "budget": json.dumps({
            "combinations": [
                {"products": ["Margherita Pizza", "Cola"], "total_price": 18.50, "calories": 820,
                 "reason": "Classic and satisfying choice within budget."},
                {"products": ["Caesar Salad", "Lemonade"], "total_price": 14.00, "calories": 480,
                 "reason": "Light and refreshing option."},
                {"products": ["Burger", "Fries", "Water"], "total_price": 22.00, "calories": 1100,
                 "reason": "Hearty meal, great value."},
            ]
        }),
        "advisor": json.dumps({
            "products": ["Margherita Pizza", "Veggie Wrap"],
            "reason": "These best match your preferences."
        }),
        "combo": json.dumps({
            "combos": [
                {"name": "Value Combo", "items": ["Burger", "Fries", "Cola"], "discount_percent": 10},
                {"name": "Light Combo", "items": ["Salad", "Juice"], "discount_percent": 5},
            ]
        }),
        "upsell": json.dumps({
            "suggestions": ["Chocolate Cake", "Lemonade", "Extra Cheese"],
            "reason": "Popular add-ons with your selection."
        }),
        "description": "A delightful dish prepared with the freshest ingredients, "
                       "bursting with flavour and served at peak perfection.",
        "translation": json.dumps({
            "az": "Menyudakı məhsul", "tr": "Menüdeki ürün",
            "en": "Menu product", "ru": "Продукт меню", "ar": "منتج القائمة"
        }),
        "campaign": json.dumps({
            "suggestions": [
                {"title": "Happy Hour Discount", "type": "PERCENT_DISCOUNT", "value": 15,
                 "reason": "Sales dip between 15:00–17:00. A discount will drive traffic."},
                {"title": "Family Combo Deal", "type": "COMBO", "value": 20,
                 "reason": "Groups of 3+ are underserved by current menu."},
            ]
        }),
        "sales_analysis": ("Sales are trending +12% vs last week. "
                           "Your top performer is Margherita Pizza (38 units). "
                           "Consider restocking Coca-Cola — it's close to sell-out."),
        "review": json.dumps({
            "sentiment": "NEGATIVE",
            "category": "DELAY",
            "summary": "Customer experienced a long wait time and was dissatisfied with service speed."
        }),
        "stock_forecast": json.dumps({
            "forecast": [
                {"item": "Flour", "predicted_usage": "12 KG", "days": 7,
                 "recommendation": "Order at least 15 KG to be safe."},
                {"item": "Tomato Sauce", "predicted_usage": "8 L", "days": 7,
                 "recommendation": "Current stock is sufficient."},
            ]
        }),
        "chat": "Based on today's data, your revenue is on track. "
                "Margherita Pizza is your best seller. "
                "Consider a weekend promotion on slow-moving items.",
    }

    def complete(self, system_prompt: str, user_message: str, **kwargs) -> str:  # noqa: D401
        """Return a deterministic mock response keyed by a hint in kwargs."""
        key = kwargs.get("response_key", "chat")
        return self._RESPONSES.get(key, f"[Mock response for: {user_message[:60]}]")


# ---------------------------------------------------------------------------
# OpenAI-compatible provider (real API — activated by AI_API_KEY env var)
# ---------------------------------------------------------------------------

class OpenAICompatibleProvider(BaseAIProvider):
    """
    Works with OpenAI, Azure OpenAI, or any API that follows the
    /v1/chat/completions endpoint convention.

    Set these environment variables:
        AI_API_KEY   – required
        AI_BASE_URL  – optional, defaults to https://api.openai.com/v1
        AI_MODEL     – optional, defaults to gpt-4o-mini
    """

    def __init__(self) -> None:
        self.api_key = os.environ["AI_API_KEY"]
        self.base_url = os.environ.get("AI_BASE_URL", "https://api.openai.com/v1")
        self.model = os.environ.get("AI_MODEL", "gpt-4o-mini")

    def complete(self, system_prompt: str, user_message: str, **kwargs) -> str:
        try:
            import httpx  # lightweight HTTP client; pip install httpx
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                "temperature": kwargs.get("temperature", 0.7),
                "max_tokens": kwargs.get("max_tokens", 800),
            }
            resp = httpx.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30,
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]
        except Exception as exc:
            logger.error("OpenAI-compatible provider error: %s", exc)
            return ""


# ---------------------------------------------------------------------------
# Provider resolver
# ---------------------------------------------------------------------------

def get_provider() -> BaseAIProvider:
    """
    Returns the active AI provider.
    Uses the real API only when AI_API_KEY is present in the environment.
    Falls back to MockAIProvider silently so the app never crashes.
    """
    if os.environ.get("AI_API_KEY"):
        try:
            provider = OpenAICompatibleProvider()
            logger.info("AI: using OpenAICompatibleProvider (model=%s)", provider.model)
            return provider
        except Exception as exc:
            logger.warning("Could not init OpenAICompatibleProvider (%s). Using Mock.", exc)
    logger.info("AI: using MockAIProvider (no AI_API_KEY set)")
    return MockAIProvider()


# Singleton — resolved once per process start
_provider: BaseAIProvider = get_provider()


def ai() -> BaseAIProvider:
    """Module-level shortcut used by all services."""
    return _provider
