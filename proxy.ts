// proxy.ts (or middleware.ts)
import { NextRequest, NextResponse } from "next/server";
import { userService } from "./src/services/user.service";
import { Roles } from "./src/constants/role";

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  // Check for session token in cookies first (faster check)
  const sessionToken = request.cookies.get("better-auth.session_token");
  
  //* User is not authenticated at all - redirect to login
  if (!sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Get full session data to check roles
  const { data } = await userService.getSession();
  
  if (!data) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const userRole = data.user.role;
  
  // Handle dashboard redirects based on role
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (userRole === Roles.admin) {
      return NextResponse.redirect(new URL("/admin-dashboard", request.url));
    } else if (userRole === Roles.seller) {
      return NextResponse.redirect(new URL("/seller-dashboard", request.url));
    }
  }
  
  // Prevent unauthorized access to admin routes
  if (pathname.startsWith("/admin-dashboard") && userRole !== Roles.admin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Prevent unauthorized access to seller routes
  if (pathname.startsWith("/seller-dashboard") && userRole !== Roles.seller) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin-dashboard/:path*",
    "/seller-dashboard/:path*"
  ]
}