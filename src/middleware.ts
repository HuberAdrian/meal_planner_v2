/*
import { withClerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
 
export default withClerkMiddleware(() => {
    console.log("Middleware running");
  return NextResponse.next();
});
 
// Stop Middleware running on static files
export const config = {
  matcher: "/((?!_next/image|_next/static|favicon.ico).*)",
};

// ----------------------------------------------
 other method:
import { NextResponse } from "next/server";
 

import { authMiddleware } from "@clerk/nextjs";
 
// run console.log on every request
export default authMiddleware({
    beforeAuth: () => {
        console.log("beforeAuth");
    }
});

 
// Stop Middleware running on static files
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
*/ 

import { authMiddleware } from "@clerk/nextjs";
 
// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  publicRoutes: ["/"],
});
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
 


