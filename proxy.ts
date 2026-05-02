<<<<<<< HEAD
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If not logged in and trying to access protected route
  if (!userId && !isPublicRoute(req)) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // If logged in and on root, redirect to dashboard
  if (userId && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
});
=======
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();
>>>>>>> a852c9a93198feb36e493eafa9501773fc569eb4

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};