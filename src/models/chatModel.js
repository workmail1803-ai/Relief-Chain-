/**
 * Chat Model - Handles all chat/messaging-related data operations
 */

import { supabase } from '../supabaseClient';

// Fetch messages between two users
export const fetchMessages = async (userId1, userId2) => {
    return await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order('created_at', { ascending: true });
};

// Send a message
export const sendMessage = async (senderId, receiverId, content) => {
    return await supabase
        .from('messages')
        .insert([{
            sender_id: senderId,
            receiver_id: receiverId,
            content: content
        }])
        .select()
        .single();
};

// Subscribe to chat messages
export const subscribeToChat = (userId, otherUserId, callback) => {
    const channel = supabase
        .channel(`chat-${userId}-${otherUserId}`)
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=in.(${userId},${otherUserId})`
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
    fetchMessages,
    sendMessage,
    subscribeToChat,
    removeChannel
};
