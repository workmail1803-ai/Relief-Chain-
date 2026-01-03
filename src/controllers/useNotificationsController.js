/**
 * useNotifications Controller - Custom hook for notifications logic
 */

import { useState, useEffect, useCallback } from 'react';
import * as notificationModel from '../models/notificationModel';

export const useNotificationsController = (userId) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;
        
        const { data } = await notificationModel.fetchNotifications(userId);
        if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
    }, [userId]);

    useEffect(() => {
        if (!userId) return;

        fetchNotifications();

        const channel = notificationModel.subscribeToNotifications(userId, (payload) => {
            if (payload.eventType === 'INSERT') {
                setNotifications(prev => [payload.new, ...prev]);
                setUnreadCount(prev => prev + 1);
            } else if (payload.eventType === 'DELETE') {
                setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
                fetchNotifications();
            }
        });

        return () => {
            notificationModel.removeChannel(channel);
        };
    }, [userId, fetchNotifications]);

    const markAsRead = useCallback(async (notificationId) => {
        const { error } = await notificationModel.deleteNotification(notificationId);
        if (!error) {
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        return { error };
    }, []);

    const createNotification = useCallback(async (targetUserId, title, message, type, metaData = null) => {
        return await notificationModel.createNotification(targetUserId, title, message, type, metaData);
    }, []);

    return {
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        createNotification
    };
};

export default useNotificationsController;
