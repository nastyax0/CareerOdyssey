import { NextResponse } from "next/server";

export async function middleware(req) {
  const supabaseToken = req.cookies.get("supabase-auth-token"); // Get session token

  if (!supabaseToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Apply middleware only to protected routes
export const config = {
  matcher: ["/chatbot/:path*"], // Protects /chatbot
};
