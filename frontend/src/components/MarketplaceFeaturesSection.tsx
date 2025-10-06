import React from 'react';

const marketplaceFeatures = [
  {
    image: '/images/download-1.png',
    title: 'Unique Finds',
    description: 'Discover a handpicked selection of standout accounts that showcase the originality and skill of our vibrant seller community.'
  },
  {
    image: '/images/download-2.png',
    title: 'Safe & Secure',
    description: 'Shop confidently knowing your transactions are protected. Our platform ensures a safe space for both buyers and sellers.'
  },
  {
    image: '/images/download-3.png',
    title: 'Talk to Sellers',
    description: 'Message sellers directly to ask questions or get advice. Enjoy a more personal and engaging buying experience.'
  },
  {
    image: '/images/download-4.png',
    title: 'Trusted Feedback',
    description: 'Check reviews and ratings from other buyers before you shop. Share your thoughts to help others in the community.'
  }
];

const MarketplaceFeaturesSection = () => {
  return (
    <div className="bg-gradient-to-b from-saas-darkGray to-saas-black py-12 md:py-16">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Experience the <span className="gradient-text">Acctthrive</span> Difference
          </h2>
          <p className="text-gray-400">
            Discover what makes our marketplace the perfect place to buy and sell quality social media accounts.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {marketplaceFeatures.map((feature, index) => (
            <div 
              key={index}
              className="bg-saas-black rounded-xl overflow-hidden border border-saas-orange card-shadow"
            >
                <div className="aspect-square relative overflow-hidden h-72 flex items-center justify-center">
                  <img 
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      // Fallback to placeholder if image doesn't exist
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-saas-black/60 to-transparent"></div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceFeaturesSection;