import React from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import AboutUsSection from '@/components/AboutUsSection';
import MarketplaceFeaturesSection from '@/components/MarketplaceFeaturesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CtaSection from '@/components/CtaSection';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-saas-black text-white">
      <Navbar />
      <main>
        <div id="hero">
          <HeroSection />
        </div>
        <AboutUsSection />

        <div id="features">
          <FeaturesSection />
        </div>
        <div id="marketplace">
          <MarketplaceFeaturesSection />
        </div>
        <div id="how-it-works">
          <HowItWorksSection />
        </div>
        <div id="testimonials">
          <TestimonialsSection />
        </div>
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
