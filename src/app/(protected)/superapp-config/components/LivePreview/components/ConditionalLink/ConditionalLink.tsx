import { type ReactNode } from 'react';

interface ConditionalLinkProps {
  href?: string;
  className?: string;
  children: ReactNode;
}

export function ConditionalLink({
  href,
  className = '',
  children,
}: Readonly<ConditionalLinkProps>) {
  return (
    <a
      href={href || undefined}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener noreferrer' : undefined}
      className={`${className} ${href ? 'cursor-pointer' : 'cursor-default pointer-events-none'}`}
    >
      {children}
    </a>
  );
}
