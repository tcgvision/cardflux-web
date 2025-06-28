"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import { useNavigationLoading } from "~/hooks/use-navigation-loading"

export function NavSecondary({
  items,
  currentPath,
  onNavigate,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon
  }[]
  currentPath: string
  onNavigate?: (url: string) => void
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const router = useRouter()
  const { loadingItem, startLoading } = useNavigationLoading()

  const handleNavigation = async (url: string) => {
    if (url === "#") {
      // Handle search functionality
      return
    }
    
    startLoading(url)
    
    if (onNavigate) {
      onNavigate(url)
    } else {
      // Use setTimeout to ensure the loading state is visible
      setTimeout(() => {
        router.push(url)
      }, 100)
    }
  }

  const isActive = (url: string) => {
    if (url === "#") return false
    if (url === "/dashboard/settings") {
      return currentPath === "/dashboard/settings"
    }
    return currentPath.startsWith(url)
  }

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = isActive(item.url)
            const isLoading = loadingItem === item.url
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  onClick={() => handleNavigation(item.url)}
                  disabled={isLoading}
                  className={`
                    transition-all duration-200 ease-in-out
                    hover:bg-accent hover:text-accent-foreground 
                    active:scale-95 active:bg-accent/80
                    ${active 
                      ? 'bg-accent text-accent-foreground shadow-sm border-l-2 border-primary' 
                      : 'hover:border-l-2 hover:border-primary/50'
                    }
                    ${active ? 'font-medium' : 'font-normal'}
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                  `}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <item.icon className={`transition-all duration-200 ${active ? 'text-primary' : ''}`} />
                  )}
                  <span className={active ? 'text-primary' : ''}>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
