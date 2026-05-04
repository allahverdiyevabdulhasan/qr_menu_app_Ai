from decimal import Decimal
from django.conf import settings
from menu.models import Product

class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get('cart')
        if not cart:
            cart = self.session['cart'] = {}
        self.cart = cart
        # cart structure:
        # {
        #   "item_id_1": {"product_id": 1, "quantity": 2, "options": [1, 2], "price": "10.00"},
        # }

    def add(self, product, quantity=1, options=None, removed_ingredients=None, note=""):
        if options is None:
            options = []
        if removed_ingredients is None:
            removed_ingredients = []
            
        # Create a unique key for product + options + removed ingredients + note combination
        option_key = '_'.join(str(opt) for opt in sorted(options))
        removed_key = '_'.join(sorted(removed_ingredients))
        # Note also makes it a unique item in cart
        item_id = f"{product.id}_{option_key}_{removed_key}_{hash(note)}"
        
        if item_id not in self.cart:
            self.cart[item_id] = {
                'product_id': product.id,
                'quantity': 0,
                'options': options,
                'removed_ingredients': removed_ingredients,
                'note': note,
                'price': str(product.price)
            }
        
        self.cart[item_id]['quantity'] += int(quantity)
        self.save()

    def update(self, item_id, quantity):
        if item_id in self.cart:
            if int(quantity) > 0:
                self.cart[item_id]['quantity'] = int(quantity)
            else:
                self.remove(item_id)
            self.save()

    def remove(self, item_id):
        if item_id in self.cart:
            del self.cart[item_id]
            self.save()

    def save(self):
        self.session.modified = True

    def clear(self):
        del self.session['cart']
        self.save()

    def __iter__(self):
        product_ids = [item['product_id'] for item in self.cart.values()]
        products = Product.objects.filter(id__in=product_ids)
        
        cart_data = self.cart.copy()
        
        for product in products:
            for item_id, item in cart_data.items():
                if item['product_id'] == product.id:
                    item['product'] = product
                    # Calculate option prices dynamically
                    option_price = sum(opt.price for opt in product.options.filter(id__in=item['options']))
                    item['unit_price'] = product.price + option_price
                    item['total_price'] = item['unit_price'] * item['quantity']
                    yield item

    def get_total_price(self):
        return sum(item['total_price'] for item in self)

    def get_total_quantity(self):
        return sum(item['quantity'] for item in self.cart.values())
