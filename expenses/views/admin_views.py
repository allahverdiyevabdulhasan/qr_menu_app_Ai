from django.views.generic import ListView, CreateView, UpdateView, DeleteView, TemplateView
from django.urls import reverse_lazy
from django.db.models import Sum
from django.utils import timezone
from restaurants.views import RestaurantAccessMixin
from accounts.decorators import role_required
from django.utils.decorators import method_decorator
from expenses.models import Expense
from decimal import Decimal
import datetime


class ExpenseListView(RestaurantAccessMixin, ListView):
    model = Expense
    template_name = 'expenses/expense_list.html'
    context_object_name = 'expenses'

    def get_queryset(self):
        qs = Expense.objects.filter(restaurant=self.request.user.restaurant)
        category = self.request.GET.get('category')
        if category:
            qs = qs.filter(category=category)
        date_from = self.request.GET.get('date_from')
        date_to = self.request.GET.get('date_to')
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        return qs

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        qs = self.get_queryset()
        context['total_amount'] = qs.aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        context['category_choices'] = Expense.CATEGORY_CHOICES
        context['selected_category'] = self.request.GET.get('category', '')
        return context


class ExpenseCreateView(RestaurantAccessMixin, CreateView):
    model = Expense
    template_name = 'expenses/expense_form.html'
    fields = ['title', 'category', 'amount', 'date', 'branch', 'note']
    success_url = reverse_lazy('expense_list')

    def form_valid(self, form):
        form.instance.restaurant = self.request.user.restaurant
        form.instance.created_by = self.request.user
        return super().form_valid(form)


class ExpenseUpdateView(RestaurantAccessMixin, UpdateView):
    model = Expense
    template_name = 'expenses/expense_form.html'
    fields = ['title', 'category', 'amount', 'date', 'branch', 'note']
    success_url = reverse_lazy('expense_list')

    def get_queryset(self):
        return Expense.objects.filter(restaurant=self.request.user.restaurant)


class ExpenseDeleteView(RestaurantAccessMixin, DeleteView):
    model = Expense
    template_name = 'expenses/expense_confirm_delete.html'
    success_url = reverse_lazy('expense_list')

    def get_queryset(self):
        return Expense.objects.filter(restaurant=self.request.user.restaurant)


class ExpenseReportView(RestaurantAccessMixin, TemplateView):
    template_name = 'expenses/expense_report.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        restaurant = self.request.user.restaurant
        today = timezone.now().date()

        # Daily
        daily_qs = Expense.objects.filter(restaurant=restaurant, date=today)
        context['daily_total'] = daily_qs.aggregate(t=Sum('amount'))['t'] or Decimal('0.00')

        # Monthly
        monthly_qs = Expense.objects.filter(
            restaurant=restaurant,
            date__year=today.year,
            date__month=today.month
        )
        context['monthly_total'] = monthly_qs.aggregate(t=Sum('amount'))['t'] or Decimal('0.00')

        # By category (monthly)
        context['by_category'] = monthly_qs.values('category').annotate(
            total=Sum('amount')
        ).order_by('-total')

        # Net profit (uses updated analytics service)
        from analytics.services import get_net_profit
        month_start = today.replace(day=1)
        context['net_profit'] = get_net_profit(
            restaurant,
            start_date=datetime.datetime.combine(month_start, datetime.time.min),
            end_date=datetime.datetime.combine(today, datetime.time.max),
        )

        context['category_labels'] = dict(Expense.CATEGORY_CHOICES)
        return context
