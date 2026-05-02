from django.test import TestCase, Client
from django.urls import reverse
from accounts.models import User
from restaurants.models import Restaurant
from menu.models import Product, Category
from orders.models import Order, OrderItem
from orders.cart import Cart

class OrderCartTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='owner1', password='pw', role=User.RoleChoices.RESTAURANT_OWNER)
        self.restaurant = Restaurant.objects.create(name="Test Rest", slug="test-rest", owner=self.owner)
        self.category = Category.objects.create(restaurant=self.restaurant, name="Mains")
        self.product = Product.objects.create(restaurant=self.restaurant, category=self.category, name="Burger", price=10.00)
        self.client = Client()

    def test_cart_add_and_checkout(self):
        # Create session
        session = self.client.session
        session['cart'] = {}
        session.save()

        # Add to cart via view
        response = self.client.post(reverse('cart_add', kwargs={'slug': 'test-rest'}), {'product_id': self.product.id, 'quantity': 2})
        self.assertEqual(response.status_code, 302) # Redirects

        # Verify session
        cart = self.client.session.get('cart')
        self.assertIn(f"{self.product.id}_", cart)
        self.assertEqual(cart[f"{self.product.id}_"]['quantity'], 2)

        # Checkout
        response = self.client.post(reverse('checkout', kwargs={'slug': 'test-rest'}), {'order_type': 'TAKEAWAY'})
        self.assertEqual(response.status_code, 302) # Redirects to success

        # Verify order created
        self.assertEqual(Order.objects.count(), 1)
        order = Order.objects.first()
        self.assertEqual(order.subtotal, 20.00)
        self.assertEqual(order.items.count(), 1)
