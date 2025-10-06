import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  ShoppingCart, 
  Plus, 
  User, 
  Settings, 
  LogOut, 
  Wallet,
  Menu,
  X,
  Users,
  Gift
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const DashboardNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Function to check if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Mock data for notifications and cart
  const notificationCount = 3;
  const cartItemCount = 2;

  return (
    <nav className="bg-saas-black border-b border-saas-darkGray sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo - Left */}
          <div className="flex-shrink-0">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-saas-orange to-amber-500 bg-clip-text text-transparent">
                Acctthrive
              </span>
            </Link>
          </div>

          {/* Desktop Menu Items - Center */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link
              to="/dashboard"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/dashboard")
                  ? "text-saas-orange border-b-2 border-saas-orange"
                  : "text-white hover:text-saas-orange"
              }`}
            >
              Marketplace
            </Link>
            <Link
              to="/dashboard/purchases"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/dashboard/purchases")
                  ? "text-saas-orange border-b-2 border-saas-orange"
                  : "text-white hover:text-saas-orange"
              }`}
            >
              My Purchases
            </Link>
            <Link
              to="/dashboard/wallet"
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/dashboard/wallet")
                  ? "text-saas-orange border-b-2 border-saas-orange"
                  : "text-white hover:text-saas-orange"
              }`}
            >
              <Wallet className="w-4 h-4 inline mr-2" />
              Wallet
            </Link>
          </div>

          {/* Desktop Right Side Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Sell Products Button */}
            <Link to="/dashboard/sell">
              <Button className="bg-saas-orange hover:bg-orange-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Sell Products
              </Button>
            </Link>

            {/* Notification Bell */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-saas-orange hover:bg-saas-darkGray"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[16px] h-4 flex items-center justify-center p-1">
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Cart Icon */}
            <Link to="/dashboard/cart">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-saas-orange hover:bg-saas-darkGray"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-saas-orange text-white text-xs min-w-[16px] h-4 flex items-center justify-center p-1">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </Link>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profilePhoto || ""} alt="Profile" />
                  <AvatarFallback className="bg-saas-orange text-white">
                    {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-saas-darkGray border-gray-600" align="end">
                <DropdownMenuLabel className="text-white">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-400">{user?.email || 'user@example.com'}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-600" />
                <DropdownMenuItem className="text-white hover:bg-saas-black cursor-pointer">
                  <Link to="/dashboard/settings" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-saas-black cursor-pointer">
                  <Link to="/dashboard/wallet" className="flex items-center w-full">
                    <Wallet className="mr-2 h-4 w-4" />
                    <span>Wallet</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-saas-black cursor-pointer">
                  <Link to="/dashboard/referrals" className="flex items-center w-full">
                    <Gift className="mr-2 h-4 w-4" />
                    <span>Referrals</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-600" />
                <DropdownMenuItem 
                  className="text-red-400 hover:bg-saas-black cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Right Side - Notification, Cart, Profile */}
          <div className="lg:hidden flex items-center space-x-3">
            {/* Mobile Notification Bell */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-saas-orange hover:bg-saas-darkGray"
              >
                <Bell className="w-5 h-5" />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[16px] h-4 flex items-center justify-center p-1">
                    {notificationCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Mobile Cart Icon */}
            <Link to="/dashboard/cart">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-saas-orange hover:bg-saas-darkGray"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-saas-orange text-white text-xs min-w-[16px] h-4 flex items-center justify-center p-1">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </Link>

            {/* Mobile Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profilePhoto || ""} alt="Profile" />
                  <AvatarFallback className="bg-saas-orange text-white">
                    {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-saas-darkGray border-gray-600" align="end">
                <DropdownMenuLabel className="text-white">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-400">{user?.email || 'user@example.com'}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-600" />
                {/* Mobile Menu Items */}
                <DropdownMenuItem className="text-white hover:bg-saas-black cursor-pointer lg:hidden">
                  <Link to="/dashboard/referrals" className="flex items-center w-full">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Referrals</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-saas-black cursor-pointer lg:hidden">
                  <Link to="/dashboard/sell" className="flex items-center w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Sell Products</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-600 lg:hidden" />
                <DropdownMenuItem className="text-white hover:bg-saas-black cursor-pointer">
                  <Link to="/dashboard/settings" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-600" />
                <DropdownMenuItem 
                  className="text-red-400 hover:bg-saas-black cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;