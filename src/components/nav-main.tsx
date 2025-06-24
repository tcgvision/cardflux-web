"use client"

import { useRouter } from "next/navigation"
import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"

import { Button } from "~/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import { useLoading } from "~/components/loading-provider"

export function NavMain({
  items,
  currentPath,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
  currentPath: string
}) {
  const router = useRouter()
  const { startLoading } = useLoading()

  const handleNavigation = (url: string) => {
    // Start loading immediately for instant feedback
    startLoading()
    
    // Use setTimeout to ensure the loading state is set before navigation
    setTimeout(() => {
      router.push(url)
    }, 0)
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
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  tooltip={item.title}
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
                  {item.icon && (
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
