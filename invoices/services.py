from .models import Invoice

def create_invoice_from_order(order):
    """
    Creates a SALES invoice from a completed order.
    """
    if hasattr(order, 'invoice'):
        return order.invoice
        
    invoice = Invoice.objects.create(
        restaurant=order.restaurant,
        branch=order.branch,
        invoice_type='SALES',
        order=order,
        amount=order.subtotal,
        tax_amount=order.tax_amount,
        discount_amount=order.discount_amount,
        total_amount=order.total_amount,
        is_paid=(order.payment_status == 'PAID')
    )
    return invoice

def create_invoice_from_payroll(payroll):
    """
    Creates a PAYROLL record invoice from a payroll payment.
    """
    if hasattr(payroll, 'invoice'):
        return payroll.invoice
        
    invoice = Invoice.objects.create(
        restaurant=payroll.staff.user.restaurant,
        invoice_type='PAYROLL',
        payroll=payroll,
        amount=payroll.amount,
        tax_amount=0,
        discount_amount=0,
        total_amount=payroll.amount,
        is_paid=(payroll.payment_status == 'PAID')
    )
    return invoice
