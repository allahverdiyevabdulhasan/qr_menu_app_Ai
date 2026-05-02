import os
import random
from datetime import timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from restaurants.models import Restaurant, Branch
from menu.models import Category, Product, ProductOption
from tables.models import RestaurantTable
from orders.models import Order, OrderItem
from payments.models import Payment
from reviews.models import Review
from campaigns.models import Campaign, Coupon
from inventory.models import InventoryItem, ProductIngredient, StockMovement
from expenses.models import Expense
from ai_engine.models import AIInsight, AIRecommendation
from subscriptions.models import Plan, Subscription

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed demo data for NeyMenu AI'

    def handle(self, *args, **options):
        self.stdout.write('Seeding demo data...')

        # 1. Users
        admin_user, _ = User.objects.get_or_create(
            username='superadmin',
            defaults={'email': 'admin@neymenu.com', 'role': 'SUPER_ADMIN', 'is_staff': True, 'is_superuser': True}
        )
        admin_user.set_password('Admin1234!')
        admin_user.save()

        owner_user, _ = User.objects.get_or_create(
            username='owner',
            defaults={'email': 'owner@demo.com', 'role': 'RESTAURANT_OWNER'}
        )
        owner_user.set_password('Owner1234!')
        owner_user.save()

        # 2. Restaurant & Branch
        restaurant, _ = Restaurant.objects.get_or_create(
            owner=owner_user,
            slug='demo',
            defaults={
                'name': 'NeyMenu Demo Restaurant',
                'phone': '+994 50 123 45 67',
                'address': 'Baku, Azerbaijan',
                'currency': '₼'
            }
        )
        owner_user.restaurant = restaurant
        owner_user.save()

        branch, _ = Branch.objects.get_or_create(
            restaurant=restaurant,
            name='Main Branch',
            defaults={'address': 'Downtown Baku'}
        )

        # 3. Plan & Subscription
        plan, _ = Plan.objects.get_or_create(
            name='Pro Plan',
            defaults={
                'price': Decimal('49.99'),
                'max_branches': 5,
                'max_tables': 50,
                'has_ai_features': True,
                'has_inventory': True,
                'has_crm': True
            }
        )

        Subscription.objects.get_or_create(
            restaurant=restaurant,
            defaults={
                'plan': plan,
                'status': 'ACTIVE',
                'start_date': timezone.now().date(),
                'end_date': timezone.now().date() + timedelta(days=365)
            }
        )

        # 4. Tables
        for i in range(1, 11):
            RestaurantTable.objects.get_or_create(
                restaurant=restaurant,
                branch=branch,
                table_number=str(i),
                defaults={'table_name': f'Table {i}'}
            )

        # 4. Categories & Products
        categories_data = {
            'Burgers': [
                ('Classic Burger', 8.50, 650, True),
                ('Cheese Burger', 9.50, 750, False),
                ('Chicken Burger', 7.50, 550, False),
                ('Veggie Burger', 8.00, 450, True),
                ('Double Patty Burger', 12.00, 950, False),
            ],
            'Pizza': [
                ('Margherita', 10.00, 800, True),
                ('Pepperoni', 12.50, 1100, False),
                ('Mixed Pizza', 14.00, 1200, False),
                ('Vegetarian Pizza', 11.00, 850, True),
                ('Quattro Formaggi', 13.00, 1000, True),
            ],
            'Salads': [
                ('Caesar Salad', 7.00, 350, False),
                ('Greek Salad', 6.50, 250, True),
                ('Garden Salad', 5.50, 150, True),
                ('Tuna Salad', 8.00, 400, False),
            ],
            'Drinks': [
                ('Coca Cola', 2.00, 140, False),
                ('Fanta', 2.00, 160, False),
                ('Water', 1.00, 0, True),
                ('Fresh Orange Juice', 4.00, 120, True),
                ('Ayran', 1.50, 80, True),
            ],
            'Desserts': [
                ('Cheesecake', 6.00, 450, True),
                ('Tiramisu', 7.00, 500, True),
                ('Ice Cream', 4.50, 300, True),
                ('Baklava', 5.00, 600, True),
            ],
            'Combo Menus': [
                ('Standard Combo', 15.00, 1200, False),
                ('Family Combo', 45.00, 3500, False),
                ('Office Pack', 30.00, 2500, False),
            ]
        }

        for cat_name, products in categories_data.items():
            category, _ = Category.objects.get_or_create(restaurant=restaurant, name=cat_name)
            for p_name, price, calories, is_veg in products:
                Product.objects.get_or_create(
                    restaurant=restaurant,
                    category=category,
                    name=p_name,
                    defaults={
                        'price': Decimal(str(price)),
                        'calories': calories,
                        'is_vegetarian': is_veg,
                        'is_active': True,
                        'stock_status': 'in_stock'
                    }
                )

        # 5. Inventory Items
        inventory_data = [
            ('Beef Patty', 'PIECE', 100, 20, 2.50),
            ('Chicken Fillet', 'PIECE', 80, 15, 1.80),
            ('Burger Bun', 'PIECE', 150, 30, 0.50),
            ('Tomato', 'KG', 10.0, 2.0, 1.20),
            ('Cheese Slice', 'PIECE', 200, 40, 0.30),
            ('Pizza Dough', 'PIECE', 100, 20, 0.80),
            ('Mozzarella', 'KG', 5.0, 1.0, 12.00),
            ('Lettuce', 'KG', 10.0, 2.0, 0.90),
        ]

        for name, unit, qty, min_qty, cost in inventory_data:
            InventoryItem.objects.get_or_create(
                restaurant=restaurant,
                name=name,
                defaults={
                    'unit': unit,
                    'current_quantity': Decimal(str(qty)),
                    'minimum_quantity': Decimal(str(min_qty)),
                    'cost_per_unit': Decimal(str(cost)),
                    'status': 'IN_STOCK'
                }
            )

        # 6. Campaigns & Coupons
        Campaign.objects.get_or_create(
            restaurant=restaurant,
            title='Grand Opening Discount',
            defaults={
                'description': 'Enjoy 20% off on all items!',
                'campaign_type': 'PERCENT_DISCOUNT',
                'discount_value': Decimal('20.00'),
                'is_active': True,
                'start_date': timezone.now() - timedelta(days=7),
                'end_date': timezone.now() + timedelta(days=30)
            }
        )

        Coupon.objects.get_or_create(
            restaurant=restaurant,
            code='WELCOME10',
            defaults={
                'discount_type': 'PERCENT',
                'discount_value': Decimal('10.00'),
                'usage_limit': 100,
                'is_active': True,
                'start_date': timezone.now() - timedelta(days=1),
                'end_date': timezone.now() + timedelta(days=365)
            }
        )

        # 7. Historical Orders, Payments, Reviews (Last 30 days)
        products = list(Product.objects.all())
        tables = list(RestaurantTable.objects.all())

        for i in range(50):
            days_ago = random.randint(0, 30)
            order_date = timezone.now() - timedelta(days=days_ago)
            
            table = random.choice(tables)
            order = Order.objects.create(
                restaurant=restaurant,
                branch=branch,
                table=table,
                order_type='DINE_IN',
                status='COMPLETED',
                subtotal=Decimal('0.00'),
                total_amount=Decimal('0.00'),
                created_at=order_date
            )
            
            subtotal = Decimal('0.00')
            for _ in range(random.randint(1, 4)):
                prod = random.choice(products)
                qty = random.randint(1, 2)
                item_total = prod.price * qty
                OrderItem.objects.create(
                    order=order,
                    product=prod,
                    product_name_snapshot=prod.name,
                    quantity=qty,
                    unit_price=prod.price,
                    total_price=item_total
                )
                subtotal += item_total
            
            order.subtotal = subtotal
            order.total_amount = subtotal # Simple for demo
            order.save()
            
            # Payment
            Payment.objects.create(
                restaurant=restaurant,
                order=order,
                amount=order.total_amount,
                method=random.choice(['CASH', 'CARD']),
                status='COMPLETED',
                created_at=order_date
            )
            
            # Review (sometimes)
            if random.random() > 0.6:
                Review.objects.create(
                    restaurant=restaurant,
                    order=order,
                    rating=random.randint(3, 5),
                    comment='Great food and service!',
                    taste_rating=random.randint(3, 5),
                    service_rating=random.randint(3, 5),
                    speed_rating=random.randint(3, 5),
                    price_rating=random.randint(3, 5),
                    ai_sentiment='POSITIVE',
                    ai_category='GENERAL',
                    created_at=order_date + timedelta(hours=1)
                )

        # 8. Expenses
        expense_categories = ['INGREDIENT', 'SALARY', 'RENT', 'UTILITY', 'MARKETING']
        for _ in range(20):
            days_ago = random.randint(0, 30)
            Expense.objects.create(
                restaurant=restaurant,
                branch=branch,
                title=f'Expense {random.randint(100, 999)}',
                category=random.choice(expense_categories),
                amount=Decimal(str(random.uniform(50.0, 500.0))),
                date=(timezone.now() - timedelta(days=days_ago)).date()
            )

        # 9. AI Insights
        AIInsight.objects.create(
            restaurant=restaurant,
            insight_type='SALES',
            title='Sales are up 15%',
            description='Your sales have increased compared to last week. Burgers are driving this growth.',
            priority='MEDIUM'
        )
        AIInsight.objects.create(
            restaurant=restaurant,
            insight_type='STOCK',
            title='Inventory Alert',
            description='Beef Patty stock is running low. Consider ordering more soon.',
            priority='HIGH'
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded demo data!'))
