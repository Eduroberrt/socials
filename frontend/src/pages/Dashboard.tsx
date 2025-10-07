import React, { useState, useMemo, useCallback, useEffect } from 'react';
import DashboardNavbar from '@/components/DashboardNavbar';
import ProductFilters from '@/components/ProductFilters';
import ProductCard from '@/components/ProductCard';
import MobileFilterModal from '@/components/MobileFilterModal';
import MobileBottomNavigation from '@/components/MobileBottomNavigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Search, Mic, Home, ShoppingBag, Megaphone, Wallet, Filter } from 'lucide-react';
import { productService, Product } from '@/services/productService';
import { setupTestData } from '@/utils/testDataSetup';

const Dashboard = () => {
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<{
    categories: { [key: string]: string[] };
    priceRange: [number, number];
  }>({ 
    categories: {}, 
    priceRange: [0, 1000] 
  });

  // Load products on component mount
  useEffect(() => {
    // Setup test data first (only runs once due to internal checks)
    setupTestData();
    
    // Small delay to ensure test data is created
    setTimeout(() => {
      const approvedProducts = productService.getApprovedProducts();
      setProducts(approvedProducts);
      
      // Update price range based on actual products
      const priceRange = productService.getPriceRange(approvedProducts);
      setFilters(prev => ({
        ...prev,
        priceRange
      }));
    }, 1100); // Wait a bit longer than test data setup
  }, []);
  
  // Mock admin announcement data
  const announcement = {
    text: "Welcome to our new marketplace! Discover verified sellers and authentic accounts.",
    link: "https://example.com/learn-more", // Set to null if no link
    hasLink: true
  };

  // Filter and search products in real-time
  const filteredProducts = useMemo(() => {
    console.log('Calculating filteredProducts with filters:', JSON.stringify(filters, null, 2));
    let filteredProducts = productService.filterProducts(products, filters);
    console.log('After filterProducts:', filteredProducts.length, 'products');
    
    // Apply search filter
    if (searchQuery.trim()) {
      filteredProducts = productService.searchProducts(searchQuery, filteredProducts);
      console.log('After search filter:', filteredProducts.length, 'products');
    }
    
    // Sort by creation date (newest first)
    const sortedProducts = filteredProducts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return sortedProducts;
  }, [products, filters, searchQuery]);

  // Function to calculate filtered product count for modal
  const getFilteredProductCount = (tempFilters: typeof filters) => {
    let filteredProducts = productService.filterProducts(products, tempFilters);
    
    // Apply search filter
    if (searchQuery.trim()) {
      filteredProducts = productService.searchProducts(searchQuery, filteredProducts);
    }
    
    return filteredProducts.length;
  };

  const handleFiltersChange = useCallback((newFilters: typeof filters) => {
    console.log('Dashboard handleFiltersChange called with:', JSON.stringify(newFilters, null, 2));
    setFilters(newFilters);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="min-h-screen bg-saas-black">
      <DashboardNavbar />
      
      {/* Announcement Area */}
      {showAnnouncement && (
        <div className="bg-saas-orange/10 border-b border-saas-orange/20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {/* Visual microphone icon */}
                <div className="flex-shrink-0 w-8 h-8 bg-saas-orange/20 rounded-full flex items-center justify-center">
                  <Mic className="w-4 h-4 text-saas-orange" />
                </div>
                
                {/* Notification text */}
                <span className="text-white text-sm md:text-base flex-1">
                  {announcement.text}
                </span>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {/* Click here button (if admin adds link) */}
                {announcement.hasLink && announcement.link && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-saas-orange text-saas-orange hover:bg-saas-orange hover:text-white text-xs"
                    onClick={() => window.open(announcement.link, '_blank')}
                  >
                    Click here
                  </Button>
                )}
                
                {/* X icon to close */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-saas-orange h-6 w-6 flex-shrink-0"
                  onClick={() => setShowAnnouncement(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Main Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-white">
              Marketplace {showMobileFilters && <span className="text-red-500">(MODAL OPEN)</span>}
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Access all products on the marketplace by our verified sellers
            </p>
          </div>
          
          {/* Search Field and Filter Button */}
          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search account name"
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-saas-darkGray border-gray-600 text-white placeholder-gray-400 focus:border-saas-orange pl-10"
              />
            </div>
            {/* Filter Button - Only visible on mobile */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                console.log('Filter button clicked!');
                setShowMobileFilters(true);
                console.log('showMobileFilters set to true');
              }}
              className="md:hidden border-gray-600 text-gray-400 hover:text-saas-orange hover:border-saas-orange h-10 w-10"
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar - 30% (Filters) - Hidden on mobile */}
          <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <ProductFilters 
              onFiltersChange={handleFiltersChange}
              maxPrice={products.length > 0 ? productService.getPriceRange(products)[1] : 1000}
              minPrice={products.length > 0 ? productService.getPriceRange(products)[0] : 0}
              resetTrigger={resetTrigger}
            />
          </div>

          {/* Right Content Area - Full width on mobile, 70% on desktop */}
          <div className="col-span-1 lg:col-span-8 xl:col-span-9">
            <div className="space-y-6">
              {/* Results Header */}
              <div className="bg-saas-darkGray rounded-xl p-6 border border-saas-orange/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    {searchQuery ? `Search Results for "${searchQuery}"` : 'Latest Accounts'}
                  </h3>
                  <span className="text-sm text-gray-400">({filteredProducts.length} found)</span>
                </div>

                {/* Products List */}
                {filteredProducts.length > 0 ? (
                  <div className="space-y-4">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h4 className="text-lg font-medium text-white mb-2">
                        {searchQuery ? 'No products found' : 'No products match your filters'}
                      </h4>
                      <p className="text-sm">
                        {searchQuery 
                          ? 'Try adjusting your search terms or filters' 
                          : 'Try adjusting your filter criteria'}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery('');
                        const clearedFilters = { 
                          categories: {}, 
                          priceRange: productService.getPriceRange(products) as [number, number]
                        };
                        setFilters(clearedFilters);
                        // Trigger reset in ProductFilters component
                        setResetTrigger(prev => prev + 1);
                      }}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <MobileFilterModal
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        onFiltersChange={handleFiltersChange}
        currentFilters={filters}
        maxPrice={products.length > 0 ? productService.getPriceRange(products)[1] : 1000}
        minPrice={products.length > 0 ? productService.getPriceRange(products)[0] : 0}
        productCount={filteredProducts.length}
        getFilteredCount={getFilteredProductCount}
      />
      
      <MobileBottomNavigation />
    </div>
  );
};

export default Dashboard;