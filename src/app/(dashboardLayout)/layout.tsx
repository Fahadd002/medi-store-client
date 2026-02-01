import { AppSidebar } from "@/components/layout/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/layout/breadcrumb"
import { Separator } from "@/components/layout/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/layout/sidebar"
import { userService } from "@/services/user.service"
import { Roles } from "@/constants/role"
import { ModeToggle } from "@/components/layout/ModeToggle"
import { redirect } from "next/navigation"
import { getDashboardTitle, getAuthenticatedPath } from "@/lib/role-utils"

export default async function DashboardLayout({
  children,
  admin,
  seller,
  customer,
}: {
  children: React.ReactNode
  admin: React.ReactNode
  seller: React.ReactNode
  customer: React.ReactNode
}) {
  const { data } = await userService.getSession();
  console.log("DashboardLayout user session data:", data);
  
  if (!data) {
    redirect("/login")
  }

  const userInfo = data.user;

  const getRoleContent = () => {
    switch (userInfo.role) {
      case Roles.admin:
        return admin || children;
      case Roles.seller:
        return seller || children;
      case Roles.customer:
        return customer || children;
      default:
        return children;
    }
  }

  const getBasePath = () => {
    return getAuthenticatedPath(userInfo.role)
  }

  const getTitleText = () => {
    return getDashboardTitle(userInfo.role)
  }

  return (
    <SidebarProvider>
      <AppSidebar user={userInfo} />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={getBasePath()}>
                    {getTitleText()}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Welcome, {userInfo.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {getRoleContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}