/**
 * useChat Controller - Custom hook for chat/messaging logic
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as chatModel from '../models/chatModel';

export const useChatController = (currentUserId, selectedUserId) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, []);

    const fetchMessages = useCallback(async () => {
        if (!selectedUserId || !currentUserId) return;
        
        setLoading(true);
        const { data, error } = await chatModel.fetchMessages(currentUserId, selectedUserId);
        if (!error) {
            setMessages(data || []);
            scrollToBottom();
        }
        setLoading(false);
    }, [currentUserId, selectedUserId, scrollToBottom]);

    useEffect(() => {
        if (!selectedUserId || !currentUserId) return;

        fetchMessages();

        const channel = chatModel.subscribeToChat(currentUserId, selectedUserId, (payload) => {
            const msg = payload.new;
            if (
                (msg.sender_id === currentUserId && msg.receiver_id === selectedUserId) ||
                (msg.sender_id === selectedUserId && msg.receiver_id === currentUserId)
            ) {
                setMessages(prev => [...prev, msg]);
                scrollToBottom();
            }
        });

        return () => {
            chatModel.removeChannel(channel);
        };
    }, [currentUserId, selectedUserId, fetchMessages, scrollToBottom]);

    const sendMessage = useCallback(async (content) => {
        if (!content.trim() || !selectedUserId) return { error: 'Invalid message' };

        const optimisticMsg = {
            id: 'temp-' + Date.now(),
            sender_id: currentUserId,
            receiver_id: selectedUserId,
            content: content.trim(),
            created_at: new Date().toISOString()
        };

        // Optimistic update
        setMessages(prev => [...prev, optimisticMsg]);
        scrollToBottom();

        const { data, error } = await chatModel.sendMessage(currentUserId, selectedUserId, content.trim());

        if (error) {
            // Rollback on error
            setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
            return { error };
        } else {
            // Replace temp message with real one
            setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? data : m));
            return { success: true };
        }
    }, [currentUserId, selectedUserId, scrollToBottom]);

    return {
        messages,
        loading,
        sendMessage,
        bottomRef
    };
};

export default useChatController;
