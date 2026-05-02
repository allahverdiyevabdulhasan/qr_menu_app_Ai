from django.test import TestCase
from django.urls import reverse
from restaurants.models import Restaurant
from accounts.models import User
from tables.models import RestaurantTable

class TablesTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='owner1', password='password123', role=User.RoleChoices.RESTAURANT_OWNER)
        self.restaurant = Restaurant.objects.create(name="Test Rest", slug="test-rest", owner=self.owner)
        self.owner.restaurant = self.restaurant
        self.owner.save()
        
        self.table = RestaurantTable.objects.create(restaurant=self.restaurant, table_number="10")

    def test_owner_can_see_tables(self):
        self.client.login(username='owner1', password='password123')
        response = self.client.get(reverse('table_list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "10")

    def test_qr_code_generation_on_save(self):
        # The save method should have populated qr_code_url and generated an image
        self.assertTrue(self.table.qr_code_url.endswith(f"/m/test-rest/{self.table.token}/"))
        self.assertTrue(bool(self.table.qr_code_image))
