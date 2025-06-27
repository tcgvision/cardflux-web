"use client";

import { useParallax } from "~/hooks/use-parallax";
import { motion } from "motion/react";
import { useMemo, useEffect, useState } from "react";
import Image from "next/image";

/**
 * CardBackground Component
 * 
 * A scalable parallax card background that works with any number of cards.
 * 
 * Usage examples:
 * 
 * // Default: 4, 6, 3 cards per layer
 * <CardBackground />
 * 
 * // Custom card counts
 * <CardBackground 
 *   layer1Count={8} 
 *   layer2Count={12} 
 *   layer3Count={6} 
 * />
 * 
 * // Limit maximum cards per layer for performance
 * <CardBackground 
 *   layer1Count={50} 
 *   layer2Count={30} 
 *   layer3Count={20}
 *   maxCardsPerLayer={15}
 * />
 * 
 * The component automatically:
 * - Uses different positioning strategies based on card count
 * - Prevents card overlap with distance-based algorithms
 * - Limits cards per layer to prevent performance issues
 * - Ensures unique card images are used across all layers
 * - Provides smooth parallax effects with hardware acceleration
 */

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

interface CardAssignment extends CardPosition {
  layer: number;
  image: string;
  key: string;
}

const cardImages = [
  "/hero-images/EB01-012.avif",
  "/hero-images/OP05-119(alt).avif",
  "/hero-images/mtg_card_01.avif",
  "/hero-images/mtg_card_02.avif",
  "/hero-images/pikachu-base-set.avif",
  "/hero-images/poke_card_01.avif",
];

// Performance optimization: Preload images using native Image constructor
const preloadImages = () => {
  cardImages.forEach(src => {
    const img = new window.Image();
    img.src = src;
  });
};

// Preload images when component is first imported
if (typeof window !== 'undefined') {
  preloadImages();
}

// Deterministic random number generator using a seed
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// Generate non-overlapping card positions using a more robust approach
const generateCardPositions = (count: number, layer: number, maxCards = 20, seed = 1): CardPosition[] => {
  const positions: CardPosition[] = [];
  const rng = new SeededRandom(seed + layer * 1000);
  
  // Limit the number of cards to prevent performance issues
  const actualCount = Math.min(count, maxCards);
  
  // Use different positioning strategies based on card count
  if (actualCount <= 8) {
    // For small numbers, use a simple grid approach
    const gridSize = Math.ceil(Math.sqrt(actualCount * 1.5));
    const cellSize = 100 / gridSize;
    
    const grid: boolean[][] = [];
    for (let i = 0; i < gridSize; i++) {
      grid[i] = Array(gridSize).fill(true) as boolean[];
    }
    
    for (let i = 0; i < actualCount; i++) {
      let attempts = 0;
      let x = 0;
      let y = 0;
      let positionFound = false;
      
      while (attempts < 100 && !positionFound) {
        const gridX = Math.floor(rng.next() * gridSize);
        const gridY = Math.floor(rng.next() * gridSize);
        
        if (grid[gridY]?.[gridX]) {
          x = (gridX * cellSize) + (rng.next() * cellSize * 0.6) + (cellSize * 0.2);
          y = (gridY * cellSize) + (rng.next() * cellSize * 0.6) + (cellSize * 0.2);
          grid[gridY]![gridX] = false;
          positionFound = true;
        }
        attempts++;
      }
      
      if (!positionFound) {
        // Fallback positioning
        x = 10 + (i * 20) + (rng.next() * 15);
        y = 10 + (i * 15) + (rng.next() * 15);
      }
      
      // Add layer-specific offset
      const layerOffset = (layer - 1) * 3;
      x += layerOffset;
      y += layerOffset;
      
      // Ensure bounds
      x = Math.max(5, Math.min(95, x));
      y = Math.max(5, Math.min(95, y));
      
      positions.push({ 
        x, 
        y, 
        rotation: rng.next() * 360 
      });
    }
  } else {
    // For larger numbers, use a more sophisticated approach
    const minDistance = 15; // Minimum distance between cards
    
    for (let i = 0; i < actualCount; i++) {
      let x = 0;
      let y = 0;
      let validPosition = false;
      let attempts = 0;
      
      while (!validPosition && attempts < 200) {
        x = 5 + rng.next() * 90;
        y = 5 + rng.next() * 90;
        
        // Check distance from existing cards
        validPosition = true;
        for (const pos of positions) {
          const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
          if (distance < minDistance) {
            validPosition = false;
            break;
          }
        }
        attempts++;
      }
      
      // Add layer-specific offset
      const layerOffset = (layer - 1) * 2;
      x += layerOffset;
      y += layerOffset;
      
      // Ensure bounds
      x = Math.max(5, Math.min(95, x));
      y = Math.max(5, Math.min(95, y));
      
      positions.push({ 
        x, 
        y, 
        rotation: rng.next() * 360 
      });
    }
  }
  
  return positions;
};

export function CardBackground({ 
  className, 
  layer1Count = 4, 
  layer2Count = 6, 
  layer3Count = 3,
  maxCardsPerLayer = 20 
}: CardBackgroundProps) {
  const [isClient, setIsClient] = useState(false);
  
  // Ensure component only renders on client to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const parallax1 = useParallax({ speed: 0.2 });
  const parallax2 = useParallax({ speed: 0.3 });
  const parallax3 = useParallax({ speed: 0.4 });

  // Performance optimization: Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  }, []);

  // Memoize card positions to prevent recalculation on every render
  const cardPositions = useMemo(() => ({
    layer1: generateCardPositions(layer1Count, 1, maxCardsPerLayer, 1),
    layer2: generateCardPositions(layer2Count, 2, maxCardsPerLayer, 2),
    layer3: generateCardPositions(layer3Count, 3, maxCardsPerLayer, 3),
  }), [layer1Count, layer2Count, layer3Count, maxCardsPerLayer]);

  // Memoize card assignments to ensure unique images
  const cardAssignments = useMemo((): CardAssignment[] => {
    const allCards: CardAssignment[] = [];
    
    // Create a deterministic shuffled array of available images
    const rng = new SeededRandom(42); // Fixed seed for consistent shuffling
    const shuffledImages = [...cardImages].sort(() => rng.next() - 0.5);
    
    // Calculate total cards needed
    const totalCards = cardPositions.layer1.length + cardPositions.layer2.length + cardPositions.layer3.length;
    
    // Ensure we have enough images, repeat if necessary
    const availableImages: string[] = [];
    while (availableImages.length < totalCards) {
      availableImages.push(...shuffledImages);
    }
    
    let imageIndex = 0;
    
    // Layer 1 cards
    cardPositions.layer1.forEach((pos, index) => {
      const image = availableImages[imageIndex];
      if (image && image.trim() !== '') {
        allCards.push({
          ...pos,
          layer: 1,
          image,
          key: `layer1-${index}`,
        });
        imageIndex++;
      }
    });
    
    // Layer 2 cards
    cardPositions.layer2.forEach((pos, index) => {
      const image = availableImages[imageIndex];
      if (image && image.trim() !== '') {
        allCards.push({
          ...pos,
          layer: 2,
          image,
          key: `layer2-${index}`,
        });
        imageIndex++;
      }
    });
    
    // Layer 3 cards
    cardPositions.layer3.forEach((pos, index) => {
      const image = availableImages[imageIndex];
      if (image && image.trim() !== '') {
        allCards.push({
          ...pos,
          layer: 3,
          image,
          key: `layer3-${index}`,
        });
        imageIndex++;
      }
    });
    
    return allCards;
  }, [cardPositions]);

  // Performance optimization: Reduce card count on mobile devices
  const isMobile = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  }, []);

  // Adjust card counts for mobile performance
  const effectiveCardAssignments = useMemo(() => {
    if (isMobile) {
      // Reduce card count on mobile for better performance
      return cardAssignments.slice(0, Math.floor(cardAssignments.length * 0.6));
    }
    return cardAssignments;
  }, [cardAssignments, isMobile]);

  // Don't render anything until client-side to prevent hydration mismatch
  if (!isClient) {
    return <div className={`absolute inset-0 overflow-hidden ${className}`} />;
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Layer 1 - Slowest parallax */}
      <div 
        className="absolute inset-0"
        style={{ 
          transform: isMobile || prefersReducedMotion 
            ? 'none' 
            : `translateY(${parallax1}px)` 
        }}
      >
        {effectiveCardAssignments
          .filter(card => card.layer === 1 && card.image && card.image.trim() !== '')
          .map((card) => (
            <motion.div
              key={card.key}
              className="absolute"
              style={{
                left: `${card.x}%`,
                top: `${card.y}%`,
                transform: `translate(-50%, -50%) rotate(${card.rotation}deg)`,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: prefersReducedMotion ? 0 : (card.key.split('-')[1] ? parseInt(card.key.split('-')[1]!) * 0.1 : 0), 
                duration: prefersReducedMotion ? 0.3 : 0.8 
              }}
            >
              <Image
                src={card.image}
                alt=""
                width={80}
                height={112}
                className="w-12 h-18 sm:w-16 sm:h-24 md:w-20 md:h-28 opacity-15 dark:opacity-[0.08] blur-[0.5px]"
                style={{ 
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                }}
                priority={false}
                quality={75}
                sizes="(max-width: 640px) 48px, (max-width: 768px) 64px, 80px"
              />
            </motion.div>
          ))}
      </div>

      {/* Layer 2 - Medium parallax */}
      <div 
        className="absolute inset-0"
        style={{ 
          transform: isMobile || prefersReducedMotion 
            ? 'none' 
            : `translateY(${parallax2}px)` 
        }}
      >
        {effectiveCardAssignments
          .filter(card => card.layer === 2 && card.image && card.image.trim() !== '')
          .map((card) => (
            <motion.div
              key={card.key}
              className="absolute"
              style={{
                left: `${card.x}%`,
                top: `${card.y}%`,
                transform: `translate(-50%, -50%) rotate(${card.rotation}deg)`,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: prefersReducedMotion ? 0 : (card.key.split('-')[1] ? parseInt(card.key.split('-')[1]!) * 0.1 : 0), 
                duration: prefersReducedMotion ? 0.3 : 0.8 
              }}
            >
              <Image
                src={card.image}
                alt=""
                width={64}
                height={96}
                className="w-10 h-15 sm:w-12 sm:h-18 md:w-16 md:h-24 opacity-15 dark:opacity-[0.08] blur-[0.5px]"
                style={{ 
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                }}
                priority={false}
                quality={75}
                sizes="(max-width: 640px) 40px, (max-width: 768px) 48px, 64px"
              />
            </motion.div>
          ))}
      </div>

      {/* Layer 3 - Fastest parallax */}
      <div 
        className="absolute inset-0"
        style={{ 
          transform: isMobile || prefersReducedMotion 
            ? 'none' 
            : `translateY(${parallax3}px)` 
        }}
      >
        {effectiveCardAssignments
          .filter(card => card.layer === 3 && card.image && card.image.trim() !== '')
          .map((card) => (
            <motion.div
              key={card.key}
              className="absolute"
              style={{
                left: `${card.x}%`,
                top: `${card.y}%`,
                transform: `translate(-50%, -50%) rotate(${card.rotation}deg)`,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: prefersReducedMotion ? 0 : (card.key.split('-')[1] ? parseInt(card.key.split('-')[1]!) * 0.1 : 0), 
                duration: prefersReducedMotion ? 0.3 : 0.8 
              }}
            >
              <Image
                src={card.image}
                alt=""
                width={96}
                height={144}
                className="w-14 h-21 sm:w-18 sm:h-27 md:w-24 md:h-32 opacity-15 dark:opacity-[0.08] blur-[0.5px]"
                style={{ 
                  willChange: 'transform',
                  transform: 'translateZ(0)',
                }}
                priority={false}
                quality={75}
                sizes="(max-width: 640px) 56px, (max-width: 768px) 72px, 96px"
              />
            </motion.div>
          ))}
      </div>
    </div>
  );
} 