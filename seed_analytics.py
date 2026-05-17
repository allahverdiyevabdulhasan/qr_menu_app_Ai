import os
import django
import random
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neymenu_ai.settings')
django.setup()

from orders.models import Order, OrderItem
from payments.models import Payment
from restaurants.models import Restaurant
from menu.models import Product
from tables.models import RestaurantTable
from customers.models import Customer

def seed_analytics_data():
    restaurant = Restaurant.objects.get(slug='hasanusta')
    products = list(Product.objects.filter(restaurant=restaurant))
    tables = list(RestaurantTable.objects.filter(restaurant=restaurant))
    
    if not products:
        print("No products found. Please seed menu first.")
        return

    now = timezone.now()
    
    # Create some customers
    customers = []
    for i in range(5):
        c, _ = Customer.objects.get_or_create(
            restaurant=restaurant,
            phone=f"555000000{i}",
            defaults={'name': f"Müşteri {i+1}"}
        )
        customers.append(c)

    print(f"Generating data for the last 30 days...")
    
    for day in range(30):
        target_date = now - timedelta(days=day)
        # Random number of orders per day
        num_orders = random.randint(3, 8)
        
        for _ in range(num_orders):
            # Random time during the day
            order_time = target_date.replace(
                hour=random.randint(9, 22), 
                minute=random.randint(0, 59)
            )
            
            table = random.choice(tables) if tables else None
            customer = random.choice(customers)
            
            order = Order.objects.create(
                restaurant=restaurant,
                table=table,
                customer_profile=customer,
                status='COMPLETED',
                payment_status='PAID',
                order_type=random.choice(['DINE_IN', 'TAKEAWAY']),
                created_at=order_time
            )
            # Override auto_now_add for historical data
            Order.objects.filter(id=order.id).update(created_at=order_time)
            
            total_amount = Decimal('0.00')
            # 1-4 items per order
            for _ in range(random.randint(1, 4)):
                product = random.choice(products)
                qty = random.randint(1, 2)
                price = product.price
                line_total = price * qty
                
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name_snapshot=product.name,
                    quantity=qty,
                    unit_price=price,
                    total_price=line_total
                )
                total_amount += line_total
            
            order.subtotal = total_amount
            order.total_amount = total_amount
            order.save()
            
            # Create a paid payment
            Payment.objects.create(
                order=order,
                restaurant=restaurant,
                amount=total_amount,
                method=random.choice(['CASH', 'CARD', 'ONLINE']),
                status='PAID',
                created_at=order_time
            )
            # Override auto_now_add
            Payment.objects.filter(order=order).update(created_at=order_time)

    print("Analytics data seeded successfully!")

if __name__ == '__main__':
    seed_analytics_data()
