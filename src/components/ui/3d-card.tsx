"use client";

import React, { createContext, useContext, useRef, useState } from "react";
import { cn } from "~/lib/utils";

const MouseEnterContext = createContext<{
  mouseX: number;
  mouseY: number;
  setMouseX: React.Dispatch<React.SetStateAction<number>>;
  setMouseY: React.Dispatch<React.SetStateAction<number>>;
  isHovered: boolean;
}>({
  mouseX: 0,
  mouseY: 0,
  setMouseX: () => {},
  setMouseY: () => {},
  isHovered: false,
});

export const CardContainer = ({
  children,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMouseX(event.clientX - rect.left);
      setMouseY(event.clientY - rect.top);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMouseX(0);
    setMouseY(0);
  };

  return (
    <MouseEnterContext.Provider value={{ mouseX, mouseY, setMouseX, setMouseY, isHovered }}>
      <div
        className={cn("flex items-center justify-center", containerClassName)}
        style={{
          perspective: "1000px",
        }}
      >
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn("flex items-center justify-center relative", className)}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
};

export const CardBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { mouseX, mouseY, isHovered } = useContext(MouseEnterContext);
  const ref = useRef<HTMLDivElement>(null);

  const rotateX = isHovered ? (mouseY / 10) - 5 : 0;
  const rotateY = isHovered ? (mouseX / 10) - 5 : 0;

  return (
    <div
      ref={ref}
      className={cn("rounded-xl", className)}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`,
        transition: "all 0.3s ease",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
};

export const CardItem = ({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  ...props
}: {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
  [key: string]: unknown;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Tag
      ref={ref}
      className={cn("w-fit", className)}
      {...props}
      style={{
        transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px)`,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </Tag>
  );
}; 