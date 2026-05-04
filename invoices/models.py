from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from restaurants.models import Restaurant, Branch
from orders.models import Order
from staff.models import Payroll

class Invoice(models.Model):
    INVOICE_TYPE_CHOICES = [
        ('SALES', _('Sales Invoice')),
        ('PAYROLL', _('Payroll Record')),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='invoices')
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE, null=True, blank=True, related_name='invoices')
    invoice_type = models.CharField(_("Invoice Type"), max_length=20, choices=INVOICE_TYPE_CHOICES)
    
    # Linked objects
    order = models.OneToOneField(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoice')
    payroll = models.OneToOneField(Payroll, on_delete=models.SET_NULL, null=True, blank=True, related_name='invoice')
    
    invoice_number = models.CharField(_("Invoice Number"), max_length=50, unique=True)
    amount = models.DecimalField(_("Amount"), max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(_("Tax Amount"), max_digits=10, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(_("Discount Amount"), max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(_("Total Amount"), max_digits=10, decimal_places=2)
    
    is_paid = models.BooleanField(_("Is Paid"), default=False)
    pdf_file = models.FileField(_("PDF File"), upload_to='invoices/', blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Invoice")
        verbose_name_plural = _("Invoices")
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.invoice_number} ({self.get_invoice_type_display()})"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            import datetime
            prefix = 'INV' if self.invoice_type == 'SALES' else 'PAY'
            date_str = datetime.datetime.now().strftime('%Y%m%d')
            # Very simple unique number generation for demo
            import random
            rand_suffix = random.randint(1000, 9999)
            self.invoice_number = f"{prefix}-{date_str}-{rand_suffix}"
        super().save(*args, **kwargs)
