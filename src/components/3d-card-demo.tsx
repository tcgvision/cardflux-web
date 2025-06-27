"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "~/components/ui/3d-card";
import Image from "next/image";

interface ThreeDCardProps {
  imageSrc: string;
  alt: string;
  className?: string;
}

export function ThreeDCard({ imageSrc, alt, className }: ThreeDCardProps) {
  return (
    <CardContainer className={className}>
      <CardBody className="bg-transparent relative w-auto h-auto rounded-xl border-0 p-0">
        <CardItem translateZ="20" className="w-full relative group">
          {/* Subtle holographic shine overlay */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" 
               style={{
                 background: `
                   linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%),
                   linear-gradient(135deg, transparent 20%, rgba(255,255,255,0.2) 40%, transparent 60%)
                 `,
                 animation: 'holographic-shift 3s ease-in-out infinite'
               }}
          />
          
          <Image
            src={imageSrc}
            alt={alt}
            width={280}
            height={420}
            className="w-full h-auto object-cover rounded-xl shadow-lg relative z-0"
            priority={false}
            quality={90}
          />
          
          {/* Shining light effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-15"
               style={{
                 transform: 'translateX(-100%)',
                 animation: 'holographic-shine 2s ease-in-out infinite'
               }}
          />
        </CardItem>
      </CardBody>
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes holographic-shift {
          0%, 100% { 
            background-position: 0% 50%;
          }
          25% { 
            background-position: 100% 50%;
          }
          50% { 
            background-position: 50% 100%;
          }
          75% { 
            background-position: 50% 0%;
          }
        }
        
        @keyframes holographic-shine {
          0% { 
            transform: translateX(-100%) skewX(-15deg);
          }
          50% { 
            transform: translateX(200%) skewX(-15deg);
          }
          100% { 
            transform: translateX(-100%) skewX(-15deg);
          }
        }
      `}</style>
    </CardContainer>
  );
} 