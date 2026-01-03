/**
 * Storage Model - Handles all file storage operations
 */

import { supabase } from '../supabaseClient';

// Upload file to a bucket
export const uploadFile = async (bucket, file, customFileName = null) => {
    const fileExt = file.name.split('.').pop();
    const fileName = customFileName || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
};

// Upload avatar
export const uploadAvatar = async (userId, file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    return publicUrl;
};

// Upload disaster image
export const uploadDisasterImage = async (file) => {
    return await uploadFile('disasters', file);
};

// Upload medical case image
export const uploadMedicalImage = async (file) => {
    return await uploadFile('medical', file);
};

// Upload product image
export const uploadProductImage = async (file) => {
    return await uploadFile('products', file);
};

// Upload post image
export const uploadPostImage = async (file) => {
    return await uploadFile('posts', file);
};

// Delete file from bucket
export const deleteFile = async (bucket, filePath) => {
    return await supabase.storage
        .from(bucket)
        .remove([filePath]);
};

export default {
    uploadFile,
    uploadAvatar,
    uploadDisasterImage,
    uploadMedicalImage,
    uploadProductImage,
    uploadPostImage,
    deleteFile
};
