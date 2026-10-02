'use client';

import React, { Suspense } from 'react';
import PropFirmsPage from '@/app/prop-firms/page';

export default function DashboardPropFirmsPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<div className="p-8 text-center text-purple-600 font-bold">Loading Prop Firms...</div>}>
        <PropFirmsPage />
      </Suspense>
    </div>
  );
}
