import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export const proxy = clerkMiddleware(async (auth, req) => {
  // TEMP-BYPASS-FOR-HEADLESS-TEST — revert immediately after
  // if (!isPublicRoute(req)) {
  //   await auth.protect();
  // }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
