/**
 * usePosts Controller - Custom hook for posts/news feed logic
 */

import { useState, useEffect, useCallback } from 'react';
import * as postModel from '../models/postModel';

export const usePostsController = (limit = 3) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await postModel.fetchPosts(limit);
        if (!error) setPosts(data || []);
        setLoading(false);
    }, [limit]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const createPost = useCallback(async (userId, content, imageFile = null) => {
        try {
            let imageUrl = null;
            if (imageFile) {
                imageUrl = await postModel.uploadPostImage(imageFile);
            }

            const { error } = await postModel.createPost(userId, content, imageUrl);
            if (error) throw error;

            await fetchPosts();
            return { success: true };
        } catch (error) {
            return { error };
        }
    }, [fetchPosts]);

    return {
        posts,
        loading,
        fetchPosts,
        createPost
    };
};

export const useAllPosts = (limit = 50) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await postModel.fetchAllPosts(limit);
        if (!error) setPosts(data || []);
        setLoading(false);
    }, [limit]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return { posts, loading, fetchPosts };
};

export default usePostsController;
