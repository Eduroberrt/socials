import React from 'react';
import { useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Megaphone, Wallet } from 'lucide-react';

const MobileBottomNavigation = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      href: '/dashboard',
      icon: Home,
      label: 'Marketplace',
      path: '/dashboard'
    },
    {
      href: '/dashboard/purchases',
      icon: ShoppingBag,
      label: 'Purchases',
      path: '/dashboard/purchases'
    },
    {
      href: '/dashboard/ads',
      icon: Megaphone,
      label: 'Ads',
      path: '/dashboard/ads'
    },
    {
      href: '/dashboard/wallet',
      icon: Wallet,
      label: 'Wallet',
      path: '/dashboard/wallet'
    }
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-saas-black border-t border-gray-800 z-50">
        <div className="flex items-center justify-around py-2 px-4 pb-safe">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <a
                key={item.path}
                href={item.href}
                className={`flex flex-col items-center py-2 px-3 transition-colors rounded-lg ${
                  active
                    ? 'text-saas-orange bg-saas-orange/10'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Add bottom padding to prevent overlap with mobile nav */}
      <div className="md:hidden h-20"></div>
    </>
  );
};

export default MobileBottomNavigation;