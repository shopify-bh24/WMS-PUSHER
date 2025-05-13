import { NextRequest, NextResponse } from 'next/server';

// Define more permissive route handler types for Next.js 15
declare module 'next/server' {
  // Override the types for route handlers to be more permissive
  export type NextRouteHandler<Params = Record<string, string>> = (
    request: NextRequest,
    context: { params: Params }
  ) => Promise<NextResponse> | NextResponse;
} 