from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from restaurants.models import Restaurant, Branch
from tables.models import RestaurantTable

class Reservation(models.Model):
    STATUS_CHOICES = [
        ('PENDING', _('Pending')),
        ('CONFIRMED', _('Confirmed')),
        ('SEATED', _('Seated')),
        ('CANCELLED', _('Cancelled')),
        ('NOSHOW', _('No Show')),
        ('COMPLETED', _('Completed')),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='new_reservations')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, null=True, blank=True, related_name='new_reservations')
    table = models.ForeignKey(RestaurantTable, on_delete=models.SET_NULL, null=True, blank=True, related_name='new_reservations')
    
    customer_name = models.CharField(_("Customer Name"), max_length=100)
    customer_phone = models.CharField(_("Customer Phone"), max_length=20)
    
    date = models.DateField(_("Reservation Date"))
    time = models.TimeField(_("Reservation Time"))
    guest_count = models.PositiveIntegerField(_("Guest Count"), default=1)
    
    status = models.CharField(_("Status"), max_length=20, choices=STATUS_CHOICES, default='PENDING')
    note = models.TextField(_("Note"), blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Reservation")
        verbose_name_plural = _("Reservations")
        ordering = ['-date', '-time']

    def __str__(self):
        return f"{self.customer_name} - {self.date} {self.time}"
