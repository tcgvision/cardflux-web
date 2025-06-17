'use client'

import { Navbar } from "./navbar";
import { usePathname } from "next/navigation";

export function NavbarWrapper() {
  const pathname = usePathname();
  const isDashboardRoute = pathname?.startsWith("/dashboard") ?? false;
  
  if (isDashboardRoute) {
    return null;
  }
  
  return <Navbar />;
}
