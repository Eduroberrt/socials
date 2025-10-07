// Test Data Setup for Dynamic Marketplace
// This script creates sample merchant applications and product submissions for testing

import { merchantService } from '../services/merchantService';
import { productService } from '../services/productService';

export function setupTestData() {
  console.log('Setting up test data for dynamic marketplace...');

  // Create test merchant applications
  const testUserId1 = 'user_test_1';
  const testUserId2 = 'user_test_2';
  const testUserId3 = 'user_test_3';

  // Create merchant application 1
  const app1 = merchantService.createApplication(testUserId1);
  merchantService.updateApplication(app1.id, {
    account: {
      businessName: 'TechGear Solutions',
      businessType: 'Electronics Retailer',
      contactEmail: 'contact@techgear.com',
      contactPhone: '+1-555-0123',
      businessAddress: '123 Tech Street, Silicon Valley, CA 94000',
      businessDescription: 'Specialized in high-quality electronics and gadgets for consumers and businesses.'
    },
    credentials: {
      businessLicense: null,
      taxId: 'EIN-12-3456789',
      bankAccount: 'BANK****1234',
      identityDocument: null
    }
  });

  // Process payment and submit
  merchantService.processPayment(app1.id, 'Credit Card').then(() => {
    merchantService.submitApplication(app1.id);
  });

  // Create merchant application 2
  const app2 = merchantService.createApplication(testUserId2);
  merchantService.updateApplication(app2.id, {
    account: {
      businessName: 'Fashion Forward',
      businessType: 'Clothing & Accessories',
      contactEmail: 'hello@fashionforward.com',
      contactPhone: '+1-555-0456',
      businessAddress: '456 Style Avenue, New York, NY 10001',
      businessDescription: 'Trendy fashion and accessories for the modern lifestyle.'
    },
    credentials: {
      businessLicense: null,
      taxId: 'EIN-98-7654321',
      bankAccount: 'BANK****5678',
      identityDocument: null
    }
  });

  // Process payment and submit
  merchantService.processPayment(app2.id, 'Crypto Wallet').then(() => {
    merchantService.submitApplication(app2.id);
  });

  // Create and approve merchant application 3
  const app3 = merchantService.createApplication(testUserId3);
  merchantService.updateApplication(app3.id, {
    account: {
      businessName: 'Home & Garden Plus',
      businessType: 'Home Improvement',
      contactEmail: 'support@homegardenplus.com',
      contactPhone: '+1-555-0789',
      businessAddress: '789 Garden Lane, Austin, TX 73301',
      businessDescription: 'Quality home improvement and garden supplies for DIY enthusiasts.'
    },
    credentials: {
      businessLicense: null,
      taxId: 'EIN-45-6789012',
      bankAccount: 'BANK****9012',
      identityDocument: null
    }
  });

  // Process payment, submit, and approve
  merchantService.processPayment(app3.id, 'Digital Wallet').then(() => {
    merchantService.submitApplication(app3.id);
    // Auto-approve this one for testing
    setTimeout(() => {
      merchantService.reviewApplication(app3.id, 'approved', 'Test approval for marketplace functionality', 'admin');
    }, 100);
  });

  // Create test product submissions (after merchant approval)
  setTimeout(() => {
    // Product from approved merchant
    const product1 = productService.submitProduct(testUserId3, {
      title: 'Professional Cordless Drill Set',
      description: 'High-performance 20V cordless drill with 2 batteries, charger, and 50-piece accessory kit. Perfect for professional contractors and DIY enthusiasts.',
      price: 149.99,
      originalPrice: 199.99,
      images: [
        'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500',
        'https://images.unsplash.com/photo-1586920930047-5aca0e26df6e?w=500'
      ],
      category: 'Tools & Hardware',
      subcategory: 'Power Tools',
      seller: 'Home & Garden Plus',
      sellerVerified: true,
      rating: 4.8,
      reviewCount: 127,
      inStock: true,
      stockCount: 25,
      location: 'Austin, TX',
      condition: 'new' as const,
      tags: ['cordless', 'drill', 'professional', 'battery', 'tools'],
      specifications: {
        'Battery': '20V Lithium-ion',
        'Chuck Size': '1/2 inch',
        'Torque': '300 in-lbs',
        'Speed': '0-400/0-1,500 RPM',
        'Weight': '3.2 lbs'
      },
      featured: false
    });

    const product2 = productService.submitProduct(testUserId3, {
      title: 'Smart LED Garden Lights (4-Pack)',
      description: 'Solar-powered smart LED garden lights with app control, multiple color modes, and weather-resistant design. Easy installation, no wiring required.',
      price: 89.99,
      images: [
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500',
        'https://images.unsplash.com/photo-1518709268805-4e9042af2ac0?w=500'
      ],
      category: 'Home & Garden',
      subcategory: 'Outdoor Lighting',
      seller: 'Home & Garden Plus',
      sellerVerified: true,
      rating: 4.6,
      reviewCount: 89,
      inStock: true,
      stockCount: 15,
      location: 'Austin, TX',
      condition: 'new' as const,
      tags: ['smart', 'led', 'solar', 'garden', 'lights', 'app-control'],
      specifications: {
        'Power Source': 'Solar + Battery Backup',
        'Brightness': '200 Lumens per light',
        'Colors': '16 million colors',
        'Connectivity': 'WiFi + Bluetooth',
        'Weather Rating': 'IP65 Waterproof'
      },
      featured: true
    });

    console.log('Test data setup complete!');
    console.log('Created merchant applications:', [app1.id, app2.id, app3.id]);
    console.log('Created product submissions:', [product1?.id, product2?.id]);
    console.log('Access Admin Dashboard at: /admin');
  }, 500);
}

// Auto-run setup if this file is loaded
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(setupTestData, 1000);
}