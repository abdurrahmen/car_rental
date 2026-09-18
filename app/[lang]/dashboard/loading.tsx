import React from 'react';
import { StatsCardSkeleton, TableRowSkeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-apple-fade-in">
      <StatsCardSkeleton />
      <TableRowSkeleton rows={4} />
    </div>
  );
}
