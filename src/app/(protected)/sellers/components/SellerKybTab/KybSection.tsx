'use client';

import React from 'react';

interface KybSectionProps {
  readonly title: string;
  readonly children: React.ReactNode;
}

export function KybSection({ title, children }: KybSectionProps) {
  return (
    <section className="rounded-xl border border-mds-black-100 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-medium text-mds-black-900">{title}</h2>
      {children}
    </section>
  );
}
