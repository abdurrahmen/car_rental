import React from 'react';
import { Badge, type BadgeProps } from '@/components/ui/Badge';
import type { ReservationStatus, Language } from '@/types';
import { RESERVATION_STATUSES } from '@/lib/utils/constants';

export interface ReservationStatusBadgeProps {
  status: ReservationStatus;
  locale: Language;
}

export function ReservationStatusBadge({
  status,
  locale,
}: ReservationStatusBadgeProps) {
  const getVariant = (
    status: ReservationStatus,
  ): NonNullable<BadgeProps['variant']> => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'deposit_paid':
        return 'info';
      case 'active':
        return 'success';
      case 'completed':
        return 'neutral';
      case 'cancelled':
        return 'danger';
      case 'no_show':
        return 'danger';
      default:
        return 'default';
    }
  };

  const label =
    RESERVATION_STATUSES[status]?.label[locale] || status.replace('_', ' ');

  return (
    <Badge variant={getVariant(status)} className="capitalize">
      {label}
    </Badge>
  );
}
