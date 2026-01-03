/**
 * Notification Model - Handles all notification-related data operations
 */

import { supabase } from '../supabaseClient';

// Fetch user notifications
export const fetchNotifications = async (userId, limit = 10) => {
    return await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
};

// Create notification
export const createNotification = async (userId, title, message, type = 'info', metaData = null) => {
    return await supabase
        .from('notifications')
        .insert([{
            user_id: userId,
            title: title,
            message: message,
            type: type,
            meta_data: metaData
        }]);
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
    return await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
};

// Delete notification
export const deleteNotification = async (notificationId) => {
    return await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
};

// Subscribe to notifications
export const subscribeToNotifications = (userId, callback) => {
    const channel = supabase
        .channel('realtime-notifications')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`
            },
            callback
        )
        .subscribe();

    return channel;
};

// Remove channel subscription
export const removeChannel = (channel) => {
    supabase.removeChannel(channel);
};

export default {
    fetchNotifications,
    createNotification,
    markAsRead,
    deleteNotification,
    subscribeToNotifications,
    removeChannel
};
