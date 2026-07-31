from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from .models import Restaurant, Branch, RestaurantSettings
from .serializers import RestaurantSerializer, BranchSerializer, RestaurantSettingsSerializer
from orders.models import Order

class RestaurantViewSet(viewsets.ModelViewSet):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer

    def perform_create(self, serializer):
        restaurant = serializer.save(owner=self.request.user)
        from .models import RestaurantSettings
        RestaurantSettings.objects.get_or_create(restaurant=restaurant)

    @action(detail=False, methods=['get'])
    def superadmin_stats(self, request):
        if not (getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_super_admin', False)):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Sadece Superadminlər bura daxil ola bilər.")

        from django.utils import timezone
        import datetime
        now = timezone.now()

        restaurants = Restaurant.objects.all()
        total_restaurants = restaurants.count()
        
        # Calculate revenue by period from subscriptions (SaaS Revenue)
        from subscriptions.models import BillingHistory, Subscription
        total_saas_revenue = BillingHistory.objects.aggregate(total=Sum('amount_paid'))['total'] or 0
        
        one_month_ago = now - datetime.timedelta(days=30)
        six_months_ago = now - datetime.timedelta(days=180)
        one_year_ago = now - datetime.timedelta(days=365)
        
        rev_1m = BillingHistory.objects.filter(payment_date__gte=one_month_ago).aggregate(total=Sum('amount_paid'))['total'] or 0
        rev_6m = BillingHistory.objects.filter(payment_date__gte=six_months_ago).aggregate(total=Sum('amount_paid'))['total'] or 0
        rev_1y = BillingHistory.objects.filter(payment_date__gte=one_year_ago).aggregate(total=Sum('amount_paid'))['total'] or 0

        # Plan distributions
        plan_distribution = {
            'PRO': Subscription.objects.filter(plan__name__icontains='Pro', status='ACTIVE').count(),
            'FREE': Subscription.objects.filter(plan__name__icontains='Free', status='ACTIVE').count(),
            'TRIAL': Subscription.objects.filter(status='TRIAL').count(),
            'INACTIVE': Subscription.objects.exclude(status__in=['ACTIVE', 'TRIAL']).count(),
        }

        total_restaurant_orders = Order.objects.count()

        restaurants_data = []
        for r in restaurants:
            try:
                sub = r.subscription
                sub_status = sub.status
                discount = sub.custom_discount_percent
                payment_amount = sub.payment_amount
                payment_status = sub.payment_status
            except Exception:
                sub_status = 'UNKNOWN'
                discount = 0
                payment_amount = 0
                payment_status = 'PENDING'

            # SaaS payments by this restaurant
            r_saas_revenue = BillingHistory.objects.filter(restaurant=r).aggregate(total=Sum('amount_paid'))['total'] or 0
            
            # Restaurant's own revenue (how much food they sold)
            r_food_revenue = Order.objects.filter(restaurant=r).aggregate(total=Sum('total_amount'))['total'] or 0
            
            r_total_orders = Order.objects.filter(restaurant=r).count()

            settings_data = {}
            try:
                from .models import RestaurantSettings
                rest_settings, created = RestaurantSettings.objects.get_or_create(restaurant=r)
                settings_data = RestaurantSettingsSerializer(rest_settings).data
            except Exception:
                pass

            restaurants_data.append({
                'id': r.id,
                'name': r.name,
                'owner_email': r.owner.email if r.owner else '',
                'custom_domain': r.custom_domain,
                'subscription_plan': r.subscription_plan,
                'subscription_end_date': r.subscription_end_date,
                'subscription_status': sub_status,
                'custom_discount': float(discount),
                'payment_amount': float(payment_amount),
                'payment_status': payment_status,
                'total_saas_revenue_from_firm': float(r_saas_revenue),
                'total_food_revenue': float(r_food_revenue),
                'total_orders': r_total_orders,
                'status': r.status,
                'settings': settings_data,
            })

        return Response({
            'total_restaurants': total_restaurants,
            'total_orders_global': total_restaurant_orders,
            'saas_revenue': {
                'total': float(total_saas_revenue),
                'last_1m': float(rev_1m),
                'last_6m': float(rev_6m),
                'last_1y': float(rev_1y)
            },
            'plan_distribution': plan_distribution,
            'restaurants': restaurants_data
        })

    @action(detail=False, methods=['post'])
    def instant_create(self, request):
        if not (getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_super_admin', False)):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Sadece Superadminlər bura daxil ola bilər.")
            
        name = request.data.get('name')
        email = request.data.get('email')
        industry = request.data.get('industry', 'restaurant')
        
        if not name or not email:
            return Response({'error': 'Name and email are required.'}, status=400)
            
        from accounts.models import User
        import datetime
        from django.utils import timezone
        
        # Create or get user
        user, created = User.objects.get_or_create(
            username=email,
            defaults={
                'email': email,
                'role': 'RESTAURANT_OWNER',
                'is_active': True
            }
        )
        if created:
            user.set_password('password123') # Default password
            user.save()
            
        # Create Restaurant
        restaurant = Restaurant.objects.create(
            name=name,
            owner=user,
            industry=industry,
            slug=name.lower().replace(' ', '-').replace('ı', 'i').replace('ş', 's').replace('ç', 'c').replace('ö', 'o').replace('ü', 'u').replace('ğ', 'g') + '-' + str(timezone.now().timestamp()).split('.')[0],
            status='active',
            subscription_plan='Free',
            subscription_end_date=timezone.now().date() + datetime.timedelta(days=7)
        )
        
        # Update user's restaurant link
        user.restaurant = restaurant
        user.save()
        
        # Create Subscription (Trial)
        from subscriptions.models import Subscription, Plan
        db_plan = Plan.objects.first() # Assign the first available plan (usually Free)
        Subscription.objects.create(
            restaurant=restaurant,
            plan=db_plan,
            status='TRIAL',
            start_date=timezone.now().date(),
            end_date=restaurant.subscription_end_date
        )
        
        return Response({
            'status': 'success',
            'message': 'Restaurant created successfully and started on a 7-day Trial.',
            'restaurant_id': restaurant.id
        })

    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        if not (getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_super_admin', False)):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Sadece Superadminlər bura daxil ola bilər.")
            
        restaurant = self.get_object()
        if restaurant.status == 'active':
            restaurant.status = 'inactive'
        else:
            restaurant.status = 'active'
        restaurant.save()
        
        return Response({
            'status': 'success',
            'new_status': restaurant.status
        })

    @action(detail=True, methods=['post'])
    def impersonate(self, request, pk=None):
        if not (getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_super_admin', False)):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Sadece Superadminlər bura daxil ola bilər.")
        
        restaurant = self.get_object()
        owner = restaurant.owner
        
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(owner)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'owner_id': owner.id,
            'owner_email': owner.email,
            'impersonated_restaurant_slug': restaurant.slug,
        })

    @action(detail=True, methods=['post'])
    def update_subscription(self, request, pk=None):
        if not (getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_super_admin', False)):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Sadece Superadminlər bura daxil ola bilər.")
            
        restaurant = self.get_object()
        plan = request.data.get('subscription_plan')
        days = request.data.get('days_to_add')
        custom_discount = request.data.get('custom_discount')
        custom_domain = request.data.get('custom_domain')
        
        import datetime
        from django.utils import timezone
        
        if plan:
            restaurant.subscription_plan = plan
            
        if custom_domain is not None:
            if custom_domain.strip() == '':
                restaurant.custom_domain = None
            else:
                restaurant.custom_domain = custom_domain.strip()
            
        exact_date = request.data.get('exact_end_date')
        if exact_date:
            try:
                restaurant.subscription_end_date = datetime.datetime.strptime(exact_date, '%Y-%m-%d').date()
            except ValueError:
                pass
        elif days:
            try:
                days = int(days)
                if restaurant.subscription_end_date and restaurant.subscription_end_date >= timezone.now().date():
                    restaurant.subscription_end_date += datetime.timedelta(days=days)
                else:
                    restaurant.subscription_end_date = timezone.now().date() + datetime.timedelta(days=days)
            except ValueError:
                pass
                
        restaurant.save()
        
        # Update Subscription model
        from subscriptions.models import Subscription, Plan
        try:
            db_plan = Plan.objects.filter(name__icontains=plan or restaurant.subscription_plan).first()
            if not db_plan:
                db_plan = Plan.objects.first()
                
            sub, created = Subscription.objects.get_or_create(
                restaurant=restaurant,
                defaults={
                    'plan': db_plan,
                    'start_date': timezone.now().date(),
                    'end_date': restaurant.subscription_end_date,
                    'status': 'ACTIVE'
                }
            )
            if not created:
                if db_plan:
                    sub.plan = db_plan
                sub.end_date = restaurant.subscription_end_date
                sub.status = 'ACTIVE'
                
            if custom_discount is not None:
                try:
                    sub.custom_discount_percent = float(custom_discount)
                except ValueError:
                    pass
            
            payment_amount = request.data.get('payment_amount')
            payment_status = request.data.get('payment_status')
            
            if payment_amount is not None:
                try:
                    sub.payment_amount = float(payment_amount)
                except ValueError:
                    pass
            if payment_status in ['PAID', 'PENDING']:
                sub.payment_status = payment_status
                    
            sub.save()
            
            # Handle BillingHistory based on payment status
            from subscriptions.models import BillingHistory
            if sub.payment_status == 'PAID' and sub.payment_amount > 0:
                # Only create if there isn't a recent billing history to avoid duplicates if they re-save
                recent_billing = BillingHistory.objects.filter(
                    restaurant=restaurant, 
                    amount_paid=sub.payment_amount,
                    payment_date__gte=timezone.now() - datetime.timedelta(days=1)
                ).exists()
                
                if not recent_billing:
                    BillingHistory.objects.create(
                        restaurant=restaurant,
                        plan=db_plan,
                        amount_paid=sub.payment_amount,
                        currency='AZN', # assuming AZN based on frontend symbol ₼
                        billing_period_start=timezone.now().date(),
                        billing_period_end=restaurant.subscription_end_date or timezone.now().date(),
                        status='COMPLETED'
                    )
            elif sub.payment_status == 'PENDING' and sub.payment_amount > 0:
                # If mistakenly marked as PAID, delete recent billing histories for this amount
                BillingHistory.objects.filter(
                    restaurant=restaurant,
                    amount_paid=sub.payment_amount,
                    payment_date__gte=timezone.now() - datetime.timedelta(days=1)
                ).delete()
                    
        except Exception as e:
            print("Error syncing Subscription model:", e)

        return Response({
            'status': 'success',
            'subscription_plan': restaurant.subscription_plan,
            'subscription_end_date': restaurant.subscription_end_date
        })

class BranchViewSet(viewsets.ModelViewSet):
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer

class RestaurantSettingsViewSet(viewsets.ModelViewSet):
    queryset = RestaurantSettings.objects.all()
    serializer_class = RestaurantSettingsSerializer
