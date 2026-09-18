import React from 'react';
import { StatsCardSkeleton, TableRowSkeleton } from '@/components/ui/Skeleton';

export default function StaffLoading() {
  return (
    <div className="space-y-8 animate-apple-fade-in">
      <StatsCardSkeleton />
      <TableRowSkeleton rows={5} />
    </div>
  );
}
