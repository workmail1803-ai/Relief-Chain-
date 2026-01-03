/**
 * useProducts Controller - Custom hook for product management logic
 */

import { useState, useEffect, useCallback } from 'react';
import * as productModel from '../models/productModel';

export const useProductsController = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await productModel.fetchProducts();
        if (error) {
            console.error('Error fetching products:', error);
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const filterProducts = useCallback((category, searchQuery) => {
        return products.filter(product => {
            const matchesCategory = category === 'All' || product.category === category;
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products]);

    return {
        products,
        loading,
        fetchProducts,
        filterProducts
    };
};

export const useProductDetail = (id) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProduct = useCallback(async () => {
        const { data, error } = await productModel.fetchProductById(id);
        if (!error && data) {
            setProduct(data);
        }
        setLoading(false);
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    return { product, loading, setProduct };
};

export const useProductAdmin = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await productModel.fetchProducts();
        if (!error) setProducts(data || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = useCallback(async (id) => {
        const { error } = await productModel.deleteProduct(id);
        if (!error) fetchProducts();
        return { error };
    }, [fetchProducts]);

    const handleSave = useCallback(async (productData, editProduct = null) => {
        let imageUrl = editProduct ? editProduct.image_url : null;

        if (productData.image) {
            try {
                imageUrl = await productModel.uploadProductImage(productData.image);
            } catch (error) {
                return { error };
            }
        }

        const data = {
            name: productData.name,
            price: parseFloat(productData.price),
            category: productData.category,
            stock: parseInt(productData.stock),
            description: productData.description,
            image_url: imageUrl
        };

        let result;
        if (editProduct) {
            result = await productModel.updateProduct(editProduct.id, data);
        } else {
            result = await productModel.createProduct(data);
        }

        if (!result.error) fetchProducts();
        return result;
    }, [fetchProducts]);

    return {
        products,
        loading,
        fetchProducts,
        handleDelete,
        handleSave
    };
};

export default useProductsController;
