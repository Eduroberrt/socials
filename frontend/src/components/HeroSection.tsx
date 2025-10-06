import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <div className="relative bg-gradient-to-b from-saas-black to-[#1c160c] overflow-hidden min-h-[90vh] flex items-center">
      {/* Orange glow effects */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-saas-orange opacity-10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-orange-700 opacity-15 rounded-full blur-[80px]"></div>
      <div className="absolute top-20 right-1/4 w-[250px] h-[250px] bg-orange-400 opacity-10 rounded-full blur-[70px]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left side - Content */}
          <div className="text-left">
            <span className="inline-block bg-saas-orange/10 text-saas-orange px-4 py-2 rounded-full text-sm font-medium mb-6 border border-saas-orange/20">
              Introducing Acctthrive
            </span>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Discover Authentic Accounts In Our <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Trusted Marketplace</span>
            </h1>
            
            <p className="text-lg md:text-xl mb-8 text-gray-300 max-w-xl">
              Browse our marketplace to find authentic accounts for gaming, work, social, and more.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup">
                <Button className="bg-saas-orange hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-3">
                <img src="/images/person-1.PNG" 
                  className="w-10 h-10 rounded-full border-2 border-saas-black" alt="User" />
                <img src="/images/person-2.PNG" 
                  className="w-10 h-10 rounded-full border-2 border-saas-black" alt="User" />
                <img src="/images/person-3.PNG" 
                  className="w-10 h-10 rounded-full border-2 border-saas-black" alt="User" />
              </div>
              <p className="text-sm text-gray-300">
                <span className="font-semibold text-saas-orange">500+</span> businesses already using Acctthrive
              </p>
            </div>
          </div>
          
          {/* Right side - Hero Image */}
          <div className="hidden lg:flex items-start justify-center">
            <img 
              src="/images/hero-image.png"
              alt="Acctthrive Marketplace Hero"
              className="w-4/5 h-auto rounded-lg"
            />
          </div>
        </div>
      </div>
      
      {/* Abstract shapes */}
      <div className="absolute bottom-10 left-10 w-20 h-20 border border-saas-orange/20 rounded-full"></div>
      <div className="absolute top-20 right-10 w-10 h-10 border border-saas-orange/20 rounded-full"></div>
      <div className="absolute top-40 left-20 w-5 h-5 bg-saas-orange/20 rounded-full"></div>
    </div>
  );
};

export default HeroSection;
