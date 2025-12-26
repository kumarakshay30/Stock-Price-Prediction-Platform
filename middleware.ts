import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = NextResponse.next();
    addCorsHeaders(response);
    return response;
  }

  const response = NextResponse.next();
  addCorsHeaders(response);
  return response;
}

function addCorsHeaders(response: NextResponse) {
  // Set CORS headers for TradingView widgets
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
