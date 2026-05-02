import uuid
import qrcode
from io import BytesIO
from django.core.files import File
from django.db import models
from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from restaurants.models import Restaurant, Branch

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
    qr_code_image = models.ImageField(_("QR Code"), upload_to='qr_codes/', blank=True, null=True)
    qr_code_url = models.URLField(_("QR Code URL"), blank=True)
    status = models.CharField(_("Status"), max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
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
        # For now, we will generate a relative or placeholder absolute URL
        # e.g., /menu/restaurant-slug/table-token/
        
        # Determine base URL from settings if possible, otherwise placeholder
        from django.conf import settings
        domain = getattr(settings, 'PUBLIC_DOMAIN', 'http://127.0.0.1:8000')
        
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
