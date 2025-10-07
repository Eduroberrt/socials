from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
import uuid
import secrets
import string

# Extend the User model with a profile
class UserProfile(models.Model):
    """Extended user profile for additional user information"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    bio = models.TextField(max_length=500, null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=100, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    verification_document = models.FileField(upload_to='verification_docs/', null=True, blank=True)
    
    # Social media links
    website = models.URLField(null=True, blank=True)
    twitter = models.CharField(max_length=100, null=True, blank=True)
    instagram = models.CharField(max_length=100, null=True, blank=True)
    
    # Privacy settings
    profile_visibility = models.CharField(
        max_length=20,
        choices=[
            ('public', 'Public'),
            ('friends', 'Friends Only'),
            ('private', 'Private')
        ],
        default='public'
    )
    
    # Notifications preferences
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


class Wallet(models.Model):
    """User wallet for handling transactions and balances"""
    
    CURRENCY_CHOICES = [
        ('USD', 'US Dollar'),
        ('NGN', 'Nigerian Naira'),
        ('BTC', 'Bitcoin'),
        ('ETH', 'Ethereum'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    
    # Balances for different currencies
    usd_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    ngn_balance = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    btc_balance = models.DecimalField(max_digits=15, decimal_places=8, default=0.00000000)
    eth_balance = models.DecimalField(max_digits=15, decimal_places=8, default=0.00000000)
    
    # Wallet security
    is_frozen = models.BooleanField(default=False)
    freeze_reason = models.TextField(null=True, blank=True)
    pin = models.CharField(max_length=256, null=True, blank=True)  # Hashed PIN
    two_factor_enabled = models.BooleanField(default=False)
    
    # Wallet limits
    daily_withdrawal_limit = models.DecimalField(max_digits=10, decimal_places=2, default=5000.00)
    monthly_withdrawal_limit = models.DecimalField(max_digits=10, decimal_places=2, default=50000.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Wallet"
    
    def get_total_balance_usd(self):
        """Calculate total balance in USD equivalent"""
        # This would use real exchange rates in production
        return float(self.usd_balance) + (float(self.ngn_balance) / 1500)  # Mock exchange rate


class Transaction(models.Model):
    """Transaction model for all wallet operations"""
    
    TRANSACTION_TYPES = [
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
        ('transfer', 'Transfer'),
        ('purchase', 'Purchase'),
        ('referral_bonus', 'Referral Bonus'),
        ('refund', 'Refund'),
        ('fee', 'Fee'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    CURRENCY_CHOICES = [
        ('USD', 'US Dollar'),
        ('NGN', 'Nigerian Naira'),
        ('BTC', 'Bitcoin'),
        ('ETH', 'Ethereum'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Amount and currency
    amount = models.DecimalField(max_digits=15, decimal_places=8)
    currency = models.CharField(max_length=5, choices=CURRENCY_CHOICES)
    
    # Transaction details
    description = models.TextField()
    reference = models.CharField(max_length=100, unique=True, null=True, blank=True)
    external_reference = models.CharField(max_length=100, null=True, blank=True)
    
    # Related transactions (for transfers)
    recipient = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='received_transactions')
    
    # Payment method information
    payment_method = models.CharField(max_length=50, null=True, blank=True)
    payment_gateway = models.CharField(max_length=50, null=True, blank=True)
    
    # Transaction fees
    fee_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    network_fee = models.DecimalField(max_digits=10, decimal_places=8, default=0.00000000)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} {self.currency} - {self.user.username}"


class ReferralProgram(models.Model):
    """Referral program configuration"""
    
    name = models.CharField(max_length=100, default="Acctthrive Referral Program")
    is_active = models.BooleanField(default=True)
    
    # Reward configuration
    referrer_bonus_usd = models.DecimalField(max_digits=10, decimal_places=2, default=10.00)
    referee_bonus_usd = models.DecimalField(max_digits=10, decimal_places=2, default=5.00)
    minimum_deposit_usd = models.DecimalField(max_digits=10, decimal_places=2, default=25.00)
    
    # Program rules
    max_referrals_per_user = models.PositiveIntegerField(default=1000)
    referral_code_length = models.PositiveIntegerField(default=8)
    expiry_days = models.PositiveIntegerField(default=30)  # Days to complete qualifying deposit
    
    # Program dates
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
    
    @classmethod
    def get_active_program(cls):
        """Get the current active referral program"""
        return cls.objects.filter(is_active=True).first()


class ReferralCode(models.Model):
    """User referral codes"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='referral_code')
    code = models.CharField(max_length=20, unique=True)
    total_uses = models.PositiveIntegerField(default=0)
    total_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.code}"
    
    @classmethod
    def generate_code(cls, user):
        """Generate a unique referral code for a user"""
        while True:
            code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
            if not cls.objects.filter(code=code).exists():
                return cls.objects.create(user=user, code=code)


class Referral(models.Model):
    """Individual referral records"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('qualified', 'Qualified'),
        ('paid', 'Paid'),
        ('expired', 'Expired'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referrer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_made')
    referee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='referrals_received')
    referral_code = models.ForeignKey(ReferralCode, on_delete=models.CASCADE)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Qualification tracking
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    qualified_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()
    
    # Reward amounts
    referrer_reward = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    referee_reward = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Related transactions
    referrer_transaction = models.ForeignKey(Transaction, on_delete=models.SET_NULL, null=True, blank=True, related_name='referrer_referrals')
    referee_transaction = models.ForeignKey(Transaction, on_delete=models.SET_NULL, null=True, blank=True, related_name='referee_referrals')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['referrer', 'referee']

    def __str__(self):
        return f"{self.referrer.username} referred {self.referee.username}"


# Keep existing models with improvements

class MerchantApplication(models.Model):
    """Model for merchant application submissions"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('credit_card', 'Credit Card'),
        ('crypto_wallet', 'Crypto Wallet'),
        ('digital_wallet', 'Digital Wallet'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    BUSINESS_TYPE_CHOICES = [
        ('electronics', 'Electronics Retailer'),
        ('clothing', 'Clothing & Accessories'),
        ('home_garden', 'Home & Garden'),
        ('books_media', 'Books & Media'),
        ('sports_outdoors', 'Sports & Outdoors'),
        ('health_beauty', 'Health & Beauty'),
        ('automotive', 'Automotive'),
        ('other', 'Other'),
    ]

    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='merchant_applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Payment Information
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, null=True, blank=True)
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, default=99.99)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=100, null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    # Business Account Information
    business_name = models.CharField(max_length=200, null=True, blank=True)
    business_type = models.CharField(max_length=20, choices=BUSINESS_TYPE_CHOICES, null=True, blank=True)
    contact_email = models.EmailField(null=True, blank=True)
    contact_phone = models.CharField(max_length=20, null=True, blank=True)
    business_address = models.TextField(null=True, blank=True)
    business_description = models.TextField(null=True, blank=True)
    
    # Credentials
    business_license = models.FileField(upload_to='merchant_documents/', null=True, blank=True)
    tax_id = models.CharField(max_length=50, null=True, blank=True)
    bank_account = models.CharField(max_length=100, null=True, blank=True)
    identity_document = models.FileField(upload_to='merchant_documents/', null=True, blank=True)
    
    # Review Information
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_applications')
    review_notes = models.TextField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Merchant Application'
        verbose_name_plural = 'Merchant Applications'

    def __str__(self):
        return f"{self.business_name or 'Unnamed Business'} - {self.get_status_display()}"
    
    def is_approved(self):
        return self.status == 'approved'
    
    def can_submit_products(self):
        return self.status == 'approved' and self.payment_status == 'completed'


class Product(models.Model):
    """Model for marketplace products"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('suspended', 'Suspended'),
    ]
    
    CONDITION_CHOICES = [
        ('new', 'New'),
        ('used', 'Used'),
        ('refurbished', 'Refurbished'),
    ]
    
    CATEGORY_CHOICES = [
        ('electronics', 'Electronics'),
        ('clothing', 'Clothing & Accessories'),
        ('home_garden', 'Home & Garden'),
        ('books_media', 'Books & Media'),
        ('sports_outdoors', 'Sports & Outdoors'),
        ('health_beauty', 'Health & Beauty'),
        ('automotive', 'Automotive'),
        ('tools_hardware', 'Tools & Hardware'),
        ('toys_games', 'Toys & Games'),
        ('other', 'Other'),
    ]

    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Product Details
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    subcategory = models.CharField(max_length=100, null=True, blank=True)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='new')
    tags = models.JSONField(default=list, blank=True)
    specifications = models.JSONField(default=dict, blank=True)
    
    # Seller Information
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    merchant_application = models.ForeignKey(MerchantApplication, on_delete=models.CASCADE, related_name='products')
    seller_verified = models.BooleanField(default=False)
    
    # Inventory
    in_stock = models.BooleanField(default=True)
    stock_count = models.PositiveIntegerField(default=1)
    location = models.CharField(max_length=100, null=True, blank=True)
    
    # Rating and Reviews
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(5.0)])
    review_count = models.PositiveIntegerField(default=0)
    
    # Status and Admin Review
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    submitted_at = models.DateTimeField(null=True, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    admin_notes = models.TextField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_products')
    
    # Engagement Metrics
    views = models.PositiveIntegerField(default=0)
    saves = models.PositiveIntegerField(default=0)
    featured = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Product'
        verbose_name_plural = 'Products'
        
    def __str__(self):
        return f"{self.title} - {self.get_status_display()}"
    
    def is_available(self):
        return self.status == 'approved' and self.in_stock and self.stock_count > 0
    
    def get_seller_name(self):
        if hasattr(self.merchant_application, 'business_name') and self.merchant_application.business_name:
            return self.merchant_application.business_name
        return self.seller.get_full_name() or self.seller.username


class ProductImage(models.Model):
    """Model for product images"""
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='product_images/')
    alt_text = models.CharField(max_length=200, null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'Product Image'
        verbose_name_plural = 'Product Images'

    def __str__(self):
        return f"Image for {self.product.title}"


class ProductSubmission(models.Model):
    """Model for tracking product submission history"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='submissions')
    seller = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Review Information
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='product_reviews')
    admin_notes = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ['-submitted_at']
        verbose_name = 'Product Submission'
        verbose_name_plural = 'Product Submissions'

    def __str__(self):
        return f"Submission for {self.product.title} - {self.get_status_display()}"


class MarketplaceSettings(models.Model):
    """Model for marketplace configuration"""
    
    # Application Fees
    merchant_application_fee = models.DecimalField(max_digits=10, decimal_places=2, default=99.99)
    
    # Auto-approval settings
    auto_approve_merchants = models.BooleanField(default=False)
    auto_approve_products = models.BooleanField(default=False)
    
    # Feature flags
    enable_merchant_applications = models.BooleanField(default=True)
    enable_product_submissions = models.BooleanField(default=True)
    enable_featured_products = models.BooleanField(default=True)
    
    # Marketplace rules
    max_products_per_seller = models.PositiveIntegerField(default=100)
    min_product_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.01)
    max_product_price = models.DecimalField(max_digits=10, decimal_places=2, default=999999.99)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Marketplace Settings'
        verbose_name_plural = 'Marketplace Settings'

    def __str__(self):
        return f"Marketplace Settings (Updated: {self.updated_at.strftime('%Y-%m-%d %H:%M')})"

    @classmethod
    def get_settings(cls):
        """Get or create marketplace settings singleton"""
        settings, created = cls.objects.get_or_create(pk=1)
        return settings


class Purchase(models.Model):
    """Model for product purchases"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='purchases')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sales')
    
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Shipping information
    shipping_address = models.TextField()
    tracking_number = models.CharField(max_length=100, null=True, blank=True)
    
    # Payment information
    payment_transaction = models.ForeignKey(Transaction, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Purchase: {self.product.title} by {self.buyer.username}"


class Review(models.Model):
    """Product reviews and ratings"""
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    purchase = models.OneToOneField(Purchase, on_delete=models.CASCADE, null=True, blank=True)
    
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    title = models.CharField(max_length=100)
    content = models.TextField()
    
    # Review moderation
    is_verified_purchase = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=True)
    
    # Helpfulness tracking
    helpful_count = models.PositiveIntegerField(default=0)
    not_helpful_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['product', 'user']

    def __str__(self):
        return f"Review: {self.product.title} by {self.user.username} ({self.rating}/5)"


class Notification(models.Model):
    """User notifications system"""
    
    TYPE_CHOICES = [
        ('system', 'System'),
        ('transaction', 'Transaction'),
        ('referral', 'Referral'),
        ('merchant', 'Merchant'),
        ('product', 'Product'),
        ('purchase', 'Purchase'),
        ('review', 'Review'),
        ('promotion', 'Promotion'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Notification state
    is_read = models.BooleanField(default=False)
    is_important = models.BooleanField(default=False)
    
    # Related objects (optional)
    related_transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, null=True, blank=True)
    related_product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, blank=True)
    related_purchase = models.ForeignKey(Purchase, on_delete=models.CASCADE, null=True, blank=True)
    
    # Action URL (for clickable notifications)
    action_url = models.CharField(max_length=200, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification: {self.title} - {self.user.username}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class Wishlist(models.Model):
    """User wishlist for saving products"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlists')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlisted_by')
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'product']

    def __str__(self):
        return f"{self.user.username} - {self.product.title}"


class UserActivity(models.Model):
    """Track user activity for analytics"""
    
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('product_view', 'Product View'),
        ('product_search', 'Product Search'),
        ('purchase', 'Purchase'),
        ('review', 'Review'),
        ('referral', 'Referral'),
        ('deposit', 'Deposit'),
        ('withdrawal', 'Withdrawal'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField(null=True, blank=True)
    
    # Optional related objects
    related_product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)
    related_transaction = models.ForeignKey(Transaction, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.activity_type} - {self.created_at}"


class SystemSettings(models.Model):
    """Global system settings"""
    
    # Site configuration
    site_name = models.CharField(max_length=100, default="Acctthrive")
    site_description = models.TextField(default="Digital Commerce Platform")
    site_logo = models.ImageField(upload_to='system/', null=True, blank=True)
    
    # Currency settings
    default_currency = models.CharField(max_length=5, default="USD")
    exchange_rate_usd_to_ngn = models.DecimalField(max_digits=10, decimal_places=2, default=1500.00)
    
    # Transaction fees
    transaction_fee_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=2.50)
    minimum_transaction_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.50)
    withdrawal_fee_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    
    # System limits
    max_transaction_amount = models.DecimalField(max_digits=15, decimal_places=2, default=100000.00)
    daily_transaction_limit = models.DecimalField(max_digits=15, decimal_places=2, default=50000.00)
    
    # Maintenance mode
    maintenance_mode = models.BooleanField(default=False)
    maintenance_message = models.TextField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'System Settings'
        verbose_name_plural = 'System Settings'

    def __str__(self):
        return f"System Settings - {self.site_name}"
    
    @classmethod
    def get_settings(cls):
        """Get or create system settings singleton"""
        settings, created = cls.objects.get_or_create(pk=1)
        return settings


# Django Signals for automatic profile and wallet creation
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Automatically create UserProfile when User is created"""
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save UserProfile when User is saved"""
    if hasattr(instance, 'profile'):
        instance.profile.save()

@receiver(post_save, sender=UserProfile)
def create_user_wallet(sender, instance, created, **kwargs):
    """Automatically create Wallet when UserProfile is created"""
    if created:
        Wallet.objects.create(user=instance.user)

@receiver(post_save, sender=User)
def create_user_referral_code(sender, instance, created, **kwargs):
    """Automatically create ReferralCode when User is created"""
    if created:
        # Generate unique referral code
        while True:
            code = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8))
            if not ReferralCode.objects.filter(code=code).exists():
                ReferralCode.objects.create(user=instance, code=code)
                break
