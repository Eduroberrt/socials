import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const AboutUsSection = () => {
  return (
    <div className="bg-gradient-to-b from-saas-black to-saas-darkGray py-12 md:py-16">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative">
            <img 
              src="/images/about-us.PNG"
              alt="About Acctthrive"
              className="w-full h-auto rounded-xl"
              onError={(e) => {
                // Fallback to placeholder if image doesn't exist
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-saas-orange/10 to-transparent rounded-xl"></div>
          </div>
          
          {/* Content */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                About <span className="gradient-text">Acctthrive</span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                At Acctthrive we champion community-powered commerce. Discover a wide variety of accounts; ranging from gaming and streaming to professional and social media offered by individual sellers just like you. Our platform connects you directly with people who are committed to offering genuine, high-quality accounts tailored to your needs.
              </p>
            </div>
            
            <div className="pt-4">
              <Link to="/signup">
                <Button className="bg-saas-orange hover:bg-orange-600 text-white font-semibold py-3 px-8 text-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsSection;