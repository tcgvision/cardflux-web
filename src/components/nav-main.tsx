"use client"

import { useRouter } from "next/navigation"
import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import { Loader2 } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import { useNavigationLoading } from "~/hooks/use-navigation-loading"

export function NavMain({
  items,
  currentPath,
  onNavigate,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
  currentPath: string
  onNavigate?: (url: string) => void
}) {
  const router = useRouter()
  const { loadingItem, startLoading } = useNavigationLoading()

  const handleNavigation = async (url: string) => {
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
    if (url === "/dashboard") {
      return currentPath === "/dashboard"
    }
    return currentPath.startsWith(url)
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear transition-all hover:scale-105 active:scale-95"
            >
              <IconCirclePlusFilled />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0 transition-all duration-200 hover:scale-105 active:scale-95"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const active = isActive(item.url)
            const isLoading = loadingItem === item.url
            
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  tooltip={item.title}
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
                    item.icon && (
                      <item.icon className={`transition-all duration-200 ${active ? 'text-primary' : ''}`} />
                    )
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
