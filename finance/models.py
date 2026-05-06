from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from restaurants.models import Restaurant, Branch
from orders.models import Order
from staff.models import StaffProfile

class Expense(models.Model):
    CATEGORY_CHOICES = [
        ('RENT', _('Rent')),
        ('MARKETING', _('Marketing')),
        ('UTILITY', _('Utility')),
        ('INGREDIENTS', _('Ingredients')),
        ('OTHER', _('Other')),
    ]
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='finance_expenses')
    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    date = models.DateField(auto_now_add=True)
    note = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} - {self.amount}"

class PayrollRecord(models.Model):
    staff = models.ForeignKey(StaffProfile, on_delete=models.CASCADE, related_name='finance_payrolls')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    period_start = models.DateField()
    period_end = models.DateField()
    is_paid = models.BooleanField(default=False)
    payment_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.staff.user.username} - {self.amount}"

class Invoice(models.Model):
    TYPE_CHOICES = [
        ('ORDER', _('Customer Order')),
        ('PAYROLL', _('Salary Payment')),
    ]
    invoice_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    order = models.OneToOneField(Order, on_delete=models.SET_NULL, null=True, blank=True, related_name='finance_invoice')
    payroll = models.OneToOneField(PayrollRecord, on_delete=models.SET_NULL, null=True, blank=True, related_name='finance_invoice')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    pdf_file = models.FileField(upload_to='finance/invoices/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invoice {self.id} - {self.total_amount}"
