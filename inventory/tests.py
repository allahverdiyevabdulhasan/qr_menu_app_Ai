from django.test import TestCase
from accounts.models import User
from restaurants.models import Restaurant
from menu.models import Product, Category
from inventory.models import InventoryItem, ProductIngredient, StockMovement
from orders.models import Order, OrderItem
from inventory.services import calculate_product_cost

class InventoryTests(TestCase):
    def setUp(self):
        self.owner = User.objects.create_user(username='owner1', password='pw')
        self.restaurant = Restaurant.objects.create(name="Test Rest", owner=self.owner)
        self.category = Category.objects.create(restaurant=self.restaurant, name="Test Cat")
        self.product = Product.objects.create(restaurant=self.restaurant, category=self.category, name="Burger", price=10.00)

        self.item_bun = InventoryItem.objects.create(restaurant=self.restaurant, name="Bun", unit="PIECE", current_quantity=100, cost_per_unit=1.00)
        self.item_meat = InventoryItem.objects.create(restaurant=self.restaurant, name="Meat", unit="GR", current_quantity=5000, cost_per_unit=0.01)

        ProductIngredient.objects.create(product=self.product, inventory_item=self.item_bun, quantity_used=1)
        ProductIngredient.objects.create(product=self.product, inventory_item=self.item_meat, quantity_used=150)

    def test_calculate_product_cost(self):
        # Bun (1 * 1.00) + Meat (150 * 0.01) = 1.00 + 1.50 = 2.50
        cost = calculate_product_cost(self.product)
        self.assertEqual(float(cost), 2.50)

    def test_stock_deduction_on_order_complete(self):
        order = Order.objects.create(restaurant=self.restaurant, total_amount=10.00, status='NEW')
        OrderItem.objects.create(order=order, product=self.product, quantity=2, unit_price=10.00, total_price=20.00)
        
        # Change status to completed, which should trigger the signal
        order.status = 'COMPLETED'
        order.save()

        self.item_bun.refresh_from_db()
        self.item_meat.refresh_from_db()

        # Deduct 2 buns and 300g meat
        self.assertEqual(self.item_bun.current_quantity, 98)
        self.assertEqual(self.item_meat.current_quantity, 4700)

        # Check stock movement logs
        movements = StockMovement.objects.filter(restaurant=self.restaurant, movement_type='ORDER_USAGE')
        self.assertEqual(movements.count(), 2)
