/**
 * Product Model - Handles all product-related data operations
 */

import { supabase } from '../supabaseClient';

// Fetch all products
export const fetchProducts = async () => {
    return await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
};

// Fetch single product by ID
export const fetchProductById = async (id) => {
    return await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
};

// Create product
export const createProduct = async (productData) => {
    return await supabase
        .from('products')
        .insert([productData]);
};

// Update product
export const updateProduct = async (id, updates) => {
    return await supabase
        .from('products')
        .update(updates)
        .eq('id', id);
};

// Delete product
export const deleteProduct = async (id) => {
    return await supabase
        .from('products')
        .delete()
        .eq('id', id);
};

// Update product stock
export const updateProductStock = async (id, newStock) => {
    return await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', id);
};

// Get product stock
export const getProductStock = async (id) => {
    return await supabase
        .from('products')
        .select('stock')
        .eq('id', id)
        .single();
};

// Upload product image
export const uploadProductImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('products').getPublicUrl(filePath);
    return data.publicUrl;
};

export default {
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    getProductStock,
    uploadProductImage
};
