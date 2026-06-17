import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/rag(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect(); // Redirects to login automatically
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};