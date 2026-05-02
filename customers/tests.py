from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from restaurants.models import Restaurant
from orders.models import Order
from customers.models import Customer
from customers.services import link_or_create_customer

class CustomerTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='owner1', password='pw')
        self.restaurant = Restaurant.objects.create(name="Test Rest", owner=self.owner)
        self.order = Order.objects.create(restaurant=self.restaurant, total_amount=100.00)

    def test_link_or_create_customer_creates_new(self):
        customer = link_or_create_customer(self.order, phone="1234567890", name="John Doe")
        self.assertEqual(Customer.objects.count(), 1)
        self.assertEqual(customer.name, "John Doe")
        self.assertEqual(customer.order_count, 1)
        self.assertEqual(customer.total_spent, 100.00)

    def test_link_or_create_customer_updates_existing(self):
        Customer.objects.create(restaurant=self.restaurant, phone="1234567890", name="John", order_count=1, total_spent=50.00)
        
        customer = link_or_create_customer(self.order, phone="1234567890")
        self.assertEqual(Customer.objects.count(), 1)
        self.assertEqual(customer.order_count, 2)
        self.assertEqual(customer.total_spent, 150.00)

    def test_segmentation_logic(self):
        now = timezone.now()
        c = Customer.objects.create(restaurant=self.restaurant, phone="1", order_count=0)
        self.assertEqual(c.get_segment(), "No Orders")
        
        c.order_count = 1
        c.last_order_at = now - timedelta(days=10)
        self.assertEqual(c.get_segment(), "New")
        
        c.order_count = 2
        c.last_order_at = now - timedelta(days=40)
        self.assertEqual(c.get_segment(), "Repeat")
        
        c.last_order_at = now - timedelta(days=70)
        self.assertEqual(c.get_segment(), "Inactive")
        
        c.order_count = 12
        self.assertEqual(c.get_segment(), "VIP")
