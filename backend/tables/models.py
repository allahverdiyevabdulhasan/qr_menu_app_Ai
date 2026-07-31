import uuid
import qrcode
from io import BytesIO
from django.core.files import File
from django.db import models
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from restaurants.models import Restaurant, Branch

def qr_code_upload_path(instance, filename):
    return f"restaurants/{instance.restaurant.slug}/qr_codes/{filename}"

class RestaurantTable(models.Model):
    STATUS_CHOICES = [
        ('AVAILABLE', _('Available')),
        ('OCCUPIED', _('Occupied')),
        ('RESERVED', _('Reserved')),
        ('DISABLED', _('Disabled')),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='tables', verbose_name=_("Restaurant"))
    branch = models.ForeignKey(Branch, on_delete=models.SET_NULL, null=True, blank=True, related_name='tables', verbose_name=_("Branch"))
    table_number = models.CharField(_("Table Number"), max_length=10)
    table_name = models.CharField(_("Table Name"), max_length=50, blank=True)
    qr_code_image = models.ImageField(_("QR Code"), upload_to=qr_code_upload_path, blank=True, null=True)
    qr_code_url = models.URLField(_("QR Code URL"), blank=True)
    status = models.CharField(_("Status"), max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    capacity = models.PositiveIntegerField(_("Capacity"), default=2)
    is_active = models.BooleanField(_("Is Active"), default=True)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(_("Created At"), auto_now_add=True)
    updated_at = models.DateTimeField(_("Updated At"), auto_now=True)

    class Meta:
        verbose_name = _("Table")
        verbose_name_plural = _("Tables")
        unique_together = ('restaurant', 'table_number')
        ordering = ['table_number']

    def __str__(self):
        return f"{self.restaurant.name} - Table {self.table_number}"

    def save(self, *args, **kwargs):
        # Generate the QR Code URL (This requires the site domain, normally handled by sites framework or settings)
        from django.conf import settings
        domain = getattr(settings, 'PUBLIC_DOMAIN', 'http://127.0.0.1:8000')
        
        # Check if the restaurant has a custom domain
        inverse_mapping = {
            'hak-et': 'haketsteakhouse.com',
            'kanatci-mustafa': 'kanatcimustafa.com',
            'moorcafe': 'moorcafe.digital',
        }
        
        custom_domain = inverse_mapping.get(self.restaurant.slug)
        if custom_domain:
            # Preserve the port if PUBLIC_DOMAIN has one (e.g. :8000 for local testing)
            port_suffix = ''
            public_domain = getattr(settings, 'PUBLIC_DOMAIN', '')
            if ':' in public_domain.replace('http://', '').replace('https://', ''):
                port_suffix = ':' + public_domain.split(':')[-1].replace('/', '')
            # Use HTTPS if the public domain is configured with HTTPS, otherwise fallback to HTTP
            protocol = 'https' if public_domain.startswith('https://') else 'http'
            domain = f"{protocol}://{custom_domain}{port_suffix}"
            
            if not self.qr_code_url:
                self.qr_code_url = f"{domain}/{self.token}/"
        else:
            if not self.qr_code_url:
                self.qr_code_url = f"{domain}/m/{self.restaurant.slug}/{self.token}/"

        # Generate QR code image if not exists
        if not self.qr_code_image:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(self.qr_code_url)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            file_name = f'qr_{self.restaurant.slug}_{self.table_number}_{self.token.hex[:8]}.png'
            self.qr_code_image.save(file_name, File(buffer), save=False)

        super().save(*args, **kwargs)

class TableReservation(models.Model):
    STATUS_CHOICES = [
        ('PENDING', _('Pending')),
        ('CONFIRMED', _('Confirmed')),
        ('ARRIVED', _('Arrived')),
        ('SEATED', _('Seated')),
        ('CANCELLED', _('Cancelled')),
        ('NOSHOW', _('No Show')),
        ('COMPLETED', _('Completed')),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='reservations')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, null=True, blank=True, related_name='reservations')
    table = models.ForeignKey(RestaurantTable, on_delete=models.SET_NULL, null=True, blank=True, related_name='reservations')
    customer_name = models.CharField(_("Customer Name"), max_length=100)
    customer_phone = models.CharField(_("Customer Phone"), max_length=20)
    customer_email = models.EmailField(_("Customer Email"), blank=True, null=True)
    
    reservation_date = models.DateField(_("Reservation Date"), null=True, blank=True)
    reservation_time_only = models.TimeField(_("Reservation Time"), null=True, blank=True)
    reservation_time = models.DateTimeField(_("Reservation Full Date/Time")) # Legacy/Full field
    
    number_of_people = models.PositiveIntegerField(_("Number of People"), default=1)
    note = models.TextField(_("Note"), blank=True)
    status = models.CharField(_("Status"), max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    linked_preorder = models.OneToOneField('orders.Order', on_delete=models.SET_NULL, null=True, blank=True, related_name='reservation')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_reservations')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-reservation_time']

class WaiterCall(models.Model):
    CALL_TYPES = [
        ('waiter', _('Waiter')),
        ('bill', _('Bill')),
    ]
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='waiter_calls')
    table = models.ForeignKey(RestaurantTable, on_delete=models.CASCADE, related_name='waiter_calls')
    call_type = models.CharField(max_length=20, choices=CALL_TYPES, default='waiter')
    is_active = models.BooleanField(default=True)
    call_count = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
