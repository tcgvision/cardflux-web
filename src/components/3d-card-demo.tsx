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
        <CardItem translateZ="20" className="w-full">
          <Image
            src={imageSrc}
            alt={alt}
            width={280}
            height={420}
            className="w-full h-auto object-cover rounded-xl shadow-lg"
            priority={false}
            quality={90}
          />
        </CardItem>
      </CardBody>
    </CardContainer>
  );
} 