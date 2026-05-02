# NeyMenu AI 🍽️

An AI-powered restaurant operating system built with Django 5 + Django Channels + PostgreSQL.

## Features

- **QR Menu** — Public customer menu, add to cart, checkout, order tracking
- **Order Management** — Dine-in, Takeaway, Pre-order flows
- **Kitchen Screen** — Real-time order updates via WebSockets
- **Payments & Cashier** — Cash, Card, Online payment logging
- **Analytics** — Revenue, net profit, product performance, hour-by-hour charts
- **CRM** — Customer profiles, segmentation, loyalty points
- **İKA System** — Ikram (Loyalty), Kampaniya (Campaigns), Coupon engine
- **Reviews** — AI-assisted sentiment classification
- **Inventory** — Raw material tracking, automatic stock deduction on order completion
- **Expenses** — Operational cost logging with net profit integration
- **AI Engine** — Budget Advisor, Food Advisor, Combo Builder, Campaign Suggester, Manager Chat
- **Multi-language** — AZ, TR, EN, RU, AR with RTL support for Arabic

---

## Quick Start (Local Dev — SQLite, no Redis)

```bash
# 1. Clone and enter the project
git clone <repo-url>
cd "Qr_menu APP"

# 2. Create a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Linux/macOS

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env — at minimum set SECRET_KEY

# 5. Apply migrations (uses SQLite by default when DB_HOST is blank)
python manage.py migrate

# 6. Create a superuser
python manage.py createsuperuser

# 7. Seed demo data (after implementation)
# python manage.py seed_demo

# 8. Collect static files
python manage.py collectstatic --noinput

# 9. Run the dev server
python manage.py runserver
```

Open: http://127.0.0.1:8000/

---

## Production Setup (PostgreSQL + Redis)

### 1. Database

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE neymenu_db;"
```

Set in `.env`:
```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=neymenu_db
DB_USER=postgres
DB_PASSWORD=your_password
```

Then run:
```bash
python manage.py migrate
```

### 2. Redis (WebSocket real-time)

```bash
# Docker
docker run -d -p 6379:6379 redis:alpine
```

Set in `.env`:
```env
REDIS_URL=redis://127.0.0.1:6379/1
```

### 3. Production Server

```bash
# Daphne (ASGI — supports WebSockets)
daphne -b 0.0.0.0 -p 8000 neymenu_ai.asgi:application

# Or with gunicorn + uvicorn workers (HTTP only, no WebSockets)
gunicorn neymenu_ai.asgi:application -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### 4. Production Environment Variables

```env
SECRET_KEY=<strong-random-key>
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com
SECURE_SSL_REDIRECT=True
DB_HOST=127.0.0.1
REDIS_URL=redis://127.0.0.1:6379/1
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

---

## AI Provider Setup

The AI engine uses a **provider abstraction** — no AI key is ever required to run the project.

| Scenario | Provider | Config |
|----------|----------|--------|
| Development / Testing | `MockAIProvider` | No config needed — automatic |
| Production with real AI | `OpenAICompatibleProvider` | Set `AI_API_KEY` in `.env` |

```env
AI_API_KEY=sk-...
AI_BASE_URL=https://api.openai.com/v1   # optional
AI_MODEL=gpt-4o-mini                    # optional
```

Compatible with: OpenAI, Azure OpenAI, Groq, Ollama (any `/v1/chat/completions` endpoint).

---

## Demo Seed Data

After implementing the management command:
```bash
python manage.py seed_demo
```

This creates a complete demo restaurant with orders, products, customers, and reviews so the dashboard shows meaningful data immediately.

---

## Demo User Credentials

After running `seed_demo`:

| Role | Username | Password | Access |
|------|----------|----------|--------|
| Super Admin | `superadmin` | `Admin1234!` | Full system access, all restaurants |
| Restaurant Owner | `owner` | `Owner1234!` | Full access to their restaurant |
| Manager | `manager` | `Manager1234!` | Dashboard, orders, analytics, staff |
| Waiter | `waiter` | `Waiter1234!` | View orders, change status |
| Kitchen | `kitchen` | `Kitchen1234!` | Kitchen screen only |
| Cashier | `cashier` | `Cashier1234!` | Cashier panel, payments |

> **Important:** Change all passwords immediately on any live deployment.

---

## Translation (i18n)

The project supports 5 languages: `az`, `tr`, `en`, `ru`, `ar`.

### Workflow

```bash
# 1. Extract translatable strings from all templates and Python files
python manage.py makemessages -l az -l tr -l ru -l ar

# 2. Edit the generated .po files in locale/<lang>/LC_MESSAGES/django.po
# Fill in msgstr for each msgid

# 3. Compile translations
python manage.py compilemessages
```

### Adding a New Language

1. Add the language code to `LANGUAGES` in `settings.py`
2. Create the locale directory: `mkdir locale/<code>/LC_MESSAGES`
3. Run `makemessages` and `compilemessages`

### Product Translations

Product names and descriptions use `django-modeltranslation`. The `menu/translation.py` file registers translation fields. After running `migrate`, columns like `name_az`, `name_tr`, `name_en`, etc. are automatically created on the `Product` and `Category` models.

---

## Project Architecture

```
neymenu_ai/          # Django project package (settings, urls, asgi, wsgi)
├── accounts/        # Custom User model, roles, auth views, decorators
├── restaurants/     # Restaurant, Branch, RestaurantSettings + access mixins
├── menu/            # Category, Product, ProductOption, ProductTranslation
├── tables/          # RestaurantTable, QR code generation
├── orders/          # Order, OrderItem, session cart, signals
├── payments/        # Payment model, cashier panel, daily summary
├── analytics/       # Service layer for revenue/profit metrics + dashboard views
├── customers/       # Customer CRM, segmentation, favorite products
├── loyalty/         # LoyaltyRule, LoyaltyTransaction, LoyaltyReward
├── campaigns/       # Campaign, Coupon, coupon validation service
├── reviews/         # Review model + AI sentiment analysis service
├── inventory/       # InventoryItem, ProductIngredient, StockMovement
├── expenses/        # Expense model, daily/monthly totals, net profit link
├── ai_engine/       # Provider abstraction + 11 AI services + views
├── core/            # Shared utilities (placeholder)
├── subscriptions/   # Restaurant subscription plans (placeholder)
├── support/         # Support tickets (placeholder)
├── templates/       # All HTML templates (flat tree per app)
├── static/          # CSS (neymenu.css design system), JS, images
├── locale/          # Translation files (.po, .mo) per language
└── media/           # User-uploaded files (product images, QR codes)
```

### App Responsibilities

| App | Responsibility |
|-----|---------------|
| `accounts` | Custom User with role enum (OWNER, MANAGER, WAITER, KITCHEN, CASHIER, CUSTOMER) |
| `restaurants` | Multi-tenant root; all other models FK to Restaurant |
| `menu` | Product catalog with dietary flags, nutritional info, translations |
| `tables` | QR code generation, table status tracking |
| `orders` | Full order lifecycle: cart → checkout → kitchen → serve → complete |
| `payments` | Payment records; post_save signal updates Order.payment_status |
| `analytics` | Service layer only — no models; all data derived from Orders/Payments |
| `customers` | Auto-linked on checkout via phone/email; VIP segmentation |
| `loyalty` | Earn points on COMPLETED order (signal); redeem at checkout |
| `campaigns` | Coupon validation (date, usage, min amount); active campaign display |
| `reviews` | Post-order review form; AI sentiment classification stub |
| `inventory` | Stock deduction on COMPLETED order (signal); low-stock alerts |
| `expenses` | Manual expense logging; deducted from net profit in analytics |
| `ai_engine` | Provider abstraction → 11 services; MockAIProvider works with no API key |

### Key Signals

| Signal | Trigger | Effect |
|--------|---------|--------|
| `orders.signals.broadcast_order_update` | Any Order save | WebSocket broadcast to kitchen/waiter |
| `orders.signals.broadcast_order_update` | Order → COMPLETED | Earn loyalty points |
| `orders.signals.broadcast_order_update` | Order → COMPLETED | Deduct inventory stock |
| `payments.signals` | Payment save | Update Order.payment_status |

---

## URL Map

| Prefix | App | Notes |
|--------|-----|-------|
| `/admin/` | Django Admin | Super admin only |
| `/accounts/` | accounts | Login, logout, register, profile |
| `/restaurant/` | restaurants | Dashboard, branch, settings |
| `/menu/` | menu | Category/product CRUD, toggles |
| `/tables/` | tables | Table management, QR download |
| `/orders/` | orders | Staff order list, detail, status |
| `/payments/` | payments | Payment list, cashier panel |
| `/analytics/` | analytics | Revenue, net profit, product reports |
| `/customers/` | customers | CRM list, detail, segments |
| `/loyalty/` | loyalty | Rules, rewards, transactions |
| `/campaigns/` | campaigns | Campaign/coupon CRUD |
| `/reviews/` | reviews | Review dashboard, detail |
| `/inventory/` | inventory | Stock CRUD, alerts, movements |
| `/expenses/` | expenses | Expense list, report |
| `/ai/` | ai_engine | All AI endpoints |
| `/m/<slug>/` | menu (public) | Customer-facing: menu, cart, checkout, tracking |

---

## Model Relationships (Summary)

```
Restaurant ─┬─ Branch (many)
            ├─ User (many, staff)
            ├─ Category → Product → ProductOption
            │                     └─ ProductIngredient → InventoryItem
            ├─ RestaurantTable
            ├─ Order ──── OrderItem → Product
            │   └─ Payment
            ├─ Customer ─ LoyaltyTransaction
            ├─ LoyaltyRule / LoyaltyReward
            ├─ Campaign / Coupon
            ├─ Review → Order → Customer
            ├─ InventoryItem → StockMovement
            ├─ Expense
            └─ AIRecommendation / AIInsight / AIChatMessage
```

---

## Running Tests

```bash
# Requires a running database (PostgreSQL or SQLite fallback)
python manage.py test

# Run a specific app's tests
python manage.py test inventory
python manage.py test expenses
python manage.py test ai_engine
```

---

## Security Notes

- `SECRET_KEY` — **must** be set to a random value in production
- `DEBUG=False` — automatically enables `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, HSTS
- `ALLOWED_HOSTS` — must list your exact domain(s)
- `CORS_ALLOWED_ORIGINS` — set explicitly in production (never allow all in prod)
- `AI_API_KEY` — stored in `.env`, never in source code
- All staff views protected by `RestaurantAccessMixin` — multi-tenant data isolation enforced at queryset level
- All public customer views are sessionless where possible
