from django.test import TestCase
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from .models import Restaurant, Branch

class RestaurantTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='owner', password='password', role=User.RoleChoices.RESTAURANT_OWNER)
        self.restaurant = Restaurant.objects.create(name="Owners Place", slug="owners-place", owner=self.owner)
        self.owner.restaurant = self.restaurant
        self.owner.save()

        self.other_owner = User.objects.create_user(username='other_owner', password='password', role=User.RoleChoices.RESTAURANT_OWNER)
        self.other_restaurant = Restaurant.objects.create(name="Other Place", slug="other-place", owner=self.other_owner)

    def test_owner_can_see_own_restaurant(self):
        self.owner.refresh_from_db()
        self.client.login(username='owner', password='password')
        response = self.client.get(reverse('restaurant_profile'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, _("Profile Settings"))
        self.assertContains(response, self.restaurant.name)

    def test_owner_cannot_see_other_restaurant(self):
        self.client.login(username='owner', password='password')
        # They only fetch their own based on `self.request.user.restaurant`
        response = self.client.get(reverse('restaurant_profile'))
        self.assertNotContains(response, "Other Place")
