import { NextRequest, NextResponse } from 'next/server';

const defaultLocale = 'en' as const;

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('x-locale', defaultLocale);

  if (!request.cookies.has('MI_LMS_LOCALE')) {
    response.cookies.set('MI_LMS_LOCALE', defaultLocale);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|images|favicon.ico).*)'],
};
