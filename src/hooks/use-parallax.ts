import { useEffect, useState, useCallback, useRef } from 'react';

interface ParallaxOptions {
  speed?: number;
  throttleMs?: number;
}

export function useParallax(options: ParallaxOptions = {}) {
  const { speed = 0.5, throttleMs = 16 } = options; // 16ms = ~60fps
  const [offset, setOffset] = useState(0);
  const ticking = useRef(false);
  const lastScrollY = useRef(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.pageYOffset;
    
    // Only update if scroll position actually changed
    if (currentScrollY !== lastScrollY.current) {
      lastScrollY.current = currentScrollY;
      setOffset(currentScrollY * speed);
    }
  }, [speed]);

  useEffect(() => {
    const throttledScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    // Use passive listener for better performance
    window.addEventListener('scroll', throttledScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [handleScroll]);

  return offset;
} 