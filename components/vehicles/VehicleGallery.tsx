'use client';

import React, { useState } from 'react';
import type { VehiclePhoto } from '@/types';
import { getPhotoUrl } from '@/lib/utils/constants';

export interface VehicleGalleryProps {
  photos: VehiclePhoto[];
  vehicleName: string;
}

export function VehicleGallery({ photos, vehicleName }: VehicleGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full aspect-video bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400">
        No photos available
      </div>
    );
  }

  const currentUrl = getPhotoUrl(photos[currentIndex]);

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full aspect-video bg-neutral-900 rounded-xl overflow-hidden relative">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={`${vehicleName} - View ${currentIndex + 1}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            No image preview
          </div>
        )}

        {photos.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev > 0 ? prev - 1 : photos.length - 1,
                )
              }
              className="pointer-events-auto bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center backdrop-blur-sm"
              aria-label="Previous image"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev < photos.length - 1 ? prev + 1 : 0,
                )
              }
              className="pointer-events-auto bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center backdrop-blur-sm"
              aria-label="Next image"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {photos.map((photo, index) => {
            const thumbUrl = getPhotoUrl(photo);
            return (
              <button
                type="button"
                key={photo.id}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden border-2 transition-colors focus:outline-none min-h-[44px] ${
                  index === currentIndex
                    ? 'border-accent-500'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={thumbUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
