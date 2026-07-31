from rest_framework import serializers
from .models import Order, OrderItem, OrderStageHistory

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'
        read_only_fields = ['order', 'product_name_snapshot', 'snapshot_selling_price', 'snapshot_cost_price']

from payments.serializers import PaymentSerializer

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, required=False)
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        extra_kwargs = {
            'restaurant': {'required': False}
        }

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        
        # Handle custom customer logic for Loyalty
        request = self.context.get('request')
        if request and request.data:
            customer_phone = request.data.get('customer_phone')
            customer_name = request.data.get('customer_name')
            
            if customer_phone:
                from customers.models import Customer
                # Try to find existing customer by phone
                restaurant = validated_data.get('restaurant') or (request.user.restaurant if hasattr(request.user, 'restaurant') else None)
                if restaurant:
                    customer, created = Customer.objects.get_or_create(
                        restaurant=restaurant,
                        phone=customer_phone,
                        defaults={'name': customer_name or 'Yeni Müştəri'}
                    )
                    validated_data['customer_profile'] = customer

        order = Order.objects.create(**validated_data)
        
        for item_data in items_data:
            # We must fetch the product to get its name/price since they are read_only now
            product = item_data.get('product')
            if product:
                item_data['product_name_snapshot'] = product.name
                item_data['snapshot_selling_price'] = product.price
                
            OrderItem.objects.create(order=order, **item_data)
            
        return order

class OrderStageHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStageHistory
        fields = '__all__'

