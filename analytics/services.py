from django.db.models import Sum, Count, F, Avg
from django.db.models.functions import TruncHour, TruncDate
from django.utils import timezone
from decimal import Decimal
from orders.models import Order, OrderItem
from payments.models import Payment
from customers.models import Customer
from datetime import timedelta

def get_revenue_metrics(restaurant, start_date=None, end_date=None):
    qs = Payment.objects.filter(restaurant=restaurant, status='PAID')
    if start_date:
        qs = qs.filter(created_at__gte=start_date)
    if end_date:
        qs = qs.filter(created_at__lte=end_date)
        
    revenue = qs.aggregate(total=Sum('amount'))['total'] or 0
    return revenue

def get_order_metrics(restaurant, start_date=None, end_date=None):
    qs = Order.objects.filter(restaurant=restaurant).exclude(status__in=['CANCELLED', 'REFUNDED'])
    if start_date:
        qs = qs.filter(created_at__gte=start_date)
    if end_date:
        qs = qs.filter(created_at__lte=end_date)
        
    total_orders = qs.count()
    completed_orders = qs.filter(status='COMPLETED').count()
    cancelled_orders = Order.objects.filter(restaurant=restaurant, status='CANCELLED').count() # Over all time or period? Let's use period
    if start_date: cancelled_orders = Order.objects.filter(restaurant=restaurant, status='CANCELLED', created_at__gte=start_date).count()
    
    avg_basket = qs.aggregate(avg=Avg('total_amount'))['avg'] or 0
    
    dine_in_rev = qs.filter(order_type='DINE_IN', payment_status='PAID').aggregate(t=Sum('total_amount'))['t'] or 0
    takeaway_rev = qs.filter(order_type='TAKEAWAY', payment_status='PAID').aggregate(t=Sum('total_amount'))['t'] or 0
    pre_order_rev = qs.filter(order_type='PRE_ORDER', payment_status='PAID').aggregate(t=Sum('total_amount'))['t'] or 0
    
    return {
        'total_orders': total_orders,
        'completed_orders': completed_orders,
        'cancelled_orders': cancelled_orders,
        'average_basket_value': avg_basket,
        'dine_in_revenue': dine_in_rev,
        'takeaway_revenue': takeaway_rev,
        'pre_order_revenue': pre_order_rev,
    }

def get_payment_metrics(restaurant, start_date=None, end_date=None):
    qs = Payment.objects.filter(restaurant=restaurant, status='PAID')
    if start_date:
        qs = qs.filter(created_at__gte=start_date)
    if end_date:
        qs = qs.filter(created_at__lte=end_date)
        
    metrics = qs.values('method').annotate(total=Sum('amount'))
    
    res = {'CASH': 0, 'CARD': 0, 'ONLINE': 0}
    for m in metrics:
        if m['method'] in res:
            res[m['method']] = m['total']
            
    return res

def get_net_profit(restaurant, start_date=None, end_date=None):
    """
    Net Profit = Revenue - Product Costs - Discounts - Expenses
    """
    from expenses.models import Expense

    revenue = get_revenue_metrics(restaurant, start_date, end_date)
    revenue = Decimal(str(revenue))

    qs = Order.objects.filter(restaurant=restaurant, payment_status='PAID')
    if start_date:
        qs = qs.filter(created_at__gte=start_date)
    if end_date:
        qs = qs.filter(created_at__lte=end_date)

    discounts = Decimal(str(qs.aggregate(t=Sum('discount_amount'))['t'] or 0))

    # Calculate product costs from OrderItem -> Product.cost_price
    items = OrderItem.objects.filter(order__in=qs)
    product_costs = Decimal(str(
        items.aggregate(total_cost=Sum(F('quantity') * F('product__cost_price')))['total_cost'] or 0
    ))

    # Deduct expenses logged in the Expense model
    expenses_qs = Expense.objects.filter(restaurant=restaurant)
    if start_date:
        expenses_qs = expenses_qs.filter(date__gte=start_date.date() if hasattr(start_date, 'date') else start_date)
    if end_date:
        expenses_qs = expenses_qs.filter(date__lte=end_date.date() if hasattr(end_date, 'date') else end_date)
    total_expenses = Decimal(str(expenses_qs.aggregate(t=Sum('amount'))['t'] or 0))

    # Deduct payroll payments
    from staff.models import Payroll
    payroll_qs = Payroll.objects.filter(staff__user__restaurant=restaurant, payment_status='PAID')
    if start_date:
        payroll_qs = payroll_qs.filter(payment_date__gte=start_date.date() if hasattr(start_date, 'date') else start_date)
    if end_date:
        payroll_qs = payroll_qs.filter(payment_date__lte=end_date.date() if hasattr(end_date, 'date') else end_date)
    total_payroll = Decimal(str(payroll_qs.aggregate(t=Sum('amount'))['t'] or 0))

    net_profit = revenue - product_costs - total_expenses - total_payroll
    return net_profit

def get_top_products(restaurant, start_date=None, end_date=None, limit=10, ascending=False):
    qs = OrderItem.objects.filter(order__restaurant=restaurant, order__payment_status='PAID')
    if start_date:
        qs = qs.filter(order__created_at__gte=start_date)
    if end_date:
        qs = qs.filter(order__created_at__lte=end_date)
        
    order_by = 'total_sold' if ascending else '-total_sold'
    
    return qs.values('product__name').annotate(
        total_sold=Sum('quantity'),
        revenue=Sum('total_price')
    ).order_by(order_by)[:limit]

def get_sales_by_hour(restaurant, date):
    qs = Order.objects.filter(
        restaurant=restaurant,
        created_at__date=date,
        payment_status='PAID'
    )
    
    return qs.annotate(hour=TruncHour('created_at')).values('hour').annotate(
        revenue=Sum('total_amount'),
        orders=Count('id')
    ).order_by('hour')

def get_customer_metrics(restaurant):
    total_customers = Customer.objects.filter(restaurant=restaurant).count()
    repeat_customers = Customer.objects.filter(restaurant=restaurant, order_count__gt=1).count()
    return {
        'total_customers': total_customers,
        'repeat_customers': repeat_customers
    }
