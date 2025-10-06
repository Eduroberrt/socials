import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Label } from './ui/label';

interface FilterCategory {
  id: string;
  name: string;
  options: string[];
}

interface FilterState {
  categories: { [key: string]: string[] };
  priceRange: [number, number];
}

interface ProductFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  maxPrice?: number;
  minPrice?: number;
  resetTrigger?: number; // Optional - only used for desktop sidebar
  initialFilters?: FilterState; // For mobile modal - initialize with these values
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ 
  onFiltersChange, 
  maxPrice = 10000, 
  minPrice = 0,
  resetTrigger = 0,
  initialFilters
}) => {
  // Admin-configurable categories with their options
  const categories: FilterCategory[] = [
    {
      id: 'social-media',
      name: 'Social Media',
      options: ['Instagram', 'Facebook', 'Twitter/X', 'TikTok', 'LinkedIn', 'YouTube', 'Snapchat', 'Pinterest']
    },
    {
      id: 'emails',
      name: 'Emails',
      options: ['Gmail', 'Yahoo', 'Outlook', 'Business Email', 'Temp Email', 'Bulk Email']
    },
    {
      id: 'giftcards',
      name: 'Gift Cards',
      options: ['Amazon', 'Apple', 'Google Play', 'Steam', 'Netflix', 'Spotify', 'iTunes', 'PayPal']
    },
    {
      id: 'vpns',
      name: 'VPNs',
      options: ['NordVPN', 'ExpressVPN', 'Surfshark', 'CyberGhost', 'ProtonVPN', 'IPVanish']
    },
    {
      id: 'websites',
      name: 'Websites',
      options: ['WordPress', 'Shopify', 'Domain Names', 'Hosting', 'SSL Certificates', 'Website Templates']
    },
    {
      id: 'gaming',
      name: 'Gaming',
      options: ['Steam', 'Epic Games', 'PlayStation', 'Xbox', 'Nintendo', 'Mobile Games', 'Game Keys']
    },
    {
      id: 'accounts-subscriptions',
      name: 'Accounts & Subscriptions',
      options: ['Netflix', 'Spotify', 'Adobe', 'Microsoft Office', 'Canva', 'Figma', 'Zoom', 'Dropbox']
    },
    {
      id: 'others',
      name: 'Others',
      options: ['Custom Services', 'Digital Products', 'Software', 'Tools', 'Utilities']
    }
  ];

  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string[] }>(
    initialFilters?.categories || {}
  );
  const [priceRange, setPriceRange] = useState<[number, number]>(
    initialFilters?.priceRange || [minPrice, maxPrice]
  );

  // Reset filters when resetTrigger changes (external clear) - only if resetTrigger is provided
  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      setSelectedOptions({});
      setPriceRange([minPrice, maxPrice]);
      setExpandedCategories([]);
    }
  }, [resetTrigger, minPrice, maxPrice]);

  // Sync with initial filters when they change (for mobile modal)
  useEffect(() => {
    if (initialFilters) {
      setSelectedOptions(initialFilters.categories);
      setPriceRange(initialFilters.priceRange);
    }
  }, [initialFilters]);

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Handle option selection
  const handleOptionChange = (categoryId: string, option: string, checked: boolean) => {
    setSelectedOptions(prev => {
      const categoryOptions = prev[categoryId] || [];
      const newOptions = checked
        ? [...categoryOptions, option]
        : categoryOptions.filter(opt => opt !== option);
      
      return {
        ...prev,
        [categoryId]: newOptions
      };
    });
  };

  // Handle price range change
  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange([value[0], value[1]]);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedOptions({});
    setPriceRange([minPrice, maxPrice]);
  };

  // Effect to notify parent of filter changes
  useEffect(() => {
    onFiltersChange({
      categories: selectedOptions,
      priceRange
    });
  }, [selectedOptions, priceRange]); // Removed onFiltersChange from dependencies to prevent infinite loop

  // Count total selected filters
  const totalSelectedFilters = Object.values(selectedOptions).reduce(
    (total, options) => total + options.length,
    0
  ) + (priceRange[0] !== minPrice || priceRange[1] !== maxPrice ? 1 : 0);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-4">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-saas-orange" />
          <h3 className="text-lg font-semibold text-white">Product Categories</h3>
          {totalSelectedFilters > 0 && (
            <span className="bg-saas-orange text-white text-xs px-2 py-1 rounded-full">
              {totalSelectedFilters}
            </span>
          )}
        </div>
        
        {totalSelectedFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-400 hover:text-white text-xs"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Category Dropdowns */}
      <div className="space-y-3">
        {categories.map((category) => {
          const isExpanded = expandedCategories.includes(category.id);
          const selectedCount = selectedOptions[category.id]?.length || 0;

          return (
            <div key={category.id} className="border border-gray-700 rounded-lg">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">{category.name}</span>
                  {selectedCount > 0 && (
                    <span className="bg-saas-orange text-white text-xs px-2 py-1 rounded-full">
                      {selectedCount}
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Category Options */}
              {isExpanded && (
                <div className="border-t border-gray-700 p-3 space-y-2 max-h-64 overflow-y-auto">
                  {category.options.map((option) => {
                    const isChecked = selectedOptions[category.id]?.includes(option) || false;
                    
                    return (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${category.id}-${option}`}
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleOptionChange(category.id, option, checked as boolean)
                          }
                          className="border-gray-600 data-[state=checked]:bg-saas-orange data-[state=checked]:border-saas-orange"
                        />
                        <Label
                          htmlFor={`${category.id}-${option}`}
                          className="text-sm text-gray-300 cursor-pointer hover:text-white transition-colors"
                        >
                          {option}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Price Range Slider */}
      <div className="border border-gray-700 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-white font-medium">Price Range</Label>
          <span className="text-sm text-gray-400">
            ${priceRange[0]} - ${priceRange[1]}
          </span>
        </div>
        
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            max={maxPrice}
            min={minPrice}
            step={10}
            className="w-full"
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-400">
          <span>Min: ${minPrice}</span>
          <span>Max: ${maxPrice}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;