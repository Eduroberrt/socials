"""
Django REST Framework Serializers for Marketplace API
Handles data serialization/deserialization for all app models
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from decimal import Decimal
from .models import (
    UserProfile, Wallet, Transaction, ReferralProgram, ReferralCode, Referral,
    MerchantApplication, Product, ProductImage, ProductSubmission,
    Purchase, Review, Notification, Wishlist, UserActivity,
    MarketplaceSettings, SystemSettings
)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for Django User model"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'password', 'password_confirm']
        extra_kwargs = {
            'password': {'write_only': True},
            'date_joined': {'read_only': True}
        }
    
    def validate(self, data):
        """Validate password confirmation"""
        if 'password' in data and 'password_confirm' in data:
            if data['password'] != data['password_confirm']:
                raise serializers.ValidationError("Passwords do not match")
        return data
    
    def create(self, validated_data):
        """Create user with hashed password"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model"""
    user = UserSerializer(read_only=True)
    referral_code = serializers.SerializerMethodField()
    referral_earnings = serializers.SerializerMethodField()
    total_referrals = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'user', 'phone_number', 'birth_date', 'bio', 'location',
            'profile_photo', 'is_verified', 'verification_document',
            'website', 'twitter', 'instagram', 'profile_visibility',
            'email_notifications', 'push_notifications', 'marketing_emails',
            'referral_code', 'referral_earnings', 'total_referrals', 
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'referral_code', 'referral_earnings', 'total_referrals',
            'created_at', 'updated_at'
        ]
    
    def get_referral_code(self, obj):
        """Get user's referral code"""
        try:
            return obj.user.referral_code.code
        except:
            return None
    
    def get_referral_earnings(self, obj):
        """Calculate total referral earnings"""
        referrals = Referral.objects.filter(referrer=obj.user, status='paid')
        return float(sum(r.referrer_reward for r in referrals))
    
    def get_total_referrals(self, obj):
        """Get total number of referrals"""
        return Referral.objects.filter(referrer=obj.user, status__in=['qualified', 'paid']).count()


class WalletSerializer(serializers.ModelSerializer):
    """Serializer for Wallet model"""
    user_profile = UserProfileSerializer(read_only=True)
    total_balance_usd = serializers.SerializerMethodField()
    
    class Meta:
        model = Wallet
        fields = [
            'id', 'user_profile', 'balance_usd', 'balance_ngn', 'total_transactions',
            'total_earned', 'total_spent', 'is_frozen', 'last_transaction_at',
            'total_balance_usd', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'total_transactions', 'total_earned', 'total_spent',
            'last_transaction_at', 'total_balance_usd', 'created_at', 'updated_at'
        ]
    
    def get_total_balance_usd(self, obj):
        """Calculate total balance in USD (including NGN converted)"""
        system_settings = SystemSettings.objects.first()
        exchange_rate = system_settings.exchange_rate_usd_to_ngn if system_settings else Decimal('1500.00')
        ngn_in_usd = obj.balance_ngn / exchange_rate
        return float(obj.balance_usd + ngn_in_usd)


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for Transaction model"""
    wallet = WalletSerializer(read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'wallet', 'transaction_type', 'amount', 'currency', 'description',
            'reference_id', 'status', 'payment_method', 'external_reference',
            'fees', 'exchange_rate', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ReferralProgramSerializer(serializers.ModelSerializer):
    """Serializer for ReferralProgram model"""
    active_referrals = serializers.SerializerMethodField()
    
    class Meta:
        model = ReferralProgram
        fields = [
            'id', 'name', 'description', 'referrer_reward', 'referee_reward',
            'currency', 'minimum_purchase', 'maximum_rewards', 'is_active',
            'start_date', 'end_date', 'active_referrals', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'active_referrals', 'created_at', 'updated_at']
    
    def get_active_referrals(self, obj):
        """Get count of active referrals for this program"""
        return Referral.objects.filter(program=obj, is_active=True).count()


class ReferralCodeSerializer(serializers.ModelSerializer):
    """Serializer for ReferralCode model"""
    user = UserSerializer(read_only=True)
    program = ReferralProgramSerializer(read_only=True)
    
    class Meta:
        model = ReferralCode
        fields = [
            'id', 'user', 'program', 'code', 'usage_count', 'max_uses',
            'is_active', 'expires_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'usage_count', 'created_at', 'updated_at']


class ReferralSerializer(serializers.ModelSerializer):
    """Serializer for Referral model"""
    referrer = UserSerializer(read_only=True)
    referee = UserSerializer(read_only=True)
    program = ReferralProgramSerializer(read_only=True)
    referral_code = ReferralCodeSerializer(read_only=True)
    
    class Meta:
        model = Referral
        fields = [
            'id', 'referrer', 'referee', 'program', 'referral_code',
            'referrer_reward', 'referee_reward', 'currency', 'is_active',
            'completed_at', 'total_earned', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'total_earned', 'completed_at', 'created_at', 'updated_at'
        ]


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for ProductImage model"""
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']


class MerchantApplicationSerializer(serializers.ModelSerializer):
    """Serializer for MerchantApplication model"""
    user = UserSerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = MerchantApplication
        fields = [
            'id', 'user', 'business_name', 'business_type', 'contact_email',
            'contact_phone', 'business_address', 'business_description',
            'business_license', 'tax_id', 'bank_account', 'identity_document',
            'payment_method', 'payment_amount', 'payment_status', 'transaction_id',
            'paid_at', 'status', 'submitted_at', 'reviewed_at', 'reviewed_by',
            'review_notes', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'payment_status', 'transaction_id', 'paid_at',
            'status', 'submitted_at', 'reviewed_at', 'reviewed_by', 'review_notes',
            'created_at', 'updated_at'
        ]


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""
    seller = UserSerializer(read_only=True)
    merchant_application = MerchantApplicationSerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'seller', 'merchant_application', 'title', 'description',
            'category', 'subcategory', 'price', 'original_price', 'condition',
            'tags', 'specifications', 'in_stock', 'stock_count', 'location',
            'rating', 'review_count', 'views', 'saves', 'status', 'submitted_at',
            'approved_at', 'rejected_at', 'admin_notes', 'reviewed_by',
            'featured', 'seller_verified', 'images', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'seller', 'merchant_application', 'rating', 'review_count',
            'views', 'saves', 'status', 'submitted_at', 'approved_at', 'rejected_at',
            'admin_notes', 'reviewed_by', 'featured', 'seller_verified', 'images',
            'created_at', 'updated_at'
        ]


class ProductSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for ProductSubmission model"""
    product = ProductSerializer(read_only=True)
    seller = UserSerializer(read_only=True)
    reviewed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = ProductSubmission
        fields = [
            'id', 'product', 'seller', 'status', 'submitted_at',
            'reviewed_at', 'reviewed_by', 'admin_notes'
        ]
        read_only_fields = [
            'id', 'product', 'seller', 'submitted_at', 'reviewed_at',
            'reviewed_by', 'admin_notes'
        ]


class PurchaseSerializer(serializers.ModelSerializer):
    """Serializer for Purchase model"""
    buyer = UserSerializer(read_only=True)
    seller = UserSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = Purchase
        fields = [
            'id', 'buyer', 'seller', 'product', 'quantity', 'unit_price',
            'total_amount', 'status', 'payment_method', 'transaction_id',
            'shipping_address', 'tracking_number', 'notes',
            'ordered_at', 'paid_at', 'shipped_at', 'delivered_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'buyer', 'seller', 'unit_price', 'total_amount', 'transaction_id',
            'ordered_at', 'paid_at', 'shipped_at', 'delivered_at',
            'created_at', 'updated_at'
        ]


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model"""
    user = UserSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    purchase = PurchaseSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'product', 'user', 'purchase', 'rating', 'title', 'content',
            'is_verified_purchase', 'is_approved', 'admin_notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'purchase', 'is_verified_purchase', 'is_approved',
            'admin_notes', 'created_at', 'updated_at'
        ]


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'notification_type', 'title', 'message',
            'is_read', 'is_important', 'action_url', 'metadata',
            'expires_at', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class WishlistSerializer(serializers.ModelSerializer):
    """Serializer for Wishlist model"""
    user = UserSerializer(read_only=True)
    product = ProductSerializer(read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'product', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class UserActivitySerializer(serializers.ModelSerializer):
    """Serializer for UserActivity model"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserActivity
        fields = [
            'id', 'user', 'activity_type', 'description', 'ip_address',
            'user_agent', 'metadata', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class MarketplaceSettingsSerializer(serializers.ModelSerializer):
    """Serializer for MarketplaceSettings model"""
    
    class Meta:
        model = MarketplaceSettings
        fields = [
            'id', 'merchant_application_fee', 'auto_approve_merchants',
            'auto_approve_products', 'enable_merchant_applications',
            'enable_product_submissions', 'enable_featured_products',
            'max_products_per_seller', 'min_product_price', 'max_product_price',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class SystemSettingsSerializer(serializers.ModelSerializer):
    """Serializer for SystemSettings model"""
    
    class Meta:
        model = SystemSettings
        fields = [
            'id', 'site_name', 'site_description', 'site_logo', 'default_currency',
            'exchange_rate_usd_to_ngn', 'transaction_fee_percentage',
            'minimum_transaction_fee', 'withdrawal_fee_percentage',
            'max_transaction_amount', 'daily_transaction_limit',
            'maintenance_mode', 'maintenance_message',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# Custom serializers for specific use cases
class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration with profile creation"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    referral_code = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password_confirm', 'referral_code']
    
    def validate(self, data):
        """Validate registration data"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("A user with this email already exists")
        
        return data
    
    def create(self, validated_data):
        """Create user and profile"""
        validated_data.pop('password_confirm')
        referral_code = validated_data.pop('referral_code', None)
        password = validated_data.pop('password')
        
        # Create user with hashed password
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=password
        )
        
        # Handle referral code if provided (signals will create profile automatically)
        if referral_code:
            try:
                referrer_profile = UserProfile.objects.get(referral_code=referral_code)
                # Update the profile created by signals with referral info
                profile = user.profile
                profile.referred_by = referrer_profile.user
                profile.save()
            except UserProfile.DoesNotExist:
                pass  # Invalid referral code, just ignore
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        """Validate login credentials"""
        from django.contrib.auth import authenticate
        
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError("Invalid login credentials")
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled")
            data['user'] = user
        else:
            raise serializers.ValidationError("Must include username and password")
        
        return data


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating products"""
    images = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = Product
        fields = [
            'title', 'description', 'category', 'subcategory', 'price',
            'original_price', 'condition', 'tags', 'specifications',
            'in_stock', 'stock_count', 'location', 'images'
        ]
    
    def create(self, validated_data):
        """Create product with images"""
        images_data = validated_data.pop('images', [])
        product = Product.objects.create(**validated_data)
        
        for i, image in enumerate(images_data):
            ProductImage.objects.create(
                product=product,
                image=image,
                order=i + 1
            )
        
        return product


class WalletSummarySerializer(serializers.ModelSerializer):
    """Simplified wallet serializer for dashboard"""
    total_balance_usd = serializers.SerializerMethodField()
    recent_transactions = serializers.SerializerMethodField()
    
    class Meta:
        model = Wallet
        fields = [
            'balance_usd', 'balance_ngn', 'total_balance_usd',
            'total_transactions', 'recent_transactions'
        ]
    
    def get_total_balance_usd(self, obj):
        """Calculate total balance in USD"""
        system_settings = SystemSettings.objects.first()
        exchange_rate = system_settings.exchange_rate_usd_to_ngn if system_settings else Decimal('1500.00')
        ngn_in_usd = obj.balance_ngn / exchange_rate
        return float(obj.balance_usd + ngn_in_usd)
    
    def get_recent_transactions(self, obj):
        """Get recent transactions"""
        recent = Transaction.objects.filter(wallet=obj).order_by('-created_at')[:5]
        return TransactionSerializer(recent, many=True).data