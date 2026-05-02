from django.test import TestCase
from django.urls import reverse
from restaurants.models import Restaurant
from accounts.models import User
from menu.models import Category, Product

class MenuTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='owner1', password='password123', role=User.RoleChoices.RESTAURANT_OWNER)
        self.restaurant = Restaurant.objects.create(name="Test Rest", slug="test-rest", owner=self.owner)
        self.owner.restaurant = self.restaurant
        self.owner.save()
        
        self.category = Category.objects.create(restaurant=self.restaurant, name="Mains")
        self.product = Product.objects.create(restaurant=self.restaurant, category=self.category, name="Burger", price=10.00)

    def test_owner_can_see_products(self):
        self.client.login(username='owner1', password='password123')
        response = self.client.get(reverse('product_list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Burger")

    def test_public_menu_view(self):
        response = self.client.get(reverse('public_menu', kwargs={'slug': 'test-rest'}))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Mains")
