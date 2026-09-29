import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
const getOriginFromEnv = (value?: string): string | null => {
  if (!value) {
    return null;
  }
  try {
    const url = new URL(value);
    return url.origin;
  } catch {
    return null;
  }
};

const buildConnectSrcDirective = (): string => {
  const origins = new Set<string>([
    "'self'",
    'https://identitytoolkit.googleapis.com',
    'https://securetoken.googleapis.com', // if using Firebase token refresh
    'https://storage.googleapis.com', // For GCS signed URL uploads
  ]);

  const envOrigins = [
    getOriginFromEnv(process.env.NEXT_PUBLIC_API_URL),
    getOriginFromEnv(process.env.NEXT_PUBLIC_IDENTITY_SERVICE_API_BASE_URL),
    getOriginFromEnv(process.env.NEXT_PUBLIC_ACCOUNTS_URL),
    getOriginFromEnv(process.env.NEXT_PUBLIC_POINTS_EXCHANGE_API_URL),
    getOriginFromEnv(process.env.NEXT_PUBLIC_SELLER_PORTAL_API_BASE_URL),
    getOriginFromEnv(process.env.NEXT_PUBLIC_B2C_API_BASE_URL),
  ];

  envOrigins.forEach((origin) => {
    if (origin) {
      origins.add(origin);
    }
  });

  return `connect-src ${Array.from(origins).join(' ')}`;
};

const isProductionEnv =
  process.env.NEXT_PUBLIC_NODE_ENV === 'production' ||
  process.env.NODE_ENV === 'production';

const buildContentSecurityPolicy = (): string => {
  const scriptSrc = isProductionEnv
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    buildConnectSrcDirective(),
    "font-src 'self' https: data:",
    "object-src 'none'",
    "frame-ancestors 'self'",
  ].join('; ');
};
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: process.env.NODE_ENV === 'development',
  },
  async headers() {
    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: buildContentSecurityPolicy(),
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Powered-By',
        value: 'Next.js',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
    ];

    if (isProductionEnv) {
      securityHeaders.unshift({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      });
    }

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
