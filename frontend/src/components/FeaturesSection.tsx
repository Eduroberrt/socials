
import React from 'react';
import { Users, Heart, Sparkles } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';

const features = [
  {
    icon: <Users className="h-6 w-6 text-saas-orange" />,
    title: 'Community-Driven',
    description: 'We prioritize building a close-knit community of buyers and sellers who share a passion for unique and quality accounts.'
  },
  {
    icon: <Heart className="h-6 w-6 text-saas-orange" />,
    title: 'Support Small Sellers',
    description: 'Empower small businesses and independent sellers by buying directly from them. Every purchase supports entrepreneurs\' growth.'
  },
  {
    icon: <Sparkles className="h-6 w-6 text-saas-orange" />,
    title: 'Tailored Experience',
    description: 'Enjoy a personalized shopping journey by connecting directly with sellers and discovering carefully curated products.'
  }
];

const FeaturesSection = () => {
  return (
    <div className="bg-saas-black py-12 md:py-16">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="gradient-text">Acctthrive</span>?
          </h2>
          <p className="text-gray-400">
            Discover what makes our social media marketplace the perfect choice for 
            buying and selling quality accounts with confidence.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-saas-darkGray p-8 rounded-xl border border-saas-orange card-shadow text-center">
              <div className="bg-saas-orange/10 w-16 h-16 flex items-center justify-center rounded-lg mb-6 mx-auto">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
