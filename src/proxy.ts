import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Map route → permission keys
const routePermissionMap: Record<string, string[]> = {
  "/files": ["file"],
  "/tasks": ["work"],
  "/config": ["user", "role"], // cần quyền user hoặc role
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // tìm permission keys theo route
  const permissionKeys = Object.entries(routePermissionMap).find(
    ([route]) => pathname === route || pathname.startsWith(route + "/"),
  )?.[1];

  // route không cần check
  if (!permissionKeys) {
    return NextResponse.next();
  }

  // lấy cookie permissions
  const cookie = request.cookies.get("permissions");

  if (!cookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // parse JSON
  let permissions: Record<string, { actions: string[] }> = {};

  try {
    permissions = JSON.parse(decodeURIComponent(cookie.value));
  } catch {
    permissions = {};
  }

  // check quyền view
  const hasViewPermission = permissionKeys.some((key) =>
    permissions[key]?.actions?.includes("view"),
  );

  if (!hasViewPermission) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/files/:path*", "/tasks/:path*", "/config", "/config/:path*"],
};
