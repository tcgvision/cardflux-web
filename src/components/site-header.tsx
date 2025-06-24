"use client"

import { useOrganization } from "@clerk/nextjs"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import { SidebarTrigger } from "~/components/ui/sidebar"
import { usePathname } from "next/navigation"

export function SiteHeader() {
  const { organization } = useOrganization()
  const pathname = usePathname()

  const getPageTitle = () => {
    const path = pathname.split('/').pop()
    switch (path) {
      case 'dashboard':
        return 'Dashboard'
      case 'scanner':
        return 'Card Scanner'
      case 'inventory':
        return 'Inventory'
      case 'customers':
        return 'Customers'
      case 'transactions':
        return 'Transactions'
      case 'buylists':
        return 'Buylists'
      case 'analytics':
        return 'Analytics'
      case 'settings':
        return 'Settings'
      default:
        return 'Dashboard'
    }
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{getPageTitle()}</h1>
        {organization && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">/</span>
            <span className="text-sm font-medium">{organization.name}</span>
          </div>
        )}
      </div>
    </header>
  )
}
