from rest_framework import viewsets, status, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import MerchantApplication, Product, ProductImage, ProductSubmission, MarketplaceSettings
from .serializers import (
    MerchantApplicationSerializer, 
    ProductSerializer, 
    ProductSubmissionSerializer,
    MarketplaceSettingsSerializer
)


class MerchantApplicationViewSet(viewsets.ModelViewSet):
    """ViewSet for merchant applications"""
    
    serializer_class = MerchantApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return applications for current user or all if admin"""
        if self.request.user.is_staff:
            return MerchantApplication.objects.all()
        return MerchantApplication.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Set the user when creating an application"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        """Approve a merchant application"""
        application = self.get_object()
        application.status = 'approved'
        application.reviewed_at = timezone.now()
        application.reviewed_by = request.user
        application.review_notes = request.data.get('notes', '')
        application.save()
        
        return Response({
            'status': 'approved',
            'message': 'Application approved successfully'
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        """Reject a merchant application"""
        application = self.get_object()
        application.status = 'rejected'
        application.reviewed_at = timezone.now()
        application.reviewed_by = request.user
        application.review_notes = request.data.get('notes', '')
        application.save()
        
        return Response({
            'status': 'rejected',
            'message': 'Application rejected'
        })
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit application for review"""
        application = self.get_object()
        if application.user != request.user:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        application.status = 'submitted'
        application.submitted_at = timezone.now()
        application.save()
        
        return Response({
            'status': 'submitted',
            'message': 'Application submitted for review'
        })


class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet for products"""
    
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return products based on user permissions"""
        queryset = Product.objects.all()
        
        # Non-staff users can only see approved products and their own
        if not self.request.user.is_staff:
            queryset = queryset.filter(
                Q(status='approved') | Q(seller=self.request.user)
            )
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by category if provided
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        # Search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(tags__icontains=search)
            )
        
        return queryset.select_related('seller', 'merchant_application').prefetch_related('images')
    
    def perform_create(self, serializer):
        """Set seller and merchant application when creating product"""
        # Get user's approved merchant application
        merchant_app = MerchantApplication.objects.filter(
            user=self.request.user,
            status='approved'
        ).first()
        
        if not merchant_app:
            raise serializers.ValidationError(
                "You must have an approved merchant application to create products"
            )
        
        serializer.save(
            seller=self.request.user,
            merchant_application=merchant_app,
            seller_verified=True
        )
    
    @action(detail=True, methods=['post'])
    def submit_for_review(self, request, pk=None):
        """Submit product for admin review"""
        product = self.get_object()
        
        if product.seller != request.user:
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        product.status = 'submitted'
        product.submitted_at = timezone.now()
        product.save()
        
        # Create submission record
        ProductSubmission.objects.create(
            product=product,
            seller=request.user
        )
        
        return Response({
            'status': 'submitted',
            'message': 'Product submitted for review'
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve_product(self, request, pk=None):
        """Approve a product submission"""
        product = self.get_object()
        product.status = 'approved'
        product.approved_at = timezone.now()
        product.reviewed_by = request.user
        product.admin_notes = request.data.get('notes', '')
        product.save()
        
        # Update submission record
        submission = ProductSubmission.objects.filter(
            product=product,
            status='pending'
        ).first()
        if submission:
            submission.status = 'approved'
            submission.reviewed_at = timezone.now()
            submission.reviewed_by = request.user
            submission.admin_notes = product.admin_notes
            submission.save()
        
        return Response({
            'status': 'approved',
            'message': 'Product approved successfully'
        })
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject_product(self, request, pk=None):
        """Reject a product submission"""
        product = self.get_object()
        product.status = 'rejected'
        product.rejected_at = timezone.now()
        product.reviewed_by = request.user
        product.admin_notes = request.data.get('notes', '')
        product.save()
        
        # Update submission record
        submission = ProductSubmission.objects.filter(
            product=product,
            status='pending'
        ).first()
        if submission:
            submission.status = 'rejected'
            submission.reviewed_at = timezone.now()
            submission.reviewed_by = request.user
            submission.admin_notes = product.admin_notes
            submission.save()
        
        return Response({
            'status': 'rejected',
            'message': 'Product rejected'
        })
    
    @action(detail=False, methods=['get'])
    def marketplace(self, request):
        """Get approved products for marketplace display"""
        products = Product.objects.filter(
            status='approved',
            in_stock=True,
            stock_count__gt=0
        ).select_related('seller', 'merchant_application').prefetch_related('images')
        
        # Apply filters
        category = request.query_params.get('category')
        if category:
            products = products.filter(category=category)
        
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        if min_price:
            products = products.filter(price__gte=min_price)
        if max_price:
            products = products.filter(price__lte=max_price)
        
        condition = request.query_params.get('condition')
        if condition:
            products = products.filter(condition=condition)
        
        featured_only = request.query_params.get('featured')
        if featured_only == 'true':
            products = products.filter(featured=True)
        
        search = request.query_params.get('search')
        if search:
            products = products.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(tags__icontains=search)
            )
        
        # Ordering
        ordering = request.query_params.get('ordering', '-created_at')
        products = products.order_by(ordering)
        
        # Paginate
        page = self.paginate_queryset(products)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)


class ProductSubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for product submissions (admin only)"""
    
    serializer_class = ProductSubmissionSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = ProductSubmission.objects.all().select_related('product', 'seller')


class MarketplaceSettingsViewSet(viewsets.ModelViewSet):
    """ViewSet for marketplace settings (admin only)"""
    
    serializer_class = MarketplaceSettingsSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = MarketplaceSettings.objects.all()
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get current marketplace settings"""
        settings = MarketplaceSettings.get_settings()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)