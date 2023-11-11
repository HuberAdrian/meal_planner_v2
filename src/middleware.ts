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


/* other method:
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


