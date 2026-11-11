'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/actions/notifications';
import type { Notification, Language } from '@/types';

export interface NotificationBellProps {
  locale: Language;
  userRole?: string;
  className?: string;
}

export function NotificationBell({
  locale,
  userRole = 'customer',
  className = '',
}: NotificationBellProps) {
  const router = useRouter();
  const isArabic = locale === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const loadNotifications = async () => {
    try {
      const res = await getUserNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      // silently fail if user is not logged in
    }
  };

  useEffect(() => {
    let isMounted = true;

    getUserNotifications()
      .then((res) => {
        if (isMounted) {
          setNotifications(res.notifications);
          setUnreadCount(res.unreadCount);
        }
      })
      .catch(() => {});

    const interval = setInterval(() => {
      getUserNotifications()
        .then((res) => {
          if (isMounted) {
            setNotifications(res.notifications);
            setUnreadCount(res.unreadCount);
          }
        })
        .catch(() => {});
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (n: Notification) => {
    if (!n.is_read) {
      startTransition(async () => {
        await markNotificationAsRead(n.id);
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item)),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      });
    }

    const reservationId = n.metadata?.reservation_id as string | undefined;
    if (reservationId) {
      setIsOpen(false);
      if (userRole === 'admin' || userRole === 'staff' || userRole === 'branch_manager') {
        router.push(`/${locale}/staff/reservations/${reservationId}`);
      } else {
        router.push(`/${locale}/dashboard/reservations/${reservationId}`);
      }
    }
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      setUnreadCount(0);
    });
  };

  const getTitle = (n: Notification) => {
    if (locale === 'ar') return n.title_ar || n.title_fr || n.title_en;
    if (locale === 'fr') return n.title_fr || n.title_en || n.title_ar;
    return n.title_en || n.title_fr || n.title_ar;
  };

  const getMessage = (n: Notification) => {
    if (locale === 'ar') return n.message_ar || n.message_fr || n.message_en;
    if (locale === 'fr') return n.message_fr || n.message_en || n.message_ar;
    return n.message_en || n.message_fr || n.message_ar;
  };

  const formatNotificationDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) loadNotifications();
        }}
        className="relative w-9 h-9 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 stroke-[1.75]" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 end-1.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#0B1320] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full end-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#142032] p-3.5 shadow-2xl border border-black/[0.08] dark:border-white/[0.08] z-50 animate-apple-fade-in text-start">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-neutral-100 dark:border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                {isArabic ? 'التنبيهات' : locale === 'fr' ? 'Notifications' : 'Notifications'}
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300 text-[10px] font-bold">
                  {unreadCount} {isArabic ? 'جديد' : 'new'}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isPending}
                className="text-[11px] font-medium text-brand-500 hover:text-brand-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{isArabic ? 'تحديد الكل كمقروء' : locale === 'fr' ? 'Tout marquer lu' : 'Mark all read'}</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto space-y-2 pe-1">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    !n.is_read
                      ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200/60 dark:border-blue-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/50'
                      : 'bg-neutral-50/70 dark:bg-white/[0.03] border-neutral-100 dark:border-white/5 hover:bg-neutral-100/70 dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-neutral-900 dark:text-white leading-tight">
                      {getTitle(n)}
                    </h4>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1" />
                    )}
                  </div>

                  <p className="text-[11px] text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2 leading-relaxed">
                    {getMessage(n)}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatNotificationDate(n.created_at)}</span>
                    </span>
                    {Boolean(n.metadata?.reservation_id) && (
                      <span className="text-brand-500 font-semibold flex items-center gap-0.5">
                        <span>{isArabic ? 'عرض التفاصيل' : 'Details'}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-neutral-400">
                <Bell className="w-7 h-7 mx-auto mb-2 opacity-30 stroke-[1.5]" />
                <p>
                  {isArabic
                    ? 'لا توجد تنبيهات حالياً'
                    : locale === 'fr'
                    ? 'Aucune notification pour le moment'
                    : 'No notifications at this moment'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
