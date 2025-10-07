from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils import timezone
from .models import (
    UserProfile, Wallet, Transaction, ReferralProgram, ReferralCode, Referral,
    MerchantApplication, Product, ProductImage, ProductSubmission, MarketplaceSettings,
    Purchase, Review, Notification, Wishlist, UserActivity, SystemSettings
)

# Inline admin descriptor for UserProfile model
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'User Profile'
    fields = ['phone_number', 'bio', 'location', 'is_verified', 'profile_photo']
    extra = 0

# Define a new User admin
class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    list_display = BaseUserAdmin.list_display + ('get_is_verified', 'get_profile_created', 'get_date_joined')
    list_filter = BaseUserAdmin.list_filter + ('date_joined',)
    
    def get_is_verified(self, obj):
        try:
            return obj.profile.is_verified if hasattr(obj, 'profile') else False
        except UserProfile.DoesNotExist:
            return False
    get_is_verified.boolean = True
    get_is_verified.short_description = 'Verified'
    
    def get_profile_created(self, obj):
        return hasattr(obj, 'profile') and UserProfile.objects.filter(user=obj).exists()
    get_profile_created.boolean = True
    get_profile_created.short_description = 'Profile Created'
    
    def get_date_joined(self, obj):
        return obj.date_joined
    get_date_joined.short_description = 'Date Joined'

# Re-register UserAdmin
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    pass
admin.site.register(User, UserAdmin)

# User Profile Admin
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone_number', 'location', 'is_verified', 'created_at']
    list_filter = ['is_verified', 'profile_visibility', 'email_notifications', 'created_at']
    search_fields = ['user__username', 'user__email', 'phone_number', 'location']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'phone_number', 'bio', 'birth_date', 'location')
        }),
        ('Verification', {
            'fields': ('is_verified', 'verification_document', 'profile_photo')
        }),
        ('Social Links', {
            'fields': ('website', 'twitter', 'instagram')
        }),
        ('Privacy & Notifications', {
            'fields': ('profile_visibility', 'email_notifications', 'push_notifications', 'marketing_emails')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


# Wallet and Transaction Admin
@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['user', 'usd_balance', 'ngn_balance', 'is_frozen', 'get_total_balance_usd', 'updated_at']
    list_filter = ['is_frozen', 'two_factor_enabled', 'created_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Balances', {
            'fields': ('usd_balance', 'ngn_balance', 'btc_balance', 'eth_balance')
        }),
        ('Security', {
            'fields': ('is_frozen', 'freeze_reason', 'two_factor_enabled')
        }),
        ('Limits', {
            'fields': ('daily_withdrawal_limit', 'monthly_withdrawal_limit')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ['reference', 'user', 'transaction_type', 'amount', 'currency', 'status', 'created_at']
    list_filter = ['transaction_type', 'status', 'currency', 'created_at']
    search_fields = ['user__username', 'reference', 'external_reference', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Transaction Details', {
            'fields': ('id', 'user', 'transaction_type', 'status', 'description')
        }),
        ('Amount & Currency', {
            'fields': ('amount', 'currency', 'fee_amount', 'network_fee')
        }),
        ('References', {
            'fields': ('reference', 'external_reference')
        }),
        ('Payment Info', {
            'fields': ('payment_method', 'payment_gateway', 'recipient')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'completed_at'),
            'classes': ('collapse',)
        })
    )


# Referral System Admin
@admin.register(ReferralProgram)
class ReferralProgramAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'referrer_bonus_usd', 'minimum_deposit_usd', 'start_date']
    list_filter = ['is_active', 'start_date']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ReferralCode)
class ReferralCodeAdmin(admin.ModelAdmin):
    list_display = ['user', 'code', 'total_uses', 'total_earnings', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['user__username', 'code']
    readonly_fields = ['created_at']


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ['referrer', 'referee', 'status', 'deposit_amount', 'referrer_reward', 'created_at']
    list_filter = ['status', 'created_at', 'qualified_at']
    search_fields = ['referrer__username', 'referee__username']
    readonly_fields = ['id', 'created_at', 'updated_at']


# Marketplace Admin (existing, enhanced)
@admin.register(MerchantApplication)
class MerchantApplicationAdmin(admin.ModelAdmin):
    list_display = ['business_name', 'user', 'status', 'payment_status', 'business_type', 'submitted_at', 'created_at']
    list_filter = ['status', 'payment_status', 'business_type', 'created_at', 'submitted_at']
    search_fields = ['business_name', 'contact_email', 'user__username', 'user__email', 'tax_id']
    readonly_fields = ['id', 'created_at', 'updated_at', 'transaction_id', 'paid_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'user', 'status')
        }),
        ('Payment Information', {
            'fields': ('payment_method', 'payment_amount', 'payment_status', 'transaction_id', 'paid_at')
        }),
        ('Business Information', {
            'fields': ('business_name', 'business_type', 'contact_email', 'contact_phone', 'business_address', 'business_description')
        }),
        ('Credentials', {
            'fields': ('business_license', 'tax_id', 'bank_account', 'identity_document')
        }),
        ('Review Information', {
            'fields': ('submitted_at', 'reviewed_at', 'reviewed_by', 'review_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['approve_applications', 'reject_applications', 'mark_under_review']
    
    def approve_applications(self, request, queryset):
        """Bulk approve merchant applications"""
        count = 0
        for application in queryset.filter(status__in=['submitted', 'under_review']):
            application.status = 'approved'
            application.reviewed_at = timezone.now()
            application.reviewed_by = request.user
            application.save()
            count += 1
        
        self.message_user(request, f"Successfully approved {count} applications.")
    approve_applications.short_description = "Approve selected applications"
    
    def reject_applications(self, request, queryset):
        """Bulk reject merchant applications"""
        count = 0
        for application in queryset.filter(status__in=['submitted', 'under_review']):
            application.status = 'rejected'
            application.reviewed_at = timezone.now()
            application.reviewed_by = request.user
            application.save()
            count += 1
        
        self.message_user(request, f"Successfully rejected {count} applications.")
    reject_applications.short_description = "Reject selected applications"
    
    def mark_under_review(self, request, queryset):
        """Mark applications as under review"""
        count = queryset.filter(status='submitted').update(
            status='under_review',
            reviewed_at=timezone.now(),
            reviewed_by=request.user
        )
        self.message_user(request, f"Marked {count} applications as under review.")
    mark_under_review.short_description = "Mark as under review"


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'alt_text', 'order']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['title', 'seller', 'get_business_name', 'category', 'price', 'status', 'in_stock', 'created_at']
    list_filter = ['status', 'category', 'condition', 'in_stock', 'featured', 'seller_verified', 'created_at']
    search_fields = ['title', 'description', 'tags', 'seller__username', 'merchant_application__business_name']
    readonly_fields = ['id', 'views', 'saves', 'created_at', 'updated_at']
    filter_horizontal = []
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'title', 'description', 'category', 'subcategory')
        }),
        ('Pricing', {
            'fields': ('price', 'original_price')
        }),
        ('Product Details', {
            'fields': ('condition', 'tags', 'specifications')
        }),
        ('Seller Information', {
            'fields': ('seller', 'merchant_application', 'seller_verified')
        }),
        ('Inventory', {
            'fields': ('in_stock', 'stock_count', 'location')
        }),
        ('Rating & Reviews', {
            'fields': ('rating', 'review_count')
        }),
        ('Status & Review', {
            'fields': ('status', 'submitted_at', 'approved_at', 'rejected_at', 'admin_notes', 'reviewed_by')
        }),
        ('Engagement', {
            'fields': ('views', 'saves', 'featured')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    inlines = [ProductImageInline]
    actions = ['approve_products', 'reject_products', 'feature_products', 'unfeature_products']
    
    def get_business_name(self, obj):
        """Get the business name from merchant application"""
        return obj.merchant_application.business_name or obj.seller.username
    get_business_name.short_description = 'Business Name'
    get_business_name.admin_order_field = 'merchant_application__business_name'
    
    def approve_products(self, request, queryset):
        """Bulk approve products"""
        count = 0
        for product in queryset.filter(status='submitted'):
            product.status = 'approved'
            product.approved_at = timezone.now()
            product.reviewed_by = request.user
            product.save()
            count += 1
        
        self.message_user(request, f"Successfully approved {count} products.")
    approve_products.short_description = "Approve selected products"
    
    def reject_products(self, request, queryset):
        """Bulk reject products"""
        count = 0
        for product in queryset.filter(status='submitted'):
            product.status = 'rejected'
            product.rejected_at = timezone.now()
            product.reviewed_by = request.user
            product.save()
            count += 1
        
        self.message_user(request, f"Successfully rejected {count} products.")
    reject_products.short_description = "Reject selected products"
    
    def feature_products(self, request, queryset):
        """Mark products as featured"""
        count = queryset.filter(status='approved').update(featured=True)
        self.message_user(request, f"Featured {count} products.")
    feature_products.short_description = "Mark as featured"
    
    def unfeature_products(self, request, queryset):
        """Remove featured status from products"""
        count = queryset.update(featured=False)
        self.message_user(request, f"Removed featured status from {count} products.")
    unfeature_products.short_description = "Remove featured status"


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'image', 'alt_text', 'order', 'created_at']
    list_filter = ['created_at']
    search_fields = ['product__title', 'alt_text']
    readonly_fields = ['created_at']


@admin.register(ProductSubmission)
class ProductSubmissionAdmin(admin.ModelAdmin):
    list_display = ['product', 'seller', 'status', 'submitted_at', 'reviewed_at', 'reviewed_by']
    list_filter = ['status', 'submitted_at', 'reviewed_at']
    search_fields = ['product__title', 'seller__username', 'admin_notes']
    readonly_fields = ['submitted_at']
    
    fieldsets = (
        ('Submission Information', {
            'fields': ('product', 'seller', 'status', 'submitted_at')
        }),
        ('Review Information', {
            'fields': ('reviewed_at', 'reviewed_by', 'admin_notes')
        })
    )


# Purchase and Review Admin
@admin.register(Purchase)
class PurchaseAdmin(admin.ModelAdmin):
    list_display = ['buyer', 'product', 'seller', 'quantity', 'total_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at', 'shipped_at', 'delivered_at']
    search_fields = ['buyer__username', 'seller__username', 'product__title', 'tracking_number']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'is_verified_purchase', 'is_approved', 'created_at']
    list_filter = ['rating', 'is_verified_purchase', 'is_approved', 'created_at']
    search_fields = ['product__title', 'user__username', 'title', 'content']
    readonly_fields = ['created_at', 'updated_at']


# Notification and Activity Admin
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification_type', 'title', 'is_read', 'is_important', 'created_at']
    list_filter = ['notification_type', 'is_read', 'is_important', 'created_at']
    search_fields = ['user__username', 'title', 'message']
    readonly_fields = ['id', 'created_at']


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'product__title']


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ['user', 'activity_type', 'ip_address', 'created_at']
    list_filter = ['activity_type', 'created_at']
    search_fields = ['user__username', 'description', 'ip_address']
    readonly_fields = ['created_at']


# Settings Admin
@admin.register(MarketplaceSettings)
class MarketplaceSettingsAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'merchant_application_fee', 'auto_approve_merchants', 'auto_approve_products', 'updated_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Application Fees', {
            'fields': ('merchant_application_fee',)
        }),
        ('Auto-approval Settings', {
            'fields': ('auto_approve_merchants', 'auto_approve_products')
        }),
        ('Feature Flags', {
            'fields': ('enable_merchant_applications', 'enable_product_submissions', 'enable_featured_products')
        }),
        ('Marketplace Rules', {
            'fields': ('max_products_per_seller', 'min_product_price', 'max_product_price')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def has_add_permission(self, request):
        """Only allow one settings instance"""
        return not MarketplaceSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of settings"""
        return False


@admin.register(SystemSettings)
class SystemSettingsAdmin(admin.ModelAdmin):
    list_display = ['site_name', 'default_currency', 'exchange_rate_usd_to_ngn', 'maintenance_mode', 'updated_at']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Site Configuration', {
            'fields': ('site_name', 'site_description', 'site_logo')
        }),
        ('Currency Settings', {
            'fields': ('default_currency', 'exchange_rate_usd_to_ngn')
        }),
        ('Transaction Fees', {
            'fields': ('transaction_fee_percentage', 'minimum_transaction_fee', 'withdrawal_fee_percentage')
        }),
        ('System Limits', {
            'fields': ('max_transaction_amount', 'daily_transaction_limit')
        }),
        ('Maintenance', {
            'fields': ('maintenance_mode', 'maintenance_message')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def has_add_permission(self, request):
        """Only allow one settings instance"""
        return not SystemSettings.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deletion of settings"""
        return False


# Custom admin site configuration
admin.site.site_header = "Acctthrive Admin Portal"
admin.site.site_title = "Acctthrive Admin"
admin.site.index_title = "Welcome to Acctthrive Administration"
