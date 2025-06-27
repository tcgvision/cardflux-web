"use client";

import { useMemo, useState } from "react";
import Image from "next/image";

interface LogoCarouselProps {
  className?: string;
  speed?: number; // pixels per second
  pauseOnHover?: boolean;
}

const logos = [
  {
    src: "/logos/logo_op.avif",
    srcDark: "/logos/op-white-logo.avif",
    alt: "One Piece TCG",
    width: 140,
    height: 70,
  },
  {
    src: "/logos/mtg_logo.avif",
    srcDark: "/logos/mtg_logo.avif",
    alt: "Magic: The Gathering",
    width: 120,
    height: 60,
  },
  {
    src: "/logos/Pokémon_Trading_Card_Game_logo.svg.avif",
    srcDark: "/logos/Pokémon_Trading_Card_Game_logo.svg.avif",
    alt: "Pokemon Trading Card Game",
    width: 120,
    height: 60,
  },
];

export function LogoCarousel({ 
  className = "", 
  speed = 30, 
  pauseOnHover = true 
}: LogoCarouselProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = useMemo(() => {
    return [...logos, ...logos, ...logos]; // Triple the logos for smooth looping
  }, []);

  // Calculate animation duration based on speed
  const animationDuration = useMemo(() => {
    const totalWidth = logos.length * 200; // Approximate width per logo
    return totalWidth / speed;
  }, [speed]);

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => pauseOnHover && setIsHovered(true)}
      onMouseLeave={() => pauseOnHover && setIsHovered(false)}
    >
      {/* Gradient overlays for smooth fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      {/* Carousel container */}
      <div
        className="flex items-center gap-8 py-4"
        style={{
          animation: `scroll ${animationDuration}s linear infinite`,
          animationPlayState: isHovered ? "paused" : "running",
        }}
      >
        {duplicatedLogos.map((logo, index) => (
          <div
            key={`${logo.alt}-${index}`}
            className="flex-shrink-0 group hover:scale-105 transition-transform duration-200"
          >
            <div className="relative">
              {/* Light mode image */}
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className="h-12 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 ease-in-out dark:hidden"
                priority={index < 3} // Only prioritize first 3 logos
                quality={85}
                sizes="(max-width: 640px) 80px, 120px"
              />
              {/* Dark mode image */}
              <Image
                src={logo.srcDark}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className="h-12 w-auto object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 ease-in-out hidden dark:block"
                priority={index < 3} // Only prioritize first 3 logos
                quality={85}
                sizes="(max-width: 640px) 80px, 120px"
              />
            </div>
          </div>
        ))}
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-${logos.length * 200}px);
          }
        }
      `}</style>
    </div>
  );
} 