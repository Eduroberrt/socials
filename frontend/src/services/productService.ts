// Product Management Service for Dynamic Marketplace
// Replaces static mockProducts with seller-submitted and admin-approved products

// Utility function for generating IDs
function generateProductId(prefix: string = 'prod'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory: string;
  seller: string;
  sellerId: string;
  sellerVerified: boolean;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  location: string;
  condition: 'new' | 'used' | 'refurbished';
  tags: string[];
  specifications?: { [key: string]: string };
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'suspended';
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  featured: boolean;
  views: number;
  saves: number;
}

export interface ProductSubmission {
  productId: string;
  sellerId: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface ProductFilters {
  categories: { [key: string]: string[] };
  priceRange: [number, number];
  condition?: string[];
  location?: string;
  inStock?: boolean;
  verified?: boolean;
}

class ProductService {
  private products: Map<string, Product> = new Map();
  private submissions: Map<string, ProductSubmission> = new Map();
  private sellerProducts: Map<string, string[]> = new Map(); // sellerId -> productIds[]

  constructor() {
    this.loadFromStorage();
    this.initializeWithMockData();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('marketplace_products');
      if (stored) {
        const data = JSON.parse(stored);
        this.products = new Map(data.products || []);
        this.submissions = new Map(data.submissions || []);
        this.sellerProducts = new Map(data.sellerProducts || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = {
        products: Array.from(this.products.entries()),
        submissions: Array.from(this.submissions.entries()),
        sellerProducts: Array.from(this.sellerProducts.entries())
      };
      localStorage.setItem('marketplace_products', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving products:', error);
    }
  }

  private initializeWithMockData() {
    // Only initialize if no products exist
    if (this.products.size === 0) {
      this.createInitialProducts();
    }
  }

  private createInitialProducts() {
    const mockProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        title: "Premium Instagram Account - 50K Followers",
        description: "Verified Instagram account with 50,000 real followers. High engagement rate, perfect for influencers or businesses.",
        price: 299,
        originalPrice: 399,
        images: ["/images/instagram-account.jpg"],
        category: "Social Media",
        subcategory: "Instagram Accounts",
        seller: "SocialKing",
        sellerId: "seller_verified_001",
        sellerVerified: true,
        rating: 4.8,
        reviewCount: 127,
        inStock: true,
        stockCount: 1,
        location: "United States",
        condition: "new",
        tags: ["verified", "high-engagement", "instagram", "social-media"],
        specifications: {
          "Followers": "50,000",
          "Engagement Rate": "4.2%",
          "Account Age": "2 years",
          "Niche": "Lifestyle"
        },
        status: "approved",
        approvedAt: new Date(Date.now() - 86400000), // 1 day ago
        featured: true,
        views: 1250,
        saves: 89
      },
      {
        title: "YouTube Channel - Tech Reviews (10K Subs)",
        description: "Monetized YouTube channel focused on tech reviews. Consistent upload schedule and growing subscriber base.",
        price: 1500,
        images: ["/images/youtube-channel.jpg"],
        category: "Social Media",
        subcategory: "YouTube Channels",
        seller: "TechReviewer",
        sellerId: "seller_verified_002",
        sellerVerified: true,
        rating: 4.9,
        reviewCount: 45,
        inStock: true,
        stockCount: 1,
        location: "Canada",
        condition: "new",
        tags: ["monetized", "tech", "youtube", "reviews"],
        specifications: {
          "Subscribers": "10,247",
          "Monthly Views": "150K",
          "Revenue": "$400/month",
          "Upload Schedule": "3x per week"
        },
        status: "approved",
        approvedAt: new Date(Date.now() - 172800000), // 2 days ago
        featured: false,
        views: 890,
        saves: 67
      },
      {
        title: "TikTok Account - Dance Content (25K Followers)",
        description: "Popular TikTok account specializing in dance content. High viral potential with consistent growth.",
        price: 450,
        originalPrice: 600,
        images: ["/images/tiktok-account.jpg"],
        category: "Social Media",
        subcategory: "TikTok Accounts",
        seller: "DanceMaster",
        sellerId: "seller_verified_003",
        sellerVerified: true,
        rating: 4.7,
        reviewCount: 78,
        inStock: true,
        stockCount: 1,
        location: "United Kingdom",
        condition: "new",
        tags: ["viral", "dance", "tiktok", "entertainment"],
        specifications: {
          "Followers": "25,340",
          "Average Views": "50K per video",
          "Best Performing Video": "2.1M views",
          "Content Type": "Dance & Entertainment"
        },
        status: "approved",
        approvedAt: new Date(Date.now() - 259200000), // 3 days ago
        featured: true,
        views: 2100,
        saves: 156
      }
    ];

    mockProducts.forEach(productData => {
      const product: Product = {
        ...productData,
        id: generateProductId(),
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
        updatedAt: new Date()
      };

      this.products.set(product.id, product);
      
      // Add to seller's products
      const sellerProducts = this.sellerProducts.get(product.sellerId) || [];
      sellerProducts.push(product.id);
      this.sellerProducts.set(product.sellerId, sellerProducts);
    });

    this.saveToStorage();
  }

  // Submit new product (for approved merchants)
  submitProduct(sellerId: string, productData: Omit<Product, 'id' | 'sellerId' | 'status' | 'createdAt' | 'updatedAt' | 'views' | 'saves'>): Product | null {
    try {
      const product: Product = {
        ...productData,
        id: generateProductId(),
        sellerId,
        status: 'submitted',
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        saves: 0
      };

      this.products.set(product.id, product);

      // Add to seller's products
      const sellerProducts = this.sellerProducts.get(sellerId) || [];
      sellerProducts.push(product.id);
      this.sellerProducts.set(sellerId, sellerProducts);

      // Create submission record
      const submission: ProductSubmission = {
        productId: product.id,
        sellerId,
        submittedAt: new Date(),
        status: 'pending'
      };
      this.submissions.set(product.id, submission);

      this.saveToStorage();
      return product;
    } catch (error) {
      console.error('Error submitting product:', error);
      return null;
    }
  }

  // Get approved products for marketplace
  getApprovedProducts(): Product[] {
    return Array.from(this.products.values())
      .filter(product => product.status === 'approved')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Filter products
  filterProducts(products: Product[], filters: ProductFilters): Product[] {
    return products.filter(product => {
      // Category filter
      const categoryFilters = filters.categories;
      if (Object.keys(categoryFilters).length > 0) {
        const matchesCategory = Object.entries(categoryFilters).some(([category, subcategories]) => {
          if (product.category !== category) return false;
          return subcategories.length === 0 || subcategories.includes(product.subcategory);
        });
        if (!matchesCategory) return false;
      }

      // Price range filter
      const [minPrice, maxPrice] = filters.priceRange;
      if (product.price < minPrice || product.price > maxPrice) return false;

      // Condition filter
      if (filters.condition && filters.condition.length > 0) {
        if (!filters.condition.includes(product.condition)) return false;
      }

      // Stock filter
      if (filters.inStock !== undefined && filters.inStock) {
        if (!product.inStock) return false;
      }

      // Verified seller filter
      if (filters.verified !== undefined && filters.verified) {
        if (!product.sellerVerified) return false;
      }

      return true;
    });
  }

  // Get products by seller
  getSellerProducts(sellerId: string): Product[] {
    const productIds = this.sellerProducts.get(sellerId) || [];
    return productIds
      .map(id => this.products.get(id))
      .filter((product): product is Product => product !== undefined)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Get pending submissions for admin review
  getPendingSubmissions(): ProductSubmission[] {
    return Array.from(this.submissions.values())
      .filter(submission => submission.status === 'pending')
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  // Get products by status for admin review
  getProductsByStatus(status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'suspended'): Product[] {
    return Array.from(this.products.values())
      .filter(product => product.status === status)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Admin approve/reject product
  reviewProduct(productId: string, decision: 'approved' | 'rejected', adminNotes?: string, reviewerId?: string): Product | null {
    const product = this.products.get(productId);
    const submission = this.submissions.get(productId);
    
    if (!product || !submission) return null;

    // Update product
    const updatedProduct: Product = {
      ...product,
      status: decision,
      adminNotes,
      updatedAt: new Date(),
      ...(decision === 'approved' && { approvedAt: new Date() }),
      ...(decision === 'rejected' && { rejectedAt: new Date() })
    };

    // Update submission
    const updatedSubmission: ProductSubmission = {
      ...submission,
      status: decision,
      adminNotes,
      reviewedBy: reviewerId,
      reviewedAt: new Date()
    };

    this.products.set(productId, updatedProduct);
    this.submissions.set(productId, updatedSubmission);
    this.saveToStorage();

    return updatedProduct;
  }

  // Get product by ID
  getProduct(productId: string): Product | null {
    return this.products.get(productId) || null;
  }

  // Update product
  updateProduct(productId: string, updates: Partial<Product>): Product | null {
    const product = this.products.get(productId);
    if (!product) return null;

    const updatedProduct: Product = {
      ...product,
      ...updates,
      updatedAt: new Date()
    };

    this.products.set(productId, updatedProduct);
    this.saveToStorage();
    
    return updatedProduct;
  }

  // Get price range for filtering
  getPriceRange(products: Product[]): [number, number] {
    if (products.length === 0) return [0, 1000];
    
    const prices = products.map(p => p.price);
    return [Math.min(...prices), Math.max(...prices)];
  }

  // Get available categories
  getCategories(): { [key: string]: string[] } {
    const categories: { [key: string]: Set<string> } = {};
    
    Array.from(this.products.values()).forEach(product => {
      if (product.status === 'approved') {
        if (!categories[product.category]) {
          categories[product.category] = new Set();
        }
        categories[product.category].add(product.subcategory);
      }
    });

    // Convert Sets to arrays
    const result: { [key: string]: string[] } = {};
    Object.entries(categories).forEach(([category, subcategories]) => {
      result[category] = Array.from(subcategories);
    });

    return result;
  }

  // Get product stats
  getProductStats() {
    const products = Array.from(this.products.values());
    return {
      total: products.length,
      approved: products.filter(p => p.status === 'approved').length,
      pending: products.filter(p => p.status === 'submitted').length,
      rejected: products.filter(p => p.status === 'rejected').length,
      featured: products.filter(p => p.featured && p.status === 'approved').length
    };
  }

  // Search products
  searchProducts(query: string, products: Product[]): Product[] {
    if (!query.trim()) return products;
    
    const searchQuery = query.toLowerCase().trim();
    return products.filter(product => 
      product.title.toLowerCase().includes(searchQuery) ||
      product.description.toLowerCase().includes(searchQuery) ||
      product.subcategory.toLowerCase().includes(searchQuery) ||
      product.seller.toLowerCase().includes(searchQuery) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchQuery))
    );
  }
}

export const productService = new ProductService();