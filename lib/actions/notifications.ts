'use server';

import { createClient } from '@/lib/supabase/server';
import { getAuthUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { Notification } from '@/types';

export interface SendNotificationParams {
  profile_id: string;
  type: string;
  title_ar: string;
  title_fr: string;
  title_en: string;
  message_ar: string;
  message_fr: string;
  message_en: string;
  metadata?: Record<string, unknown>;
}

/**
 * Send a notification to a specific profile.
 * Attempts to use the security definer function 'create_notification' first,
 * falling back to direct table insert.
 */
export async function sendNotification(params: SendNotificationParams): Promise<boolean> {
  try {
    if (!params.profile_id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.profile_id)) {
      return false;
    }

    const supabase = await createClient();

    // Try RPC first (bypasses RLS)
    const { error: rpcError } = await supabase.rpc('create_notification', {
      p_profile_id: params.profile_id,
      p_type: params.type,
      p_title_ar: params.title_ar,
      p_title_fr: params.title_fr,
      p_title_en: params.title_en,
      p_message_ar: params.message_ar,
      p_message_fr: params.message_fr,
      p_message_en: params.message_en,
      p_metadata: params.metadata || {},
    });

    if (!rpcError) return true;

    // Fallback to direct insert
    const { error: insertError } = await supabase.from('notifications').insert({
      profile_id: params.profile_id,
      type: params.type,
      title_ar: params.title_ar,
      title_fr: params.title_fr,
      title_en: params.title_en,
      message_ar: params.message_ar,
      message_fr: params.message_fr,
      message_en: params.message_en,
      metadata: params.metadata || {},
    });

    if (insertError) {
      console.warn('Failed to insert notification:', insertError.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error sending notification:', err);
    return false;
  }
}

/**
 * Notify all staff and managers assigned to a specific branch, plus all admins.
 */
export async function notifyBranchStaffAndAdmins(
  branchId: string | null,
  notificationData: Omit<SendNotificationParams, 'profile_id'>,
): Promise<void> {
  try {
    const supabase = await createClient();

    // Query staff at this branch or admins
    let query = supabase.from('profiles').select('id, role, branch_id');
    if (branchId) {
      query = query.or(`role.eq.admin,and(branch_id.eq.${branchId},role.in.(staff,branch_manager))`);
    } else {
      query = query.eq('role', 'admin');
    }

    const { data: recipients } = await query;

    if (recipients && recipients.length > 0) {
      await Promise.all(
        recipients.map((r) =>
          sendNotification({
            ...notificationData,
            profile_id: r.id,
          }),
        ),
      );
    }
  } catch (err) {
    console.error('Error notifying branch staff:', err);
  }
}

/**
 * Fetch notifications for the currently logged-in user.
 */
export async function getUserNotifications(): Promise<{
  notifications: Notification[];
  unreadCount: number;
}> {
  const user = await getAuthUser();
  if (!user) {
    return { notifications: [], unreadCount: 0 };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data) {
    return { notifications: [], unreadCount: 0 };
  }

  const notifications = data as unknown as Notification[];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return { notifications, unreadCount };
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
  const user = await getAuthUser();
  if (!user) return { success: false };

  const supabase = await createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('profile_id', user.id);

  if (error) {
    console.warn('Error marking notification as read:', error.message);
    return { success: false };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

/**
 * Mark all notifications for the current user as read.
 */
export async function markAllNotificationsAsRead(): Promise<{ success: boolean }> {
  const user = await getAuthUser();
  if (!user) return { success: false };

  const supabase = await createClient();
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('profile_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.warn('Error marking all notifications as read:', error.message);
    return { success: false };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}
