import { useEffect, useRef, useState } from 'react';

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Better defaults for scroll timing
  const { threshold = 0.15, rootMargin = '0px 0px -100px 0px' } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only trigger animation when entering viewport, not when leaving
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, isVisible]);

  return { elementRef, isVisible };
};

// Helper component for easy scroll animations
export const ScrollReveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
}> = ({ children, className = '', delay = 0, direction = 'up' }) => {
  const { elementRef, isVisible } = useScrollReveal();
  
  const animationClass = {
    up: 'scroll-animate',
    down: 'scroll-animate',
    left: 'scroll-animate-left', 
    right: 'scroll-animate-right',
    scale: 'scroll-animate-scale'
  };

  return (
    <div
      ref={elementRef}
      className={`${animationClass[direction]} ${isVisible ? 'animate-in' : ''} ${className}`}
      style={{ 
        transitionDelay: isVisible ? `${delay}ms` : '0ms',
        willChange: 'transform, opacity' // Optimize for animations
      }}
    >
      {children}
    </div>
  );
};