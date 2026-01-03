/**
 * ProductDetails View - Single product details page
 * This is a View in the MVC architecture
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as productModel from '../models/productModel';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        const { data, error } = await productModel.fetchProductById(id);

        if (!error && data) {
            setProduct(data);
            // Default size selection for clothes
            if (['T-Shirt', 'Hoodie', 'Shirt'].includes(data.category)) {
                setSelectedSize('M');
            }
        }
        setLoading(false);
    };

    const handleAddToCart = () => {
        if (!product) return;
        addToCart(product, quantity, selectedSize);
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#888' }}>Loading product...</div>;
    if (!product) return <div style={{ padding: '4rem', textAlign: 'center', color: '#ef4444' }}>Product not found.</div>;

    const isClothing = ['T-Shirt', 'Hoodie', 'Shirt'].includes(product.category);
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '2rem 1rem 4rem',
                minHeight: '80vh'
            }}
        >
            <button
                onClick={() => navigate('/shop')}
                style={{
                    background: 'transparent', border: 'none', color: '#ccc',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    cursor: 'pointer', marginBottom: '2rem'
                }}
            >
                <ArrowLeft size={20} /> Back to Shop
            </button>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '3rem',
                alignItems: 'start'
            }}>
                {/* Product Image */}
                <div style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #333',
                    background: '#1a1a1a',
                    minHeight: '400px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <img
                        src={product.image_url || 'https://via.placeholder.com/600'}
                        alt={product.name}
                        style={{ width: '100%', height: 'auto', maxHeight: '600px', objectFit: 'contain' }}
                    />
                </div>

                {/* Product Info */}
                <div>
                    <span style={{ color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem' }}>
                        {product.category}
                    </span>

                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '1rem 0', color: 'white' }}>
                        {product.name}
                    </h1>

                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#fff', marginBottom: '1.5rem' }}>
                        ${product.price}
                    </div>

                    <p style={{ color: '#aaa', lineHeight: '1.6', marginBottom: '2rem', whiteSpace: 'pre-line' }}>
                        {product.description}
                    </p>

                    {/* Options */}
                    {isClothing && (
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem' }}>Select Size</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        style={{
                                            width: '45px', height: '45px',
                                            borderRadius: '8px',
                                            border: selectedSize === size ? '2px solid #6366f1' : '1px solid #444',
                                            background: selectedSize === size ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                            color: selectedSize === size ? '#fff' : '#888',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem' }}>Quantity</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                style={{ width: '40px', height: '40px', background: '#333', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}
                            >-</button>
                            <span style={{ fontSize: '1.2rem', color: 'white', width: '30px', textAlign: 'center' }}>{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                style={{ width: '40px', height: '40px', background: '#333', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}
                            >+</button>
                        </div>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: product.stock > 0 ? '#6366f1' : '#444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: '700',
                            fontSize: '1.1rem',
                            cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            boxShadow: product.stock > 0 ? '0 4px 20px rgba(99, 102, 241, 0.4)' : 'none'
                        }}
                    >
                        <ShoppingBag /> {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#888', fontSize: '0.9rem' }}>
                            <Truck size={20} color="#6366f1" />
                            <span>Fast Delivery within 3-5 days</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#888', fontSize: '0.9rem' }}>
                            <ShieldCheck size={20} color="#10b981" />
                            <span>Secure Payment</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductDetails;
