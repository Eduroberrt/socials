import React from 'react';
import { Star, Shield, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Product } from '../data/mockProducts';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'social-media': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'emails': 'bg-green-500/20 text-green-400 border-green-500/30',
      'giftcards': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'vpns': 'bg-red-500/20 text-red-400 border-red-500/30',
      'websites': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'gaming': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'accounts-subscriptions': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'others': 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[category] || colors['others'];
  };

  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${getCategoryBadgeColor(product.category)}`}
              >
                {product.subcategory}
              </Badge>
              {product.isVerified && (
                <Shield className="w-4 h-4 text-green-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-white line-clamp-2 mb-1">
              {product.title}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">
              {product.description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Price and Rating */}
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-saas-orange">
              {formatPrice(product.price)}
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-white font-medium">{product.rating}</span>
              <span className="text-sm text-gray-400">({product.reviewCount})</span>
            </div>
          </div>

          {/* Seller Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-gray-700 text-white text-xs">
                  {product.seller.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-300">{product.seller}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{formatDate(product.createdAt)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              className="flex-1 bg-saas-orange hover:bg-saas-orange/90 text-white"
              size="sm"
            >
              Buy Now
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;