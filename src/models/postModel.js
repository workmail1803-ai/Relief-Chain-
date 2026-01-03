/**
 * Post Model - Handles all post/news feed-related data operations
 */

import { supabase } from '../supabaseClient';

// Fetch posts with author info
export const fetchPosts = async (limit = 3) => {
    return await supabase
        .from('posts')
        .select(`*, profiles:author_id(full_name)`)
        .order('created_at', { ascending: false })
        .limit(limit);
};

// Fetch all posts for feed
export const fetchAllPosts = async (limit = 50) => {
    return await supabase
        .from('posts')
        .select(`
            *,
            profiles:author_id (full_name, role)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
};

// Create a post
export const createPost = async (authorId, content, imageUrl = null) => {
    return await supabase
        .from('posts')
        .insert([{
            author_id: authorId,
            content: content,
            image_url: imageUrl
        }]);
};

// Delete a post
export const deletePost = async (postId) => {
    return await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
};

// Upload post image
export const uploadPostImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('posts').getPublicUrl(filePath);
    return data.publicUrl;
};

export default {
    fetchPosts,
    fetchAllPosts,
    createPost,
    deletePost,
    uploadPostImage
};
