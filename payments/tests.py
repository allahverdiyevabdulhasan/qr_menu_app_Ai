from django.test import TestCase
from accounts.models import User
from restaurants.models import Restaurant
from orders.models import Order
from payments.models import Payment

class PaymentTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='owner1', password='pw', role=User.RoleChoices.RESTAURANT_OWNER)
        self.restaurant = Restaurant.objects.create(name="Test Rest", slug="test-rest", owner=self.owner)
        self.order = Order.objects.create(restaurant=self.restaurant, total_amount=50.00, payment_status='UNPAID')

    def test_payment_signal_updates_order(self):
        self.assertEqual(self.order.payment_status, 'UNPAID')

        # Make a partial payment
        Payment.objects.create(order=self.order, restaurant=self.restaurant, amount=20.00, method='CASH', status='PAID')
        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, 'PARTIAL')

        # Make the rest of the payment
        Payment.objects.create(order=self.order, restaurant=self.restaurant, amount=30.00, method='CARD', status='PAID')
        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_status, 'PAID')
