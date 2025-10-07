"""
Django REST Framework Views for Marketplace API
Provides API endpoints for all app models
"""

from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import (
    UserProfile, Wallet, Transaction, ReferralProgram, ReferralCode, Referral,
    MerchantApplication, Product, ProductImage, ProductSubmission,
    Purchase, Review, Notification, Wishlist, UserActivity,
    MarketplaceSettings, SystemSettings
)
from .serializers import (
    UserSerializer, UserProfileSerializer, WalletSerializer, TransactionSerializer,
    ReferralProgramSerializer, ReferralCodeSerializer, ReferralSerializer,
    MerchantApplicationSerializer, ProductSerializer, ProductImageSerializer,
    ProductSubmissionSerializer, PurchaseSerializer, ReviewSerializer,
    NotificationSerializer, WishlistSerializer, UserActivitySerializer,
    MarketplaceSettingsSerializer, SystemSettingsSerializer,
    UserRegistrationSerializer, UserLoginSerializer, ProductCreateSerializer,
    WalletSummarySerializer
)


# Authentication Views (Session-based)
@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    """Get CSRF token for frontend authentication"""
    from django.middleware.csrf import get_token
    return Response({
        'csrfToken': get_token(request)
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user with session authentication"""
    print(f"Registration request data: {request.data}")  # Debug log
    print(f"Registration request content type: {request.content_type}")  # Debug log
    
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Log the user in immediately after registration
        login(request, user)
        
        # Get user profile
        profile = UserProfile.objects.get(user=user)
        
        # Format response to match frontend expectations
        user_data = {
            'id': str(user.id),
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'profile': {
                'phone_number': profile.phone_number or '',
                'bio': profile.bio or '',
                'location': profile.location or '',
                'is_verified': profile.is_verified,
                'profile_photo': str(profile.profile_photo) if profile.profile_photo else ''
            }
        }
        
        return Response({
            'user': user_data,
            'message': 'User registered and logged in successfully'
        }, status=status.HTTP_201_CREATED)
    
    print(f"Registration serializer errors: {serializer.errors}")  # Debug log
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """Login user with session authentication"""
    from django.contrib.auth import login
    
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'error': 'Username and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
        profile = UserProfile.objects.get(user=user)
        
        # Format response to match frontend expectations
        user_data = {
            'id': str(user.id),
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'profile': {
                'phone_number': profile.phone_number or '',
                'bio': profile.bio or '',
                'location': profile.location or '',
                'is_verified': profile.is_verified,
                'profile_photo': str(profile.profile_photo) if profile.profile_photo else ''
            }
        }
        
        return Response({
            'user': user_data,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    else:
        return Response({
            'error': 'Invalid username or password'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """Logout user by destroying session"""
    from django.contrib.auth import logout
    logout(request)
    return Response({
        'message': 'Successfully logged out'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def current_user(request):
    """Get current authenticated user"""
    if request.user.is_authenticated:
        try:
            profile = UserProfile.objects.get(user=request.user)
            
            # Format response to match frontend expectations
            user_data = {
                'id': str(request.user.id),
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'profile': {
                    'phone_number': profile.phone_number or '',
                    'bio': profile.bio or '',
                    'location': profile.location or '',
                    'is_verified': profile.is_verified,
                    'profile_photo': str(profile.profile_photo) if profile.profile_photo else ''
                }
            }
            
            return Response({
                'user': user_data
            }, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({
                'error': 'User profile not found'
            }, status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({
            'user': None
        }, status=status.HTTP_200_OK)


# User and Profile ViewSets
class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for User model (read-only)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user data"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for UserProfile model"""
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_verified', 'is_merchant', 'account_type']
    search_fields = ['user__username', 'user__email', 'bio', 'location']
    
    def get_queryset(self):
        """Filter profiles based on permissions"""
        if self.action == 'list':
            return UserProfile.objects.filter(user__is_active=True)
        return UserProfile.objects.all()
    
    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        """Get or update current user profile"""
        try:
            profile = UserProfile.objects.get(user=request.user)
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=request.user)
        
        if request.method == 'GET':
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            serializer = UserProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Wallet and Transaction ViewSets
class WalletViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Wallet model (read-only)"""
    queryset = Wallet.objects.all()
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Users can only access their own wallet"""
        return Wallet.objects.filter(user_profile__user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get wallet summary for dashboard"""
        try:
            wallet = Wallet.objects.get(user_profile__user=request.user)
            serializer = WalletSummarySerializer(wallet)
            return Response(serializer.data)
        except Wallet.DoesNotExist:
            return Response({'error': 'Wallet not found'}, status=status.HTTP_404_NOT_FOUND)


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Transaction model (read-only)"""
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['transaction_type', 'currency', 'status']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Users can only access their own transactions"""
        return Transaction.objects.filter(wallet__user_profile__user=self.request.user)


# Referral ViewSets
class ReferralProgramViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for ReferralProgram model (read-only)"""
    queryset = ReferralProgram.objects.filter(is_active=True)
    serializer_class = ReferralProgramSerializer
    permission_classes = [AllowAny]


class ReferralCodeViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for ReferralCode model (read-only)"""
    queryset = ReferralCode.objects.all()
    serializer_class = ReferralCodeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Users can only access their own referral codes"""
        return ReferralCode.objects.filter(user=self.request.user, is_active=True)


class ReferralViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Referral model (read-only)"""
    queryset = Referral.objects.all()
    serializer_class = ReferralSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_active']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Users can only access referrals they're involved in"""
        return Referral.objects.filter(
            models.Q(referrer=self.request.user) | models.Q(referee=self.request.user)
        )


# Marketplace ViewSets
class MerchantApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet for MerchantApplication model"""
    queryset = MerchantApplication.objects.all()
    serializer_class = MerchantApplicationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status', 'business_type']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Users can only access their own applications"""
        return MerchantApplication.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Set the user when creating an application"""
        serializer.save(user=self.request.user)


class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet for Product model"""
    queryset = Product.objects.filter(status='approved')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]  # Allow anonymous browsing
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'subcategory', 'condition', 'seller_verified', 'featured']
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'price', 'rating', 'views']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """Allow anonymous read, require auth for write operations"""
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        """Use different serializer for create"""
        if self.action == 'create':
            return ProductCreateSerializer
        return ProductSerializer
    
    def perform_create(self, serializer):
        """Set the seller when creating a product"""
        serializer.save(seller=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_to_wishlist(self, request, pk=None):
        """Add product to user's wishlist"""
        product = self.get_object()
        wishlist, created = Wishlist.objects.get_or_create(
            user=request.user,
            product=product
        )
        if created:
            return Response({'message': 'Added to wishlist'}, status=status.HTTP_201_CREATED)
        return Response({'message': 'Already in wishlist'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['delete'], permission_classes=[IsAuthenticated])
    def remove_from_wishlist(self, request, pk=None):
        """Remove product from user's wishlist"""
        product = self.get_object()
        try:
            wishlist = Wishlist.objects.get(user=request.user, product=product)
            wishlist.delete()
            return Response({'message': 'Removed from wishlist'}, status=status.HTTP_204_NO_CONTENT)
        except Wishlist.DoesNotExist:
            return Response({'error': 'Not in wishlist'}, status=status.HTTP_404_NOT_FOUND)


class ProductImageViewSet(viewsets.ModelViewSet):
    """ViewSet for ProductImage model"""
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Users can only manage images for their own products"""
        return ProductImage.objects.filter(product__seller=self.request.user)


# Purchase and Review ViewSets
class PurchaseViewSet(viewsets.ModelViewSet):
    """ViewSet for Purchase model"""
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Users can only access purchases they're involved in"""
        return Purchase.objects.filter(
            models.Q(buyer=self.request.user) | models.Q(seller=self.request.user)
        )
    
    def perform_create(self, serializer):
        """Set the buyer when creating a purchase"""
        serializer.save(buyer=self.request.user)


class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for Review model"""
    queryset = Review.objects.filter(is_approved=True)
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]  # Allow anonymous reading
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['rating', 'is_verified_purchase']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """Allow anonymous read, require auth for write operations"""
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def perform_create(self, serializer):
        """Set the user when creating a review"""
        serializer.save(user=self.request.user)


# Notification and Activity ViewSets
class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for Notification model"""
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['notification_type', 'is_read', 'is_important']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Users can only access their own notifications"""
        return Notification.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['patch'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})
    
    @action(detail=False, methods=['patch'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        count = self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'message': f'Marked {count} notifications as read'})


class WishlistViewSet(viewsets.ModelViewSet):
    """ViewSet for Wishlist model"""
    queryset = Wishlist.objects.all()
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Users can only access their own wishlist"""
        return Wishlist.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Set the user when creating a wishlist item"""
        serializer.save(user=self.request.user)


class UserActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for UserActivity model (read-only)"""
    queryset = UserActivity.objects.all()
    serializer_class = UserActivitySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['activity_type']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Users can only access their own activity"""
        return UserActivity.objects.filter(user=self.request.user)


# Settings ViewSets (Admin only)
class MarketplaceSettingsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for MarketplaceSettings model (read-only for regular users)"""
    queryset = MarketplaceSettings.objects.all()
    serializer_class = MarketplaceSettingsSerializer
    permission_classes = [AllowAny]  # Public settings


class SystemSettingsViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for SystemSettings model (read-only for regular users)"""
    queryset = SystemSettings.objects.all()
    serializer_class = SystemSettingsSerializer
    permission_classes = [AllowAny]  # Public settings


# Import models for Q objects
from django.db import models

def index(request):
    """Serve the React frontend application"""
    return render(request, "frontend/index.html")

def frontend_app(request):
    """Catch-all view for React Router paths"""
    return render(request, "frontend/index.html")
