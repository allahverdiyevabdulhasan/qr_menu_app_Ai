import os
import sys
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from restaurants.models import Restaurant, Branch, RestaurantSettings
from menu.models import Category, Product
from tables.models import RestaurantTable
from subscriptions.models import Plan, Subscription

User = get_user_model()

print("Resetting database...")
User.objects.all().delete()
Restaurant.objects.all().delete()
Plan.objects.all().delete()

print("Creating subscription plans...")
plan_free = Plan.objects.create(name='Free', price=0, max_branches=1, max_tables=5, has_ai_features=False)
plan_pro = Plan.objects.create(name='Pro', price=49, max_branches=5, max_tables=50, has_ai_features=True)

print("Creating users...")
# 1. Super Admin
super_admin = User.objects.create_superuser(
    username='superadmin@demo.com',
    email='superadmin@demo.com',
    password='password123',
    role='SUPER_ADMIN'
)

# 2. Restaurant Owner
owner = User.objects.create_user(
    username='owner@demo.com',
    email='owner@demo.com',
    password='password123',
    role='RESTAURANT_OWNER'
)

# 3. Manager
manager = User.objects.create_user(
    username='manager@demo.com',
    email='manager@demo.com',
    password='password123',
    role='MANAGER'
)

# 4. Waiter
waiter = User.objects.create_user(
    username='waiter@demo.com',
    email='waiter@demo.com',
    password='password123',
    role='WAITER',
    can_view_waiter_panel=True
)

# 5. Cashier
cashier = User.objects.create_user(
    username='cashier@demo.com',
    email='cashier@demo.com',
    password='password123',
    role='CASHIER',
    can_view_cashier_panel=True
)

print("Creating restaurant and branch...")
restaurant = Restaurant.objects.create(
    owner=owner,
    name='Demo Restoran',
    slug='demo-restoran',
    address='Demo Sokak No:123, Demo Şehir',
    phone='+905554443322',
    email='info@demorestoran.com',
    subscription_plan='Pro',
    subscription_end_date=timezone.now().date() + timedelta(days=365)
)

RestaurantSettings.objects.create(restaurant=restaurant)

Subscription.objects.create(
    restaurant=restaurant,
    plan=plan_pro,
    status='ACTIVE',
    start_date=timezone.now().date(),
    end_date=timezone.now().date() + timedelta(days=365)
)

branch = Branch.objects.create(
    restaurant=restaurant,
    name='Merkez Şube',
    address='Demo Sokak No:123, Demo Şehir',
    phone='+905554443322',
    manager=manager
)

# Assign users to restaurant
for u in [manager, waiter, cashier]:
    u.restaurant = restaurant
    u.branch = branch
    u.save()

owner.restaurant = restaurant
owner.save()

print("Creating menu categories and products...")
cat_ana = Category.objects.create(restaurant=restaurant, name='Ana Yemekler', description='Nefis ana yemekler', is_active=True)
cat_icecek = Category.objects.create(restaurant=restaurant, name='İçecekler', description='Serinletici içecekler', is_active=True)

Product.objects.create(
    restaurant=restaurant,
    category=cat_ana,
    name='Adana Kebap',
    description='Zırh kıymasıyla hazırlanmış özel Adana',
    price=150.00,
    is_active=True
)

Product.objects.create(
    restaurant=restaurant,
    category=cat_ana,
    name='Izgara Köfte',
    description='Özel baharatlarla hazırlanmış ızgara köfte',
    price=120.00,
    is_active=True
)

Product.objects.create(
    restaurant=restaurant,
    category=cat_icecek,
    name='Ayran',
    description='Yayık ayranı',
    price=20.00,
    is_active=True
)

Product.objects.create(
    restaurant=restaurant,
    category=cat_icecek,
    name='Kola',
    description='Kutu kola',
    price=30.00,
    is_active=True
)

print("Creating tables...")
for i in range(1, 11):
    RestaurantTable.objects.create(
        restaurant=restaurant,
        branch=branch,
        table_number=str(i),
        capacity=4,
        status='available'
    )

print("--- DEMO DATA CREATED SUCCESSFULLY ---")
print("Login info:")
print("Password for all accounts: password123")
print("- Super Admin: superadmin@demo.com")
print("- Restaurant Owner: owner@demo.com")
print("- Branch Manager: manager@demo.com")
print("- Waiter: waiter@demo.com")
print("- Cashier: cashier@demo.com")
