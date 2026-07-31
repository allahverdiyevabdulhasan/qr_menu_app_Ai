class RestaurantFilterMixin:
    """
    A mixin that ensures a user only sees and modifies data
    belonging to their own restaurant.
    Superusers can see all data.
    """
    def get_queryset(self):
        # We assume the ViewSet has a generic queryset or we can just call super()
        qs = super().get_queryset()
        user = self.request.user
        
        if not user.is_authenticated:
            return qs.none()
            
        if getattr(user, 'is_superuser', False) or getattr(user, 'is_super_admin', False):
            return qs
            
        if not hasattr(user, 'restaurant') or not user.restaurant:
            # If the user isn't assigned to a restaurant, they shouldn't see tenant data
            return qs.none()
            
        field_names = [f.name for f in qs.model._meta.get_fields()]
        
        if 'restaurant' in field_names:
            return qs.filter(restaurant=user.restaurant)
            
        # Fallback if the model is related via something else, 
        # For example, OrderItem is related to Order which is related to Restaurant
        if 'order' in field_names and hasattr(qs.model, 'order'):
            return qs.filter(order__restaurant=user.restaurant)
            
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        
        field_names = [f.name for f in serializer.Meta.model._meta.get_fields()]
        if 'restaurant' not in field_names:
            serializer.save()
            return

        # If the user is a superuser, they can specify the restaurant themselves.
        # But if they don't, fallback to their attached restaurant or the first one available.
        if getattr(user, 'is_superuser', False) or getattr(user, 'is_super_admin', False):
            if 'restaurant' in serializer.validated_data:
                serializer.save()
            else:
                restaurant = getattr(user, 'restaurant', None)
                if not restaurant:
                    from restaurants.models import Restaurant
                    restaurant = Restaurant.objects.first()
                serializer.save(restaurant=restaurant)
            return
            
        if not hasattr(user, 'restaurant') or not user.restaurant:
            serializer.save()
            return

            
        field_names = [f.name for f in serializer.Meta.model._meta.get_fields()]
        
        # Inject the restaurant into the save method if it's missing
        if 'restaurant' in field_names:
            serializer.save(restaurant=user.restaurant)
        else:
            serializer.save()
