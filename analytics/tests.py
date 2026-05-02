from decimal import Decimal
from django.test import TestCase
from accounts.models import User
from restaurants.models import Restaurant
from menu.models import Product, Category
from orders.models import Order, OrderItem
from payments.models import Payment
from analytics.services import get_revenue_metrics, get_net_profit, get_order_metrics

class AnalyticsTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='owner1', password='pw')
        self.restaurant = Restaurant.objects.create(name="Test Rest", owner=self.owner)
        self.category = Category.objects.create(restaurant=self.restaurant, name="Test Cat")
        self.product = Product.objects.create(restaurant=self.restaurant, category=self.category, name="Burger", price=10.00, cost_price=4.00)
        
        self.order = Order.objects.create(restaurant=self.restaurant, total_amount=9.00, payment_status='PAID', discount_amount=1.00)
        self.order_item = OrderItem.objects.create(order=self.order, product=self.product, quantity=1, unit_price=10.00, total_price=10.00)
        self.payment = Payment.objects.create(order=self.order, restaurant=self.restaurant, amount=9.00, status='PAID', method='CASH')

    def test_revenue_metrics(self):
        rev = get_revenue_metrics(self.restaurant)
        self.assertEqual(rev, 9.00)

    def test_net_profit_calculation(self):
        # Revenue (from payment) = 9.00
        # Product Cost = 4.00
        # Expense = 0.00
        # Net profit = 9.00 - 4.00 = 5.00
        profit = get_net_profit(self.restaurant)
        self.assertEqual(profit, Decimal('5.00'))

    def test_order_metrics(self):
        metrics = get_order_metrics(self.restaurant)
        self.assertEqual(metrics['total_orders'], 1)
