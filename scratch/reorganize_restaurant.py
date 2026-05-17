import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neymenu_ai.settings')
django.setup()

from menu.models import Category, Product
from restaurants.models import Restaurant
from tables.models import RestaurantTable

def reorganize():
    restaurant = Restaurant.objects.get(id=2) # HAK-ET

    # 1. Reorganize Menu
    print("Reorganizing menu...")
    Product.objects.filter(restaurant=restaurant).delete()
    Category.objects.filter(restaurant=restaurant).delete()

    # Create new categories
    durum_cat = Category.objects.create(restaurant=restaurant, name="Dürümler", sort_order=1)
    tavuk_cat = Category.objects.create(restaurant=restaurant, name="Tavuk Izgaralar", sort_order=2)
    steak_cat = Category.objects.create(restaurant=restaurant, name="Steakler", sort_order=3)
    porsiyon_cat = Category.objects.create(restaurant=restaurant, name="Porsiyonlar", sort_order=4)
    firsat_cat = Category.objects.create(restaurant=restaurant, name="Fırsat Menüleri", sort_order=5)

    # Populate categories
    # Tavuk Izgaralar
    tavuk_items = [
        ("Tavuk Kanat Kg", 400),
        ("Tavuk Baget Kg", 350),
        ("Tavuk Sarma Kg", 350),
        ("Tavuk Göğüs Kg", 350),
        ("Tavuk Çıtır Kelebek Kg", 350),
        ("Tavuk Karışık Kg", 325),
    ]
    for name, price in tavuk_items:
        Product.objects.create(restaurant=restaurant, category=tavuk_cat, name=name, price=price)

    # Steakler
    steak_items = [
        ("T-Bone Steak", 700),
        ("Dallas Steak", 650),
    ]
    for name, price in steak_items:
        Product.objects.create(restaurant=restaurant, category=steak_cat, name=name, price=price)

    # Porsiyonlar
    Product.objects.create(restaurant=restaurant, category=porsiyon_cat, name="Köfte Porsiyon", price=250)

    # Fırsat Menüleri
    firsat_items = [
        ("FIRSAT 1 MENÜ (2 Adana Dürüm + 2 Ayran)", 250),
        ("FIRSAT 2 MENÜ (2 Tavuk Dürüm + 2 Ayran)", 200),
        ("FIRSAT 3 MENÜ (2 Ciğer Dürüm + 2 Ayran)", 230),
        ("FIRSAT 4 MENÜ (Karışık Tavuk Kg + Litrelik İçecek)", 375),
        ("FIRSAT 5 MENÜ (Köfte Kg + Litrelik İçecek)", 1200),
        ("FIRSAT 6 MENÜ (Tavuk Kanat Kg + Litrelik İçecek)", 450),
    ]
    for name, price in firsat_items:
        Product.objects.create(restaurant=restaurant, category=firsat_cat, name=name, price=price)

    # Dürümler (Individual items based on Fırsat info)
    durum_items = [
        ("Adana Dürüm", 110),
        ("Tavuk Dürüm", 90),
        ("Ciğer Dürüm", 100),
    ]
    for name, price in durum_items:
        Product.objects.create(restaurant=restaurant, category=durum_cat, name=name, price=price)

    print("Menu reorganized successfully.")

    # 2. Add Tables
    print("Adding tables...")
    RestaurantTable.objects.filter(restaurant=restaurant).delete()

    # 4 İçeri Tables
    for i in range(1, 5):
        RestaurantTable.objects.create(
            restaurant=restaurant,
            table_number=str(i),
            table_name=f"İçeri {i}",
            capacity=4
        )

    # 2 Dışarı Tables
    for i in range(5, 7):
        RestaurantTable.objects.create(
            restaurant=restaurant,
            table_number=str(i),
            table_name=f"Dışarı {i-4}",
            capacity=4
        )

    print("6 tables added successfully.")

if __name__ == "__main__":
    reorganize()
