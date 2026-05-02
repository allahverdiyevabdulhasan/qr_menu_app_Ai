from django.test import TestCase
from django.urls import reverse
from .models import User
from restaurants.models import Restaurant

class AuthFlowTests(TestCase):
    def setUp(self):
        # Create a test owner
        self.owner = User.objects.create_user(username='owner1', password='password123', role=User.RoleChoices.RESTAURANT_OWNER)
        self.restaurant = Restaurant.objects.create(name="Test Rest", slug="test-rest", owner=self.owner)
        self.owner.restaurant = self.restaurant
        self.owner.save()

        # Create a test customer
        self.customer = User.objects.create_user(username='customer1', password='password123', role=User.RoleChoices.CUSTOMER)

    def test_login_redirect_owner(self):
        self.client.login(username='owner1', password='password123')
        response = self.client.get(reverse('login'))
        # Should redirect to restaurant dashboard since they are already logged in
        self.assertRedirects(response, reverse('restaurant_dashboard'))

    def test_login_redirect_customer(self):
        self.client.login(username='customer1', password='password123')
        response = self.client.get(reverse('login'))
        # Customer redirects to home (or similar), we used 'restaurant_dashboard' as fallback for now
        # Actually our login view redirects differently upon POST to login, not GET.
        pass # To be fully tested when customer dashboard exists

    def test_owner_access_dashboard(self):
        self.client.login(username='owner1', password='password123')
        response = self.client.get(reverse('restaurant_dashboard'))
        self.assertEqual(response.status_code, 200)

    def test_customer_access_dashboard_denied(self):
        self.client.login(username='customer1', password='password123')
        response = self.client.get(reverse('restaurant_dashboard'))
        # Not owner or manager, should be 403 Forbidden
        self.assertEqual(response.status_code, 403)
