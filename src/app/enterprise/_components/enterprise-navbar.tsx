"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useOrganization } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Menu, Settings, Store, BarChart3, Users } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/enterprise", icon: BarChart3 },
  { name: "Inventory", href: "/enterprise/inventory", icon: Store },
  { name: "Team", href: "/enterprise/team", icon: Users },
  { name: "Settings", href: "/enterprise/settings", icon: Settings },
];

export function EnterpriseNavbar() {
  const pathname = usePathname();
  const { organization } = useOrganization();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Organization Name */}
        <div className="flex items-center gap-4">
          <Link href="/enterprise" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight">TCG Vision</span>
          </Link>
          {organization && (
            <div className="hidden md:block">
              <span className="text-sm text-muted-foreground">/</span>
              <span className="ml-2 text-sm font-medium">{organization.name}</span>
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