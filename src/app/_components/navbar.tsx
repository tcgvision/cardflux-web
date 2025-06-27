"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { Logo } from "~/components/ui/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const navigation = [
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-3">
            <Logo width={32} height={32} priority />
            <span className="text-xl font-bold tracking-tight">CardFlux</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`hover:text-primary text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Auth Buttons & Mobile Menu */}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {isLoaded && (
            <>
              {isSignedIn ? (
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden sm:inline-flex"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8",
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/auth/sign-in">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden sm:inline-flex"
                    >
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/get-started">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Mobile Navigation */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {navigation.map((item) => (
                <DropdownMenuItem key={item.name} asChild>
                  <Link
                    href={item.href}
                    className={`w-full ${
                      pathname === item.href
                        ? "text-foreground"
                        : "text-foreground/60"
                    }`}
                  >
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              ))}
              {isSignedIn ? (
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="w-full">
                    Dashboard
                  </Link>
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/sign-in" className="w-full">
                      Sign in
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/get-started" className="w-full">
                      Get Started
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
