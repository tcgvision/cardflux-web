"use client"

import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
  type Icon,
} from "@tabler/icons-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar"
import { useNavigationLoading } from "~/hooks/use-navigation-loading"

export function NavDocuments({
  items,
  currentPath,
  onNavigate,
}: {
  items: {
    name: string
    url: string
    icon: Icon
  }[]
  currentPath: string
  onNavigate?: (url: string) => void
}) {
  const { isMobile } = useSidebar()
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
    return currentPath.startsWith(url)
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const active = isActive(item.url)
          const isLoading = loadingItem === item.url
          
          return (
            <SidebarMenuItem key={item.name}>
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
                <span className={active ? 'text-primary' : ''}>{item.name}</span>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction
                    showOnHover
                    className="data-[state=open]:bg-accent rounded-sm transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <IconDots />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-24 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem className="transition-all duration-200 hover:bg-accent">
                    <IconFolder />
                    <span>Open</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="transition-all duration-200 hover:bg-accent">
                    <IconShare3 />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" className="transition-all duration-200 hover:bg-destructive/10">
                    <IconTrash />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )
        })}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70 transition-all duration-200 hover:bg-accent hover:text-accent-foreground active:scale-95">
            <IconDots className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
