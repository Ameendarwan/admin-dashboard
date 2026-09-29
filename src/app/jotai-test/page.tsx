'use client';

import React from 'react';
import { Button } from '@merit-incentives/ui/components';
import { useRouter } from 'next/navigation';

import { JotaiTestComponent } from '@/components/JotaiTestComponent';

export default function JotaiTestPage() {
  const router = useRouter();
  const redirect = (pathname: string) => {
    router.push(pathname);
  };
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Jotai Integration Test
        </h1>
        <Button
          variant="primary"
          onClick={() => redirect('/')}
          className="mb-4"
        >
          Go Back to Home
        </Button>
        <JotaiTestComponent />
      </div>
    </div>
  );
}
