import Link from "next/link"
import { 
  Home, 
  Users, 
  Package, 
  ShoppingBag, 
  FolderTree,
  Plus,
  User as UserIcon,
  FileText,
  ShoppingCart,
  CreditCard,
  LogOut
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/layout/sidebar"

import { adminRoutes } from "@/routes/adminRoutes"
import { sellerRoutes } from "@/routes/sellerRoutes"
import { customerRoutes } from "@/routes/customerRoutes"
import { Route } from "@/types"
import { Roles } from "@/constants/role"
import { getDashboardTitle } from "@/lib/role-utils"

type AppSidebarProps = {
  user: { 
    role: string
    name?: string
    email?: string
    id?: string
  }
}

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  Home: <Home className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Package: <Package className="h-4 w-4" />,
  ShoppingBag: <ShoppingBag className="h-4 w-4" />,
  FolderTree: <FolderTree className="h-4 w-4" />,
  Plus: <Plus className="h-4 w-4" />,
  User: <UserIcon className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  ShoppingCart: <ShoppingCart className="h-4 w-4" />,
  CreditCard: <CreditCard className="h-4 w-4" />,
}

export async function AppSidebar({ user }: AppSidebarProps) {
  let routes: Route[] = []

  switch (user.role) {
    case Roles.admin:
      routes = adminRoutes
      break
    case Roles.seller:
      routes = sellerRoutes
      break
    case Roles.customer:
      routes = customerRoutes
      break
    default:
      routes = []
  }

  const getDashboardTitleText = () => {
    return getDashboardTitle(user.role)
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4 z-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white dark:bg-emerald-700">
            <Home className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold">MediStore</p>
            <p className="text-xs text-muted-foreground">{getDashboardTitleText()}</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {routes.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link 
                        href={item.url} 
                        className="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-400"
                      >
                        {item.icon && iconMap[item.icon]}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        
        {/* User Profile Section */}
        {user.name && (
          <SidebarGroup className="mt-6 border-t pt-4">
            <SidebarGroupContent>
              <div className="space-y-2 px-2 py-2">
                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                  {user.role}
                </p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        
        {/* Logout Button */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                >
                  <Link 
                    href="/logout"
                    className="flex items-center gap-2 w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}