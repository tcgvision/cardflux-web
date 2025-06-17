"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Menu } from "lucide-react";

const navigation = [
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight">TCG Vision</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
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
          {isLoaded && (
            <>
              {isSignedIn ? (
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
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
                  <Link href="/dashboard/sign-in">
                    <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/dashboard/sign-up">
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
                  <Link href="/dashboard" className="w-full">Dashboard</Link>
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/sign-in" className="w-full">Sign in</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/sign-up" className="w-full">Get Started</Link>
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