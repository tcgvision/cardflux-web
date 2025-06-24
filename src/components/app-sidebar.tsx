"use client"

import * as React from "react"
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
} from "@tabler/icons-react"
import { useOrganization } from "@clerk/nextjs"

import { NavDocuments } from "~/components/nav-documents"
import { NavMain } from "~/components/nav-main"
import { NavSecondary } from "~/components/nav-secondary"
import { NavUser } from "~/components/nav-user"
import { ThemeToggle } from "~/app/_components/theme-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"

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
    {
      title: "Theme",
      url: "#",
      icon: null,
      customComponent: <ThemeToggle />,
    },
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { organization, isLoaded } = useOrganization()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  {isLoaded && organization ? organization.name : "TCG Vision"}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
