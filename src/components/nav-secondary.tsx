"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import { useLoading } from "~/components/loading-provider"

export function NavSecondary({
  items,
  currentPath,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon
  }[]
  currentPath: string
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const router = useRouter()
  const { startLoading } = useLoading()

  const handleNavigation = (url: string) => {
    if (url === "#") {
      // Handle search functionality
      return
    }
    
    // Start loading immediately for instant feedback
    startLoading()
    
    // Use setTimeout to ensure the loading state is set before navigation
    setTimeout(() => {
      router.push(url)
    }, 0)
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
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  onClick={() => handleNavigation(item.url)}
                  className={`
                    transition-all duration-200 ease-in-out
                    hover:bg-accent hover:text-accent-foreground 
                    active:scale-95 active:bg-accent/80
                    ${active 
                      ? 'bg-accent text-accent-foreground shadow-sm border-l-2 border-primary' 
                      : 'hover:border-l-2 hover:border-primary/50'
                    }
                    ${active ? 'font-medium' : 'font-normal'}
                  `}
                >
                  <item.icon className={`transition-all duration-200 ${active ? 'text-primary' : ''}`} />
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
