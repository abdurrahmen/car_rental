/**
 * Plate component - Algerian license plate display
 * Format: 01423-124-16
 * Always LTR with nowrap to prevent line breaks
 */

import React from 'react';

interface PlateProps {
  number: string;
  className?: string;
}

export function Plate({ number, className = '' }: PlateProps) {
  return (
    <bdi dir="ltr" className={`inline-block whitespace-nowrap font-mono ${className}`}>
      {number}
    </bdi>
  );
}
