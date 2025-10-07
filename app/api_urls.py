from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api_views

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'merchant-applications', api_views.MerchantApplicationViewSet, basename='merchantapplication')
router.register(r'products', api_views.ProductViewSet, basename='product')
router.register(r'product-submissions', api_views.ProductSubmissionViewSet, basename='productsubmission')
router.register(r'marketplace-settings', api_views.MarketplaceSettingsViewSet, basename='marketplacesettings')

# API URLs
urlpatterns = [
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]