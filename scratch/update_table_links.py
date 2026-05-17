import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'neymenu_ai.settings')
django.setup()

from tables.models import RestaurantTable
from django.conf import settings

def update_table_links():
    domain = getattr(settings, 'PUBLIC_DOMAIN', 'http://173.212.232.21')
    tables = RestaurantTable.objects.all()
    print(f"Updating {tables.count()} tables with domain: {domain}")
    
    for table in tables:
        # Force update the URL
        table.qr_code_url = f"{domain}/m/{table.restaurant.slug}/{table.token}/"
        # Force regenerate the QR code image too
        table.qr_code_image = None
        table.save()
        print(f"Updated Table {table.table_number} for {table.restaurant.name}")

if __name__ == "__main__":
    update_table_links()
