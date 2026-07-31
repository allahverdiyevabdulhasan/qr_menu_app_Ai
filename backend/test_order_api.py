import sys
import json
from django.test import Client
from restaurants.models import Restaurant
from menu.models import Product

def run():
    try:
        client = Client()
        
        # Get the restaurant
        restaurant = Restaurant.objects.filter(status='active').first()
        if not restaurant:
            print("No active restaurant")
            return
            
        print(f"Restaurant: {restaurant.slug}")
        
        # Get a product
        product = Product.objects.filter(restaurant=restaurant, is_active=True).first()
        if not product:
            print("No active product")
            return
            
        print(f"Product: {product.id}")
        
        # Make the request
        payload = {
            "restaurant_slug": restaurant.slug,
            "table_number": "10",
            "items": [
                {
                    "product_id": product.id,
                    "quantity": 2
                }
            ]
        }
        
        response = client.post('/api/public/order/', data=json.dumps(payload), content_type='application/json')
        print(f"Response status: {response.status_code}")
        print(f"Response content: {response.content.decode()}")
        
    except Exception as e:
        import traceback
        traceback.print_exc()

run()
