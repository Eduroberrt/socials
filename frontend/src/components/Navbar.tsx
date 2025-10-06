import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Function to check if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-saas-black bg-opacity-90 backdrop-blur-sm sticky top-0 z-50 border-b border-saas-darkGray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-saas-orange to-amber-500 bg-clip-text text-transparent">
                Acctthrive
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-3 py-2 text-sm font-medium transition-colors text-white hover:text-saas-orange"
              >
                Home
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-3 py-2 text-sm font-medium transition-colors text-white hover:text-saas-orange"
              >
                Features
              </button>
              <button
                onClick={() => document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-3 py-2 text-sm font-medium transition-colors text-white hover:text-saas-orange"
              >
                Marketplace
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-3 py-2 text-sm font-medium transition-colors text-white hover:text-saas-orange"
              >
                How It Works
              </button>
              <button
                onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-3 py-2 text-sm font-medium transition-colors text-white hover:text-saas-orange"
              >
                Testimonials
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" className="border-saas-orange text-saas-orange hover:bg-saas-orange hover:text-white">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-saas-orange hover:bg-orange-600 text-white">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-saas-darkGray">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 text-base font-medium ${
                isActive("/")
                  ? "text-saas-orange"
                  : "text-white hover:text-saas-orange"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to=""
              className={`block px-3 py-2 text-base font-medium ${
                isActive("")
                  ? "text-saas-orange"
                  : "text-white hover:text-saas-orange"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Roadmap
            </Link>
            <Link
              to=""
              className={`block px-3 py-2 text-base font-medium ${
                isActive("")
                  ? "text-saas-orange"
                  : "text-white hover:text-saas-orange"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link
              to=""
              className={`block px-3 py-2 text-base font-medium ${
                isActive("")
                  ? "text-saas-orange"
                  : "text-white hover:text-saas-orange"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <Link
              to=""
              className={`block px-3 py-2 text-base font-medium ${
                isActive("") || location.pathname.startsWith("/")
                  ? "text-saas-orange"
                  : "text-white hover:text-saas-orange"
              }`}
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>
            <div className="mt-4 px-3 py-2 space-y-3">
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full border-saas-orange text-saas-orange hover:bg-saas-orange hover:text-white">
                  Login
                </Button>
              </Link>
              <Link to="/signup" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-saas-orange hover:bg-orange-600 text-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
