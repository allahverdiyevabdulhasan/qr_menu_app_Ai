from django.views.generic import TemplateView
from django.utils.decorators import method_decorator
from accounts.decorators import role_required
from restaurants.models import Restaurant
from subscriptions.models import Subscription, Plan
from support.models import Ticket
from django.db.models import Sum

@method_decorator(role_required(['SUPER_ADMIN']), name='dispatch')
class SuperAdminDashboardView(TemplateView):
    template_name = 'core/super_admin_dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['total_restaurants'] = Restaurant.objects.count()
        context['active_subscriptions'] = Subscription.objects.filter(status='ACTIVE').count()
        context['total_mrr'] = Subscription.objects.filter(status='ACTIVE').aggregate(total=Sum('plan__price'))['total'] or 0
        context['open_tickets'] = Ticket.objects.filter(status='OPEN').count()
        
        context['recent_restaurants'] = Restaurant.objects.order_by('-created_at')[:5]
        context['recent_tickets'] = Ticket.objects.order_by('-created_at')[:5]
        context['plans'] = Plan.objects.all()
        
        return context
