import React from 'react';

const steps = [
  {
    number: '1',
    title: 'Discover',
    description: 'Browse our marketplace to uncover one-of-a-kind products. With smart search and filters, finding exactly what you want is simple and seamless.'
  },
  {
    number: '2',
    title: 'Connect',
    description: 'Reach out to sellers directly—ask questions, explore custom options, and build real connections. Our platform encourages open, authentic interaction.'
  },
  {
    number: '3',
    title: 'Checkout Securely',
    description: 'When you\'re ready to buy, our secure checkout ensures your payment is protected. Shop with confidence knowing your transaction is safe.'
  },
  {
    number: '4',
    title: 'Receive & Enjoy',
    description: 'Relax while your order is on its way. Be part of a community that values authenticity and celebrates truly genuine products.'
  }
];

const HowItWorksSection = () => {
  return (
    <div className="bg-saas-black py-12 md:py-16">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-gray-400">
            Getting started with Acctthrive is simple. Follow these four easy steps to begin your marketplace journey.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Steps Content */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="flex gap-6"
              >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-saas-orange rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {step.number}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-white">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{step.description}</p>
                  </div>
                </div>
            ))}
          </div>
          
          {/* Image */}
          <div className="lg:order-last animate-fade-in" style={{animationDelay: '0.4s'}}>
            <div className="relative">
              <img 
                src="/images/how-it-works.PNG"
                alt="How Acctthrive Works"
                className="w-full h-auto rounded-xl"
                onError={(e) => {
                  // Fallback to placeholder if image doesn't exist
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-saas-orange/10 to-transparent rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSection;