from django.test import TestCase
from django.utils import timezone
from accounts.models import User
from restaurants.models import Restaurant
from menu.models import Product, Category
from orders.models import Order, OrderItem
from payments.models import Payment
from expenses.models import Expense
from analytics.services import get_net_profit
from decimal import Decimal
import datetime


class NetProfitWithExpensesTest(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='owner_exp', password='pw')
        self.restaurant = Restaurant.objects.create(name="Expense Test Restaurant", owner=self.owner)
        self.category = Category.objects.create(restaurant=self.restaurant, name="Food")
        self.product = Product.objects.create(
            restaurant=self.restaurant,
            category=self.category,
            name="Pizza",
            price=Decimal('20.00'),
            cost_price=Decimal('8.00'),  # cost per unit
        )

    def _make_paid_order(self, total, discount=Decimal('0.00')):
        """Helper to create a completed paid order with one pizza."""
        order = Order.objects.create(
            restaurant=self.restaurant,
            total_amount=total,
            subtotal=total,
            discount_amount=discount,
            payment_status='PAID',
            status='COMPLETED',
        )
        OrderItem.objects.create(
            order=order,
            product=self.product,
            quantity=1,
            unit_price=self.product.price,
            total_price=total,
        )
        Payment.objects.create(
            order=order,
            restaurant=self.restaurant,
            amount=total,
            method='CASH',
            status='PAID',
        )
        return order

    def test_net_profit_without_expenses(self):
        """Revenue=20, ProductCost=8, Discount=0, Expenses=0 → Profit=12"""
        self._make_paid_order(Decimal('20.00'))
        profit = get_net_profit(self.restaurant)
        self.assertEqual(profit, Decimal('12.00'))

    def test_net_profit_with_expenses(self):
        """Revenue=20, ProductCost=8, Discount=0, Expenses=5 → Profit=7"""
        self._make_paid_order(Decimal('20.00'))
        Expense.objects.create(
            restaurant=self.restaurant,
            title='Electricity bill',
            category='UTILITY',
            amount=Decimal('5.00'),
            date=timezone.now().date(),
        )
        profit = get_net_profit(self.restaurant)
        self.assertEqual(profit, Decimal('7.00'))

    def test_net_profit_with_discount_and_expenses(self):
        """Revenue=18, ProductCost=8, Discount=2, Expenses=3 → Profit=7"""
        self._make_paid_order(Decimal('18.00'), discount=Decimal('2.00'))
        Expense.objects.create(
            restaurant=self.restaurant,
            title='Packaging',
            category='PACKAGING',
            amount=Decimal('3.00'),
            date=timezone.now().date(),
        )
        profit = get_net_profit(self.restaurant)
        self.assertEqual(profit, Decimal('7.00'))

    def test_expense_daily_total(self):
        """Daily total sums correctly."""
        today = timezone.now().date()
        Expense.objects.create(restaurant=self.restaurant, title='Rent', category='RENT', amount=Decimal('1000.00'), date=today)
        Expense.objects.create(restaurant=self.restaurant, title='Gas', category='UTILITY', amount=Decimal('200.00'), date=today)
        from django.db.models import Sum
        daily = Expense.objects.filter(restaurant=self.restaurant, date=today).aggregate(t=Sum('amount'))['t']
        self.assertEqual(daily, Decimal('1200.00'))

    def test_expense_category_filter(self):
        """Category filter returns only matching expenses."""
        today = timezone.now().date()
        Expense.objects.create(restaurant=self.restaurant, title='Staff Pay', category='SALARY', amount=Decimal('500.00'), date=today)
        Expense.objects.create(restaurant=self.restaurant, title='Facebook Ads', category='MARKETING', amount=Decimal('150.00'), date=today)
        salary_expenses = Expense.objects.filter(restaurant=self.restaurant, category='SALARY')
        self.assertEqual(salary_expenses.count(), 1)
        self.assertEqual(salary_expenses.first().amount, Decimal('500.00'))
