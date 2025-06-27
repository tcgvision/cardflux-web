"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileDescription,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconCreditCard,
  IconShoppingCart,
  IconReceipt,
  IconUsersGroup,
} from "@tabler/icons-react"

import { NavDocuments } from "~/components/nav-documents"
import { NavMain } from "~/components/nav-main"
import { NavSecondary } from "~/components/nav-secondary"
import { NavUser } from "~/components/nav-user"
import { ThemeToggle } from "~/app/_components/theme-toggle"
import { Logo } from "~/components/ui/logo"
import { useRolePermissions } from "~/hooks/use-role-permissions"
import { useUnifiedShop } from "~/hooks/use-unified-shop"
import { useSyncStatus } from "~/hooks/use-sync-status"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "~/components/ui/sidebar"
import { useLoading } from "~/components/loading-provider"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { shopName, isLoaded, hasShop, source, needsSync } = useUnifiedShop()
  const { needsSync: syncNeeded, syncReason } = useSyncStatus()
  const { isAdmin } = useRolePermissions()
  const pathname = usePathname()
  const router = useRouter()
  const { startLoading } = useLoading()

  const handleLogoClick = () => {
    // Start loading immediately for instant feedback
    startLoading()
    
    // Use setTimeout to ensure the loading state is set before navigation
    setTimeout(() => {
      router.push("/dashboard")
    }, 0)
  }

  const data = {
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: IconDashboard,
      },
      {
        title: "Scanner",
        url: "/dashboard/scanner",
        icon: IconCamera,
      },
      {
        title: "Inventory",
        url: "/dashboard/inventory",
        icon: IconDatabase,
      },
      {
        title: "Customers",
        url: "/dashboard/customers",
        icon: IconUsers,
      },
      {
        title: "Transactions",
        url: "/dashboard/transactions",
        icon: IconReceipt,
      },
      {
        title: "Buylists",
        url: "/dashboard/buylists",
        icon: IconShoppingCart,
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: IconChartBar,
      },
    ],
    navSecondary: [
      // Only show team management for admins
      ...(isAdmin ? [{
        title: "Team Management",
        url: "/dashboard/team",
        icon: IconUsersGroup,
      }] : []),
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: IconSettings,
      },
      {
        title: "Help",
        url: "/help",
        icon: IconHelp,
      },
      {
        title: "Search",
        url: "#",
        icon: IconSearch,
      },
    ],
    documents: [
      {
        name: "Reports",
        url: "/dashboard/reports",
        icon: IconReport,
      },
      {
        name: "Documents",
        url: "/dashboard/documents",
        icon: IconFileDescription,
      },
      {
        name: "Store Credit",
        url: "/dashboard/store-credit",
        icon: IconCreditCard,
      },
    ],
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 transition-all duration-200 hover:bg-accent hover:text-accent-foreground active:scale-95 hover:cursor-pointer"
            >
              <button 
                onClick={handleLogoClick}
                className="flex items-center gap-3 w-full text-left"
              >
                <Logo width={24} height={24} />
                <span className="text-base font-semibold">
                  {isLoaded && hasShop ? shopName : "CardFlux"}
                </span>
                {syncNeeded && syncReason && (
                  <span className="text-xs text-orange-500 ml-1">
                    (needs sync)
                  </span>
                )}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} currentPath={pathname} />
        <NavDocuments items={data.documents} currentPath={pathname} />
        
        {/* Theme Toggle Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center justify-between w-full px-3 py-2 rounded-md transition-all duration-200 hover:bg-accent hover:text-accent-foreground">
                  <span>Theme</span>
                  <ThemeToggle />
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <NavSecondary items={data.navSecondary} currentPath={pathname} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
