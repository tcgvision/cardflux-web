"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { Logo } from "~/components/ui/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Menu, Settings, Store, BarChart3, Users } from "lucide-react";
import { useRolePermissions } from "~/hooks/use-role-permissions";
import { useUnifiedShop } from "~/hooks/use-unified-shop";

export function DashboardNavbar() {
  const pathname = usePathname();
  const { shopName } = useUnifiedShop();
  const { isAdmin } = useRolePermissions();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Inventory", href: "/dashboard/inventory", icon: Store },
    // Only show team link for admins
    ...(isAdmin ? [{ name: "Team", href: "/dashboard/team", icon: Users }] : []),
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Organization Name */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <Logo width={28} height={28} priority />
            <span className="text-xl font-bold tracking-tight">CardFlux</span>
          </Link>
          {shopName && (
            <div className="hidden md:block">
              <span className="text-sm text-muted-foreground">/</span>
              <span className="ml-2 text-sm font-medium">{shopName}</span>
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href
                    ? "text-foreground"
                    : "text-foreground/60"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-4">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />

          {/* Mobile Navigation */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem key={item.name} asChild>
                    <Link
                      href={item.href}
                      className={`flex w-full items-center gap-2 ${
                        pathname === item.href
                          ? "text-foreground"
                          : "text-foreground/60"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
} 