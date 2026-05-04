from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from restaurants.models import Restaurant, Branch

class StaffProfile(models.Model):
    SALARY_TYPE_CHOICES = [
        ('DAILY', _('Daily')),
        ('WEEKLY', _('Weekly')),
        ('MONTHLY', _('Monthly')),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='staff_profile')
    salary_type = models.CharField(_("Salary Type"), max_length=20, choices=SALARY_TYPE_CHOICES, default='MONTHLY')
    salary_amount = models.DecimalField(_("Salary Amount"), max_digits=10, decimal_places=2, default=0.00)
    hire_date = models.DateField(_("Hire Date"), null=True, blank=True)
    is_active = models.BooleanField(_("Is Active"), default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Staff Profile")
        verbose_name_plural = _("Staff Profiles")

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.user.get_role_display()})"

class Payroll(models.Model):
    PAYMENT_STATUS_CHOICES = [
        ('PENDING', _('Pending')),
        ('PAID', _('Paid')),
        ('CANCELLED', _('Cancelled')),
    ]

    staff = models.ForeignKey(StaffProfile, on_delete=models.CASCADE, related_name='payrolls')
    amount = models.DecimalField(_("Amount"), max_digits=10, decimal_places=2)
    salary_period = models.CharField(_("Salary Period"), max_length=100) # e.g. "May 2026"
    payment_date = models.DateField(_("Payment Date"))
    payment_status = models.CharField(_("Payment Status"), max_length=20, choices=PAYMENT_STATUS_CHOICES, default='PENDING')
    note = models.TextField(_("Note"), blank=True)
    
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_payrolls')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("Payroll Record")
        verbose_name_plural = _("Payroll Records")
        ordering = ['-payment_date']

    def __str__(self):
        return f"{self.staff.user.get_full_name()} - {self.salary_period} - {self.amount}"
