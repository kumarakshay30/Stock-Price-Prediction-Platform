import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Only initialize Sentry in production
if (process.env.NODE_ENV === 'production' && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    beforeSend(event) {
      // Filter out CORS errors in development
      if (process.env.NODE_ENV === 'development' && 
          event.exception?.values?.[0]?.value?.includes('CORS')) {
        return null;
      }
      return event;
    }
  });
}
