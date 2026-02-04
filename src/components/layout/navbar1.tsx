import Link from "next/link";
import { Menu, Phone, ShoppingCart, User, Truck, Pill, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "./ModeToggle";
import { userService } from "@/services/user.service";
import { getAuthenticatedPath, getDashboardTitle } from "@/lib/role-utils";

export async function Navbar() {
  const { data } = await userService.getSession();
  const isLoggedIn = !!data?.user;
  const user = data?.user;

  const dashboardPath = user?.role ? getAuthenticatedPath(user.role) : "/dashboard";
  const dashboardTitle = user?.role ? getDashboardTitle(user.role) : "Dashboard";

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <header className="w-full border-b bg-background sticky top-0 z-50 shadow-sm">
      {/* Top Info Bar */}
      <div className="hidden border-b bg-gradient-to-r from-emerald-600 to-emerald-700 py-1.5 md:block">
        <div className="container mx-auto flex items-center justify-between px-4 text-xs font-medium text-white/90">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3 w-3" /> +880 1234-567890
            </span>
            <span className="flex items-center gap-1.5">
              <Truck className="h-3 w-3" /> Free Delivery Over ৳1000
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/help" className="hover:text-emerald-200 transition-colors">
              Help Center
            </Link>
            <Link href="/track" className="hover:text-emerald-200 transition-colors">
              Order Tracking
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo - Left */}
        <div className="flex items-center justify-start flex-1">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-200/50 dark:shadow-none">
              <Pill className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Medi<span className="text-emerald-600 dark:text-emerald-400">Store</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                Pharmacy
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation - Center */}
        <nav className="hidden lg:flex items-center justify-center flex-1">
          <NavigationMenu>
            <NavigationMenuList className="flex items-center justify-center gap-1">
              {menu.map((item, index) => (
                <NavigationMenuItem key={item.title} className="flex items-center">
                  <Link
                    href={item.href}
                    className="group inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400"
                  >
                    {item.title}
                  </Link>
                  {index < menu.length - 1 && (
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1" />
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Right Actions - Right */}
        <div className="flex items-center justify-end flex-1 gap-3">
          {/* Cart Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-full"
            asChild
          >
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-950">
                0
              </span>
            </Link>
          </Button>

          {/* Shop Medicines Button */}
          <Button
            size="sm"
            className="hidden md:inline-flex h-9 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium shadow-md shadow-emerald-500/30"
            asChild
          >
            <Link href="/shop">Shop Medicines</Link>
          </Button>

          {/* Separator */}
          <div className="hidden h-6 w-[1px] bg-border md:block" />

          {/* User Menu */}
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0 border border-emerald-200 dark:border-emerald-800 ring-offset-background hover:ring-2 hover:ring-emerald-500/20 transition-all"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 text-white text-xs font-bold uppercase">
                    {getUserInitials()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 mt-2 p-2 border-emerald-100 dark:border-emerald-800">
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 text-white text-sm font-bold">
                    {getUserInitials()}
                  </div>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-semibold leading-none text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-[12px] text-muted-foreground truncate max-w-[150px]">
                      {user?.email}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300">
                        {user?.role?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator className="bg-emerald-100 dark:bg-emerald-800" />

                {/* Dashboard Link */}
                <DropdownMenuItem asChild>
                  <Link href={dashboardPath} className="flex items-center gap-3 p-3 rounded-md hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/50 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <div className="flex flex-col">
                      <span className="font-medium">Dashboard</span>
                      <span className="text-xs text-muted-foreground">{dashboardTitle}</span>
                    </div>
                  </Link>
                </DropdownMenuItem>

                {/* Profile Link */}
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-3 p-3 rounded-md hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/50 cursor-pointer">
                    <User className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-medium">My Profile</span>
                      <span className="text-xs text-muted-foreground">View & edit profile</span>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-emerald-100 dark:bg-emerald-800" />

                {/* Logout with Better Auth */}
                <DropdownMenuItem>
                  <form action="/logout" method="POST" className="w-full">
                    <button
                      type="submit"
                      className="flex items-center gap-2 w-full rounded-md p-3 text-sm font-medium
               text-red-600 hover:bg-red-50
               dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </form>

                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="font-medium text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-medium shadow-md shadow-emerald-500/30"
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Theme Toggle */}
          <ModeToggle />

          {/* Mobile Menu Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden shrink-0 border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-lg"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col gap-6 w-full max-w-xs p-0">
              <div className="p-6 border-b border-emerald-100 dark:border-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-700 text-white">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div>
                    <SheetTitle className="text-lg font-bold text-gray-900 dark:text-white">
                      Medi<span className="text-emerald-600">Store</span>
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground">Trusted Online Pharmacy</p>
                  </div>
                </div>

                {/* User Info in Mobile */}
                {isLoggedIn && user && (
                  <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-emerald-700 text-white text-sm font-bold">
                        {getUserInitials()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{user.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                            {user.role?.toUpperCase()}
                          </span>
                          <Link
                            href={dashboardPath}
                            className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                          >
                            Dashboard →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-4">
                <div className="space-y-1">
                  {menu.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="flex items-center py-3 text-base font-medium border-b border-emerald-100 dark:border-emerald-800 text-gray-700 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 transition-colors"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>

                <div className="mt-8 space-y-3">
                  {/* Shop Medicines Button in Mobile */}
                  <Button
                    size="sm"
                    className="w-full justify-start h-11 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg"
                    asChild
                  >
                    <Link href="/shop" className="gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Shop Medicines
                    </Link>
                  </Button>

                  {isLoggedIn ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start h-11 border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-lg"
                        asChild
                      >
                        <Link href={dashboardPath} className="gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          {dashboardTitle}
                        </Link>
                      </Button>
                      <form action="/logout" method="POST" className="w-full">
                        <button
                          type="submit"
                          className="flex items-center gap-2 w-full rounded-md p-3 text-sm font-medium
               text-red-600 hover:bg-red-50
               dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </form>

                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start h-11 border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-lg"
                        asChild
                      >
                        <Link href="/login">Sign In</Link>
                      </Button>
                      <Button
                        size="sm"
                        className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg"
                        asChild
                      >
                        <Link href="/register">Create Account</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-emerald-100 dark:border-emerald-800">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" />
                    <span>24/7 Support: +880 1234-567890</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Truck className="h-4 w-4" />
                    <span>Free shipping over ৳1000</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

/* ---------- MENU DATA ---------- */
const menu = [
  { title: "Home", href: "/" },
  { title: "Categories", href: "/categories" },
  { title: "Blog", href: "/blogs" },
  { title: "Contact", href: "/contact" },
];