"use client";

import { useParallax } from "~/hooks/use-parallax";
import { motion } from "motion/react";
import { useMemo, useEffect, useState, useRef, memo } from "react";
import Image from "next/image";

interface CardBackgroundProps {
  className?: string;
  layer1Count?: number;
  layer2Count?: number;
  layer3Count?: number;
  maxCardsPerLayer?: number;
}

interface CardPosition {
  x: number;
  y: number;
  rotation: number;
}

interface OptimizedCard extends CardPosition {
  layer: number;
  image: string;
  key: string;
  size: { width: number; height: number };
  className: string;
  priority: boolean;
}

const cardImages = [
  "/hero-images/EB01-012.avif",
  "/hero-images/OP05-119(alt).avif",
  "/hero-images/mtg_card_01.avif",
  "/hero-images/mtg_card_02.avif",
  "/hero-images/pikachu-base-set.avif",
  "/hero-images/poke_card_01.avif",
] as const;

// Layer configurations for better organization
const LAYER_CONFIG = {
  1: {
    baseSize: { width: 80, height: 112 },
    className: "w-12 h-18 sm:w-16 sm:h-24 md:w-20 md:h-28",
    opacity: "opacity-40 dark:opacity-[0.25]",
    parallaxSpeed: 0.2,
  },
  2: {
    baseSize: { width: 64, height: 96 },
    className: "w-10 h-15 sm:w-12 sm:h-18 md:w-16 md:h-24",
    opacity: "opacity-40 dark:opacity-[0.25]",
    parallaxSpeed: 0.3,
  },
  3: {
    baseSize: { width: 96, height: 144 },
    className: "w-14 h-21 sm:w-18 sm:h-27 md:w-24 md:h-32",
    opacity: "opacity-40 dark:opacity-[0.25]",
    parallaxSpeed: 0.4,
  },
} as const;

// Optimized seeded random with better distribution
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }
}

// NEW: Cross-layer collision detection function
const generateNonOverlappingPositions = (
  counts: { layer1: number; layer2: number; layer3: number },
  maxCards: number,
  seed = 1
): Record<string, CardPosition[]> => {
  const allPositions: CardPosition[] = [];
  const layerPositions: Record<string, CardPosition[]> = {
    layer1: [],
    layer2: [],
    layer3: [],
  };
  
  const rng = new SeededRandom(seed);
  const minDistance = 18; // Minimum distance between any two cards across all layers
  const maxAttempts = 100;
  
  // Process layers in order of priority (layer 1 first, then 2, then 3)
  const layerConfigs = [
    { key: 'layer1', count: Math.min(counts.layer1, maxCards), layer: 1 },
    { key: 'layer2', count: Math.min(counts.layer2, maxCards), layer: 2 },
    { key: 'layer3', count: Math.min(counts.layer3, maxCards), layer: 3 },
  ];
  
  for (const { key, count, layer } of layerConfigs) {
    for (let i = 0; i < count; i++) {
      let bestPosition: CardPosition | null = null;
      let maxMinDistance = 0;
      
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Generate candidate position with layer-specific offset
        const layerOffset = (layer - 1) * 1.5; // Reduced offset since we're preventing overlap
        const candidate: CardPosition = {
          x: 8 + rng.next() * 84 + layerOffset, // 8% to 92% + small layer offset
          y: 8 + rng.next() * 84 + layerOffset,
          rotation: rng.next() * 360,
        };
        
        // Ensure bounds
        candidate.x = Math.max(5, Math.min(95, candidate.x));
        candidate.y = Math.max(5, Math.min(95, candidate.y));
        
        // Check distance from ALL existing cards across ALL layers
        let minDistanceToAny = Infinity;
        
        if (allPositions.length > 0) {
          minDistanceToAny = Math.min(
            ...allPositions.map(pos => 
              Math.sqrt((candidate.x - pos.x) ** 2 + (candidate.y - pos.y) ** 2)
            )
          );
        }
        
        // If this is the best position so far, save it
        if (minDistanceToAny > maxMinDistance) {
          maxMinDistance = minDistanceToAny;
          bestPosition = candidate;
        }
        
        // If we found a position with sufficient distance, use it
        if (minDistanceToAny >= minDistance) {
          break;
        }
      }
      
      // Use the best position found (even if not ideal)
      if (bestPosition) {
        allPositions.push(bestPosition);
        layerPositions[key]!.push(bestPosition);
      } else {
        // Fallback: place card in a safe area with some randomization
        const fallbackPosition: CardPosition = {
          x: 10 + (i * 8) % 80 + rng.next() * 5,
          y: 10 + (Math.floor(i / 10) * 15) % 70 + rng.next() * 5,
          rotation: rng.next() * 360,
        };
        
        allPositions.push(fallbackPosition);
        layerPositions[key]!.push(fallbackPosition);
      }
    }
  }
  
  return layerPositions;
};

// UPDATED: Cached position generation function
const generateOptimizedPositions = (() => {
  const cache = new Map<string, Record<string, CardPosition[]>>();
  
  return (
    layer1Count: number,
    layer2Count: number, 
    layer3Count: number,
    maxCards = 20, 
    seed = 1
  ): Record<string, CardPosition[]> => {
    const cacheKey = `${layer1Count}-${layer2Count}-${layer3Count}-${maxCards}-${seed}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)!;
    }

    const positions = generateNonOverlappingPositions(
      { layer1: layer1Count, layer2: layer2Count, layer3: layer3Count },
      maxCards,
      seed
    );
    
    cache.set(cacheKey, positions);
    return positions;
  };
})();

// Optimized card assignment with pre-computed properties
const createOptimizedCards = (
  positions: Record<string, CardPosition[]>,
  isMobile: boolean
): OptimizedCard[] => {
  const allCards: OptimizedCard[] = [];
  const rng = new SeededRandom(42);
  const shuffledImages = [...cardImages].sort(() => rng.next() - 0.5);
  
  const totalCards = Object.values(positions).reduce((sum, pos) => sum + pos.length, 0);
  const mobileReduction = isMobile ? 0.6 : 1;
  const effectiveTotal = Math.floor(totalCards * mobileReduction);
  
  // Create extended image array
  const availableImages: string[] = [];
  while (availableImages.length < effectiveTotal) {
    availableImages.push(...shuffledImages);
  }
  
  let imageIndex = 0;
  let cardCount = 0;
  
  // Process each layer
  for (const [layerKey, layerPositions] of Object.entries(positions)) {
    const layer = parseInt(layerKey.replace('layer', '')) as 1 | 2 | 3;
    const config = LAYER_CONFIG[layer];
    
    for (let i = 0; i < layerPositions.length && cardCount < effectiveTotal; i++) {
      const pos = layerPositions[i]!;
      const image = availableImages[imageIndex]!;
      
      allCards.push({
        ...pos,
        layer,
        image,
        key: `${layerKey}-${i}`,
        size: config.baseSize,
        className: `${config.className} ${config.opacity} blur-[0.5px] dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]`,
        priority: cardCount < 6, // Prioritize first few cards
      });
      
      imageIndex++;
      cardCount++;
    }
  }
  
  return allCards;
};

// Memoized card component to prevent unnecessary re-renders
const MemoizedCard = memo(({ 
  card, 
  prefersReducedMotion, 
  index 
}: { 
  card: OptimizedCard; 
  prefersReducedMotion: boolean; 
  index: number;
}) => (
  <motion.div
    className="absolute"
    style={{
      left: `${card.x}%`,
      top: `${card.y}%`,
      transform: `translate(-50%, -50%) rotate(${card.rotation}deg)`,
      willChange: 'transform',
    }}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ 
      delay: prefersReducedMotion ? 0 : index * 0.05, // Reduced delay
      duration: prefersReducedMotion ? 0.2 : 0.6,
      ease: "easeOut"
    }}
  >
    <Image
      src={card.image}
      alt=""
      width={card.size.width}
      height={card.size.height}
      className={card.className}
      style={{ 
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
      priority={card.priority}
      quality={60} // Reduced quality for background elements
      sizes="(max-width: 640px) 48px, (max-width: 768px) 64px, 80px"
      loading={card.priority ? "eager" : "lazy"}
    />
  </motion.div>
));

MemoizedCard.displayName = 'MemoizedCard';

// Memoized layer component
const ParallaxLayer = memo(({ 
  cards, 
  parallaxValue, 
  prefersReducedMotion, 
  isMobile 
}: {
  cards: OptimizedCard[];
  parallaxValue: number;
  prefersReducedMotion: boolean;
  isMobile: boolean;
}) => (
  <div 
    className="absolute inset-0"
    style={{ 
      transform: isMobile || prefersReducedMotion 
        ? 'none' 
        : `translate3d(0, ${parallaxValue}px, 0)`,
      willChange: 'transform',
    }}
  >
    {cards.map((card, index) => (
      <MemoizedCard
        key={card.key}
        card={card}
        prefersReducedMotion={prefersReducedMotion}
        index={index}
      />
    ))}
  </div>
));

ParallaxLayer.displayName = 'ParallaxLayer';

export function CardBackground({ 
  className = "", 
  layer1Count = 4, 
  layer2Count = 6, 
  layer3Count = 3,
  maxCardsPerLayer = 20 
}: CardBackgroundProps) {
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const mountedRef = useRef(true);

  // Optimized media query handling
  useEffect(() => {
    const handleResize = () => {
      if (!mountedRef.current) return;
      setIsMobile(window.innerWidth < 768);
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (!mountedRef.current) return;
      setPrefersReducedMotion(e.matches);
    };

    // Initial setup
    setIsClient(true);
    setIsMobile(window.innerWidth < 768);
    
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    // Add listeners with passive option for better performance
    window.addEventListener('resize', handleResize, { passive: true });
    motionQuery.addEventListener('change', handleMotionChange);

    // Preload images
    cardImages.forEach(src => {
      const img = new window.Image();
      img.src = src;
    });

    return () => {
      mountedRef.current = false;
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // Memoize parallax hooks
  const parallax1 = useParallax({ speed: LAYER_CONFIG[1].parallaxSpeed });
  const parallax2 = useParallax({ speed: LAYER_CONFIG[2].parallaxSpeed });
  const parallax3 = useParallax({ speed: LAYER_CONFIG[3].parallaxSpeed });

  // UPDATED: Generate all positions together to prevent overlap
  const cardPositions = useMemo(() => 
    generateOptimizedPositions(layer1Count, layer2Count, layer3Count, maxCardsPerLayer, 1),
    [layer1Count, layer2Count, layer3Count, maxCardsPerLayer]
  );

  // Memoize optimized cards
  const optimizedCards = useMemo(() => 
    createOptimizedCards(cardPositions, isMobile),
    [cardPositions, isMobile]
  );

  // Group cards by layer for efficient rendering
  const cardsByLayer = useMemo(() => ({
    1: optimizedCards.filter(card => card.layer === 1),
    2: optimizedCards.filter(card => card.layer === 2),
    3: optimizedCards.filter(card => card.layer === 3),
  }), [optimizedCards]);

  if (!isClient) {
    return <div className={`absolute inset-0 overflow-hidden ${className}`} />;
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <ParallaxLayer
        cards={cardsByLayer[1]}
        parallaxValue={parallax1}
        prefersReducedMotion={prefersReducedMotion}
        isMobile={isMobile}
      />
      <ParallaxLayer
        cards={cardsByLayer[2]}
        parallaxValue={parallax2}
        prefersReducedMotion={prefersReducedMotion}
        isMobile={isMobile}
      />
      <ParallaxLayer
        cards={cardsByLayer[3]}
        parallaxValue={parallax3}
        prefersReducedMotion={prefersReducedMotion}
        isMobile={isMobile}
      />
    </div>
  );
}