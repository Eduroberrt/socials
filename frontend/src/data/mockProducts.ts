export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  seller: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  imageUrl?: string;
  createdAt: Date;
}

// Mock product data for testing filters
export const mockProducts: Product[] = [
  // Social Media
  {
    id: '1',
    title: 'Premium Instagram Account - 50K Followers',
    description: 'Verified Instagram account with 50,000 real followers, high engagement rate',
    category: 'social-media',
    subcategory: 'Instagram',
    price: 250,
    seller: 'SocialKing',
    rating: 4.8,
    reviewCount: 23,
    isVerified: true,
    createdAt: new Date('2024-03-15')
  },
  {
    id: '2',
    title: 'Facebook Business Page - Established',
    description: 'Established Facebook business page with 25K likes and good reach',
    category: 'social-media',
    subcategory: 'Facebook',
    price: 180,
    seller: 'PageMaster',
    rating: 4.5,
    reviewCount: 17,
    isVerified: true,
    createdAt: new Date('2024-03-14')
  },
  {
    id: '3',
    title: 'Twitter X Account - Blue Verified',
    description: 'Blue verified Twitter account with 15K followers and high engagement',
    category: 'social-media',
    subcategory: 'Twitter/X',
    price: 320,
    seller: 'TwitterPro',
    rating: 4.9,
    reviewCount: 31,
    isVerified: true,
    createdAt: new Date('2024-03-13')
  },

  // Gift Cards
  {
    id: '4',
    title: 'Amazon Gift Card - $100',
    description: 'Valid Amazon gift card worth $100, instant delivery',
    category: 'giftcards',
    subcategory: 'Amazon',
    price: 95,
    seller: 'GiftCardDeals',
    rating: 4.7,
    reviewCount: 89,
    isVerified: true,
    createdAt: new Date('2024-03-12')
  },
  {
    id: '5',
    title: 'Steam Wallet Card - $50',
    description: 'Steam wallet gift card for gaming purchases',
    category: 'giftcards',
    subcategory: 'Steam',
    price: 47,
    seller: 'GameCards',
    rating: 4.6,
    reviewCount: 67,
    isVerified: true,
    createdAt: new Date('2024-03-11')
  },

  // VPNs
  {
    id: '6',
    title: 'NordVPN Premium - 2 Years',
    description: '2-year NordVPN premium subscription with all features',
    category: 'vpns',
    subcategory: 'NordVPN',
    price: 89,
    seller: 'VPNDeals',
    rating: 4.8,
    reviewCount: 45,
    isVerified: true,
    createdAt: new Date('2024-03-10')
  },
  {
    id: '7',
    title: 'ExpressVPN Account - 1 Year',
    description: 'Premium ExpressVPN account valid for 1 year',
    category: 'vpns',
    subcategory: 'ExpressVPN',
    price: 120,
    seller: 'SecureVPN',
    rating: 4.9,
    reviewCount: 52,
    isVerified: true,
    createdAt: new Date('2024-03-09')
  },

  // Emails
  {
    id: '8',
    title: 'Gmail Account - Aged 5 Years',
    description: 'Aged Gmail account with good reputation and phone verified',
    category: 'emails',
    subcategory: 'Gmail',
    price: 25,
    seller: 'EmailPro',
    rating: 4.4,
    reviewCount: 78,
    isVerified: true,
    createdAt: new Date('2024-03-08')
  },
  {
    id: '9',
    title: 'Business Email Package - 10 Accounts',
    description: 'Professional business email package with 10 accounts',
    category: 'emails',
    subcategory: 'Business Email',
    price: 150,
    seller: 'BizEmail',
    rating: 4.6,
    reviewCount: 34,
    isVerified: true,
    createdAt: new Date('2024-03-07')
  },

  // Gaming
  {
    id: '10',
    title: 'Steam Game Bundle - 20 Games',
    description: 'Bundle of 20 popular Steam games worth $500+',
    category: 'gaming',
    subcategory: 'Steam',
    price: 199,
    seller: 'GameBundler',
    rating: 4.7,
    reviewCount: 91,
    isVerified: true,
    createdAt: new Date('2024-03-06')
  },
  {
    id: '11',
    title: 'PlayStation Plus - 12 Months',
    description: '12-month PlayStation Plus subscription with monthly games',
    category: 'gaming',
    subcategory: 'PlayStation',
    price: 60,
    seller: 'ConsoleDeals',
    rating: 4.8,
    reviewCount: 156,
    isVerified: true,
    createdAt: new Date('2024-03-05')
  },

  // Accounts & Subscriptions
  {
    id: '12',
    title: 'Netflix Premium - 6 Months',
    description: 'Netflix premium account with 6 months validity',
    category: 'accounts-subscriptions',
    subcategory: 'Netflix',
    price: 45,
    seller: 'StreamingPro',
    rating: 4.5,
    reviewCount: 203,
    isVerified: true,
    createdAt: new Date('2024-03-04')
  },
  {
    id: '13',
    title: 'Spotify Family Plan - 1 Year',
    description: 'Spotify family plan subscription for 1 year (6 accounts)',
    category: 'accounts-subscriptions',
    subcategory: 'Spotify',
    price: 85,
    seller: 'MusicDeals',
    rating: 4.6,
    reviewCount: 127,
    isVerified: true,
    createdAt: new Date('2024-03-03')
  },
  {
    id: '14',
    title: 'Adobe Creative Suite - 1 Year',
    description: 'Full Adobe Creative Suite access for 1 year',
    category: 'accounts-subscriptions',
    subcategory: 'Adobe',
    price: 299,
    seller: 'CreativeTools',
    rating: 4.9,
    reviewCount: 76,
    isVerified: true,
    createdAt: new Date('2024-03-02')
  },

  // Websites
  {
    id: '15',
    title: 'Premium Domain - TechStartup.com',
    description: 'Premium domain name perfect for tech startups',
    category: 'websites',
    subcategory: 'Domain Names',
    price: 2500,
    seller: 'DomainKing',
    rating: 4.7,
    reviewCount: 12,
    isVerified: true,
    createdAt: new Date('2024-03-01')
  },
  {
    id: '16',
    title: 'WordPress Site Template + Hosting',
    description: 'Professional WordPress template with 1-year hosting included',
    category: 'websites',
    subcategory: 'WordPress',
    price: 150,
    seller: 'WebBuilder',
    rating: 4.4,
    reviewCount: 89,
    isVerified: true,
    createdAt: new Date('2024-02-29')
  },

  // Others
  {
    id: '17',
    title: 'Custom Logo Design Package',
    description: 'Professional logo design with unlimited revisions',
    category: 'others',
    subcategory: 'Custom Services',
    price: 75,
    seller: 'DesignPro',
    rating: 4.8,
    reviewCount: 234,
    isVerified: true,
    createdAt: new Date('2024-02-28')
  },
  {
    id: '18',
    title: 'AI Writing Tool - Lifetime Access',
    description: 'Lifetime access to premium AI writing and content generation tool',
    category: 'others',
    subcategory: 'Software',
    price: 199,
    seller: 'AITools',
    rating: 4.6,
    reviewCount: 167,
    isVerified: true,
    createdAt: new Date('2024-02-27')
  }
];

// Helper function to filter products based on filters
export const filterProducts = (
  products: Product[],
  filters: {
    categories: { [key: string]: string[] };
    priceRange: [number, number];
  }
): Product[] => {
  return products.filter(product => {
    // Price range filter
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false;
    }

    // Category filters
    const selectedCategories = Object.entries(filters.categories);
    
    // If no categories are selected, show all products (within price range)
    if (selectedCategories.length === 0) {
      return true;
    }

    // Check if any categories have subcategories selected
    const hasAnySubcategoriesSelected = selectedCategories.some(([_, subcategories]) => subcategories.length > 0);
    
    // If no subcategories are selected in any category, show all products
    if (!hasAnySubcategoriesSelected) {
      return true;
    }

    // Check if product matches any selected subcategory
    return selectedCategories.some(([categoryId, subcategories]) => {
      // If this category has no subcategories selected, skip it
      if (subcategories.length === 0) {
        return false;
      }
      
      // Check if product's category and subcategory match
      return product.category === categoryId && subcategories.includes(product.subcategory);
    });
  });
};

// Get price range from products
export const getPriceRange = (products: Product[]): [number, number] => {
  if (products.length === 0) return [0, 1000];
  
  const prices = products.map(p => p.price);
  return [Math.min(...prices), Math.max(...prices)];
};