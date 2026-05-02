from decimal import Decimal

def calculate_product_cost(product):
    """
    Calculates the total cost of a product based on its mapped ingredients.
    Returns the sum of (quantity_used * cost_per_unit) for all ingredients.
    """
    total_cost = Decimal('0.00')
    ingredients = product.ingredients.all()
    
    for ing in ingredients:
        cost = ing.quantity_used * ing.inventory_item.cost_per_unit
        total_cost += cost
        
    return total_cost

def ai_stock_forecast(restaurant):
    """
    Placeholder AI Stock Forecast function.
    In reality, this would analyze historical StockMovement (ORDER_USAGE) trends
    over the past 30 days and predict the required stock for the next 7 days.
    """
    return {
        'forecast_days': 7,
        'message': "Based on AI analysis, you will need 50 KG of flour and 20 L of milk by next week."
    }
