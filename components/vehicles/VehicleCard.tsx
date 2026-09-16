import React from 'react';
import Link from 'next/link';
import type { Vehicle, Language, VehiclePhoto, Dictionary } from '@/types';
import { formatDZD, getPhotoUrl } from '@/lib/utils/constants';

export interface VehicleCardProps {
  vehicle: Vehicle & { photos?: VehiclePhoto[] };
  locale: Language;
  dictionary?: Dictionary;
}

export function VehicleCard({ vehicle, locale, dictionary }: VehicleCardProps) {
  const primaryPhoto =
    vehicle.photos?.find((p) => p.is_primary) || vehicle.photos?.[0];
  const photoUrl = getPhotoUrl(primaryPhoto);

  return (
    <div className="bg-card rounded-xl shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="relative aspect-[4/3] bg-neutral-100">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <svg
              className="w-12 h-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-brand-900 truncate pe-2">
            {vehicle.make} {vehicle.model}
          </h3>
          <span className="text-sm font-medium bg-neutral-100 text-neutral-600 px-2 py-1 rounded">
            {vehicle.year}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-neutral-600 mb-4 flex-grow">
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            {vehicle.transmission === 'automatic' ? 'Auto' : 'Manual'}
          </span>
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {vehicle.seats}
          </span>
          <span className="flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            {vehicle.fuel_type}
          </span>
        </div>

        <div className="flex items-end justify-between mt-auto pt-4 border-t border-neutral-100">
          <div>
            <span className="block text-xs text-neutral-500">
              {dictionary?.vehicles?.daily_rate || 'Daily rate'}
            </span>
            <span className="text-lg font-bold text-accent-600">
              {formatDZD(vehicle.daily_rate, locale)}
            </span>
          </div>
          <Link
            href={`/${locale}/vehicles/${vehicle.id}`}
            className="bg-accent-500 text-brand-900 font-semibold px-4 py-2 rounded-lg hover:bg-accent-400 transition-colors min-h-[44px] flex items-center"
          >
            {dictionary?.vehicles?.vehicle_details || 'View'}
          </Link>
        </div>
      </div>
    </div>
  );
}
