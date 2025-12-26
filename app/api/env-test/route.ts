import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hasEnvVar: !!process.env.NEXT_PUBLIC_FINNHUB_API_KEY,
    env: {
      nodeEnv: process.env.NODE_ENV,
      // Don't log the actual API key for security
      hasFinnhubKey: !!process.env.NEXT_PUBLIC_FINNHUB_API_KEY,
      // Check if we're running in development mode
      isDev: process.env.NODE_ENV === 'development',
    }
  });
}
