from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from restaurants.models import Restaurant

class Ticket(models.Model):
    PRIORITY_CHOICES = [
        ('LOW', _('Low')),
        ('MEDIUM', _('Medium')),
        ('HIGH', _('High')),
        ('URGENT', _('Urgent')),
    ]
    STATUS_CHOICES = [
        ('OPEN', _('Open')),
        ('IN_PROGRESS', _('In Progress')),
        ('RESOLVED', _('Resolved')),
        ('CLOSED', _('Closed')),
    ]

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='support_tickets')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='support_tickets')
    
    subject = models.CharField(max_length=200)
    message = models.TextField()
    
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Ticket #{self.id}: {self.subject} ({self.status})"

class TicketReply(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='replies')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_staff_reply = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reply to Ticket #{self.ticket.id} by {self.user.username}"
