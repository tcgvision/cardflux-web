import Image from "next/image";
import { cn } from "~/lib/utils";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function Logo({ className, width = 32, height = 32, priority = false }: LogoProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Light mode logo */}
      <Image
        src="/LOGO.svg"
        alt="CardFlux"
        width={width}
        height={height}
        className="block dark:hidden"
        priority={priority}
      />
      {/* Dark mode logo - invert colors */}
      <Image
        src="/LOGO.svg"
        alt="CardFlux"
        width={width}
        height={height}
        className="hidden dark:block [filter:invert(1)]"
        priority={priority}
      />
    </div>
  );
} 