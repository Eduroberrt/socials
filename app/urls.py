"""
URL configuration for app API endpoints
"""

from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'profiles', views.UserProfileViewSet)
router.register(r'wallets', views.WalletViewSet)
router.register(r'transactions', views.TransactionViewSet)
router.register(r'referral-programs', views.ReferralProgramViewSet)
router.register(r'referral-codes', views.ReferralCodeViewSet)
router.register(r'referrals', views.ReferralViewSet)
router.register(r'merchant-applications', views.MerchantApplicationViewSet)
router.register(r'products', views.ProductViewSet)
router.register(r'product-images', views.ProductImageViewSet)
router.register(r'purchases', views.PurchaseViewSet)
router.register(r'reviews', views.ReviewViewSet)
router.register(r'notifications', views.NotificationViewSet)
router.register(r'wishlist', views.WishlistViewSet)
router.register(r'user-activity', views.UserActivityViewSet)
router.register(r'marketplace-settings', views.MarketplaceSettingsViewSet)
router.register(r'system-settings', views.SystemSettingsViewSet)

# The API URLs are now determined automatically by the router
urlpatterns = [
    # Session-based authentication endpoints
    path('auth/csrf/', views.get_csrf_token, name='csrf_token'),
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/logout/', views.logout_user, name='logout'),
    path('auth/user/', views.current_user, name='current_user'),
    
    # API endpoints
    path('api/', include(router.urls)),
    
    # DRF browsable API (for development)
    path('api-auth/', include('rest_framework.urls')),
    
    # Web routes
    path('', views.index, name='index'),
    # Catch-all pattern for React Router - should be last
    re_path(r'^.*/$', views.frontend_app, name='frontend_app'),
]