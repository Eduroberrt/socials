import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import ProductFilters from './ProductFilters';

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFiltersChange: (filters: { categories: { [key: string]: string[] }; priceRange: [number, number] }) => void;
  currentFilters: { categories: { [key: string]: string[] }; priceRange: [number, number] };
  maxPrice: number;
  minPrice: number;
  productCount: number;
  getFilteredCount: (filters: { categories: { [key: string]: string[] }; priceRange: [number, number] }) => number;
}

const MobileFilterModal: React.FC<MobileFilterModalProps> = ({
  isOpen,
  onClose,
  onFiltersChange,
  currentFilters,
  maxPrice,
  minPrice,
  productCount,
  getFilteredCount
}) => {
  // Local state to track filters while modal is open
  const [tempFilters, setTempFilters] = useState(currentFilters);

  // Calculate real-time product count based on temp filters
  const tempProductCount = getFilteredCount(tempFilters);

  // Update temp filters when modal opens with current filters
  useEffect(() => {
    if (isOpen) {
      setTempFilters(currentFilters);
    }
  }, [isOpen]); // Remove currentFilters dependency to prevent reset during editing

  const handleTempFiltersChange = (filters: typeof tempFilters) => {
    setTempFilters(filters);
  };

  const handleApplyFilters = () => {
    // Apply the temporary filters to the main state
    console.log('MobileFilterModal applying filters:', JSON.stringify(tempFilters, null, 2));
    onFiltersChange(tempFilters);
    onClose();
  };

  const handleCancel = () => {
    // Reset temp filters to current filters
    setTempFilters(currentFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[60]"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-saas-black border-l border-gray-800 z-[60] transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Filters</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="text-gray-400 hover:text-white h-8 w-8"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Filters Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <ProductFilters
              onFiltersChange={handleTempFiltersChange}
              maxPrice={maxPrice}
              minPrice={minPrice}
              initialFilters={tempFilters}
            />
          </div>

          {/* Footer with Apply Button */}
          <div className="p-4 border-t border-gray-800">
            <Button
              onClick={handleApplyFilters}
              className="w-full bg-saas-orange hover:bg-saas-orange/90 text-white font-medium py-3"
            >
              Show {tempProductCount} Account{tempProductCount !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileFilterModal;