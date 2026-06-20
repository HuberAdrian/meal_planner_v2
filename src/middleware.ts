import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// The cron keep-alive endpoint must bypass Clerk auth: Vercel Cron calls it
// without a user session, so auth.protect() would otherwise block it. It is
// guarded separately by CRON_SECRET inside the handler.
const isPublicRoute = createRouteMatcher(["/", "/api/cron/(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
