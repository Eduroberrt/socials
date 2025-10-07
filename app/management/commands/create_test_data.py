from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from app.models import MerchantApplication, Product, ProductImage, MarketplaceSettings
from django.utils import timezone
import random

class Command(BaseCommand):
    help = 'Create sample marketplace data for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=3,
            help='Number of test users to create',
        )

    def handle(self, *args, **options):
        num_users = options['users']
        
        self.stdout.write(self.style.SUCCESS('Creating marketplace test data...'))
        
        # Create marketplace settings
        settings, created = MarketplaceSettings.objects.get_or_create(pk=1)
        if created:
            self.stdout.write(self.style.SUCCESS('Created marketplace settings'))
        
        # Create test users
        test_users = []
        for i in range(num_users):
            username = f'merchant_{i+1}'
            email = f'merchant{i+1}@test.com'
            
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': f'Test',
                    'last_name': f'Merchant {i+1}',
                    'is_active': True,
                }
            )
            
            if created:
                user.set_password('testpass123')
                user.save()
                self.stdout.write(f'Created user: {username}')
            
            test_users.append(user)
        
        # Sample business data
        businesses = [
            {
                'name': 'TechGear Solutions',
                'type': 'electronics',
                'email': 'contact@techgear.com',
                'phone': '+1-555-0123',
                'address': '123 Tech Street, Silicon Valley, CA 94000',
                'description': 'Specialized in high-quality electronics and gadgets for consumers and businesses.'
            },
            {
                'name': 'Fashion Forward',
                'type': 'clothing',
                'email': 'hello@fashionforward.com',
                'phone': '+1-555-0456',
                'address': '456 Style Avenue, New York, NY 10001',
                'description': 'Trendy fashion and accessories for the modern lifestyle.'
            },
            {
                'name': 'Home & Garden Plus',
                'type': 'home_garden',
                'email': 'support@homegardenplus.com',
                'phone': '+1-555-0789',
                'address': '789 Garden Lane, Austin, TX 73301',
                'description': 'Quality home improvement and garden supplies for DIY enthusiasts.'
            }
        ]
        
        # Create merchant applications
        merchant_apps = []
        for i, user in enumerate(test_users):
            if i < len(businesses):
                business = businesses[i]
                
                # Check if application already exists
                existing_app = MerchantApplication.objects.filter(user=user).first()
                if existing_app:
                    merchant_apps.append(existing_app)
                    continue
                
                app = MerchantApplication.objects.create(
                    user=user,
                    status='approved' if i == 0 else random.choice(['submitted', 'approved']),
                    payment_method='credit_card',
                    payment_amount=99.99,
                    payment_status='completed',
                    transaction_id=f'txn_{random.randint(100000, 999999)}',
                    paid_at=timezone.now(),
                    business_name=business['name'],
                    business_type=business['type'],
                    contact_email=business['email'],
                    contact_phone=business['phone'],
                    business_address=business['address'],
                    business_description=business['description'],
                    tax_id=f'EIN-{random.randint(10, 99)}-{random.randint(1000000, 9999999)}',
                    bank_account=f'BANK****{random.randint(1000, 9999)}',
                    submitted_at=timezone.now(),
                    reviewed_at=timezone.now() if i != 1 else None,  # Leave one unreviewed
                )
                
                merchant_apps.append(app)
                self.stdout.write(f'Created merchant application: {business["name"]}')
        
        # Sample products data
        products_data = [
            {
                'title': 'Professional Cordless Drill Set',
                'description': 'High-performance 20V cordless drill with 2 batteries, charger, and 50-piece accessory kit. Perfect for professional contractors and DIY enthusiasts.',
                'price': 149.99,
                'original_price': 199.99,
                'category': 'tools_hardware',
                'subcategory': 'Power Tools',
                'condition': 'new',
                'tags': ['cordless', 'drill', 'professional', 'battery', 'tools'],
                'specifications': {
                    'Battery': '20V Lithium-ion',
                    'Chuck Size': '1/2 inch',
                    'Torque': '300 in-lbs',
                    'Speed': '0-400/0-1,500 RPM',
                    'Weight': '3.2 lbs'
                },
                'stock_count': 25,
                'location': 'Austin, TX',
            },
            {
                'title': 'Smart LED Garden Lights (4-Pack)',
                'description': 'Solar-powered smart LED garden lights with app control, multiple color modes, and weather-resistant design. Easy installation, no wiring required.',
                'price': 89.99,
                'category': 'home_garden',
                'subcategory': 'Outdoor Lighting',
                'condition': 'new',
                'tags': ['smart', 'led', 'solar', 'garden', 'lights', 'app-control'],
                'specifications': {
                    'Power Source': 'Solar + Battery Backup',
                    'Brightness': '200 Lumens per light',
                    'Colors': '16 million colors',
                    'Connectivity': 'WiFi + Bluetooth',
                    'Weather Rating': 'IP65 Waterproof'
                },
                'stock_count': 15,
                'location': 'Austin, TX',
                'featured': True,
            },
            {
                'title': 'Wireless Bluetooth Headphones',
                'description': 'Premium noise-cancelling wireless headphones with 30-hour battery life, premium sound quality, and comfortable over-ear design.',
                'price': 199.99,
                'original_price': 249.99,
                'category': 'electronics',
                'subcategory': 'Audio',
                'condition': 'new',
                'tags': ['wireless', 'bluetooth', 'headphones', 'noise-cancelling'],
                'specifications': {
                    'Battery Life': '30 hours',
                    'Connectivity': 'Bluetooth 5.0',
                    'Noise Cancellation': 'Active',
                    'Driver Size': '40mm',
                    'Weight': '250g'
                },
                'stock_count': 10,
                'location': 'California, CA',
            }
        ]
        
        # Create products for approved merchants
        approved_merchants = [app for app in merchant_apps if app.status == 'approved']
        
        for i, product_data in enumerate(products_data):
            if i < len(approved_merchants):
                merchant = approved_merchants[i]
                
                # Check if product already exists
                existing_product = Product.objects.filter(
                    title=product_data['title'],
                    seller=merchant.user
                ).first()
                
                if existing_product:
                    continue
                
                product = Product.objects.create(
                    title=product_data['title'],
                    description=product_data['description'],
                    price=product_data['price'],
                    original_price=product_data.get('original_price'),
                    category=product_data['category'],
                    subcategory=product_data['subcategory'],
                    condition=product_data['condition'],
                    tags=product_data['tags'],
                    specifications=product_data['specifications'],
                    seller=merchant.user,
                    merchant_application=merchant,
                    seller_verified=True,
                    in_stock=True,
                    stock_count=product_data['stock_count'],
                    location=product_data['location'],
                    rating=round(random.uniform(4.0, 5.0), 1),
                    review_count=random.randint(50, 200),
                    status='approved',
                    submitted_at=timezone.now(),
                    approved_at=timezone.now(),
                    featured=product_data.get('featured', False),
                    views=random.randint(100, 1000),
                    saves=random.randint(10, 100),
                )
                
                self.stdout.write(f'Created product: {product.title}')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created test data:\n'
                f'- {len(test_users)} users\n'
                f'- {len(merchant_apps)} merchant applications\n'
                f'- {Product.objects.count()} products\n'
                f'Access Django admin at: http://127.0.0.1:8000/admin/'
            )
        )