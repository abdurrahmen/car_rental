import React from 'react';
import { StatsCardSkeleton, TableRowSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-apple-fade-in">
      <StatsCardSkeleton />
      <TableRowSkeleton rows={5} />
    </div>
  );
}
