import { NextRequest, NextResponse } from "next/server";
import { userService } from "./services/user.service";
import { Roles } from "./constants/role";

export const proxy = async (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const { data } = await userService.getSession();
  
  if (!data) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const userRole = data.user.role;
  
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (userRole === Roles.admin) {
      return NextResponse.redirect(new URL("/admin-dashboard", request.url));
    } else if (userRole === Roles.seller) {
      return NextResponse.redirect(new URL("/seller-dashboard", request.url));
    }
  }
  
  if (pathname.startsWith("/admin-dashboard") && userRole !== Roles.admin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
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