import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neymenu_ai.settings')
django.setup()

from menu.models import Category, Product
from restaurants.models import Restaurant

def update_menu():
    # Find the first restaurant to update
    restaurant = Restaurant.objects.first()
    if not restaurant:
        print("No restaurant found in database.")
        return

    print(f"Updating menu for restaurant: {restaurant.name} (ID: {restaurant.id})")

    # Delete old menu data
    Product.objects.filter(restaurant=restaurant).delete()
    Category.objects.filter(restaurant=restaurant).delete()

    # Update Restaurant Info
    restaurant.name = "HAK-ET"
    restaurant.phone = "0552 307 77 41"
    restaurant.address = "Rüstem Paşa Mh. Dere Sk. No.9 / A"
    restaurant.description = "Paket Serviste +150 TL Fiyat Farkı Vardır. Instagram: haketrestoran77"
    restaurant.slug = "hak-et"
    restaurant.logo = "restaurant_logos/hak_et_logo.png"
    restaurant.save()

    # Create Categories
    izgara_category = Category.objects.create(restaurant=restaurant, name="Izgara Tavuk & Köfte", sort_order=1)
    firsat_category = Category.objects.create(restaurant=restaurant, name="Fırsat Menüleri", sort_order=2)

    # Create Products for Izgara Tavuk & Köfte
    izgara_items = [
        ("Tavuk Kanat Kg", 400),
        ("Tavuk Baget Kg", 350),
        ("Tavuk Sarma Kg", 350),
        ("Tavuk Göğüs Kg", 350),
        ("Tavuk Çıtır Kelebek Kg", 350),
        ("Tavuk Karışık Kg", 325),
        ("Köfte Porsiyon", 250),
        ("T-Bone Steak", 700),
        ("Dallas Steak", 650),
    ]

    for name, price in izgara_items:
        Product.objects.create(
            restaurant=restaurant,
            category=izgara_category,
            name=name,
            price=price
        )

    # Create Products for Fırsat Menüleri
    firsat_items = [
        ("FIRSAT 1 MENÜ (2 Adana Dürüm + 2 Ayran)", 250),
        ("FIRSAT 2 MENÜ (2 Tavuk Dürüm + 2 Ayran)", 200),
        ("FIRSAT 3 MENÜ (2 Ciğer Dürüm + 2 Ayran)", 230),
        ("FIRSAT 4 MENÜ (Karışık Tavuk Kg + Litrelik İçecek)", 375),
        ("FIRSAT 5 MENÜ (Köfte Kg + Litrelik İçecek)", 1200),
        ("FIRSAT 6 MENÜ (Tavuk Kanat Kg + Litrelik İçecek)", 450),
    ]

    for name, price in firsat_items:
        Product.objects.create(
            restaurant=restaurant,
            category=firsat_category,
            name=name,
            price=price
        )

    print("Menu updated successfully for HAK-ET!")

if __name__ == "__main__":
    update_menu()
