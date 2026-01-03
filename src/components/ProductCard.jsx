/**
 * ProductCard Component (MVC Pattern)
 * View Layer - Product display card component
 */
import { motion } from 'framer-motion';
import { ShoppingBag, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="glass-card glass-hover"
            style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: '0',
                position: 'relative'
            }}
        >
            <div style={{
                height: '220px',
                width: '100%',
                backgroundImage: `url(${product.image_url || 'https://via.placeholder.com/300'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
            }}>
                {product.stock <= 0 && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                    }}>
                        Out of Stock
                    </div>
                )}
            </div>

            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem', fontWeight: '600' }}>
                        {product.name}
                    </h3>
                    <span style={{
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: '#a5b4fc',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                    }}>
                        {product.category}
                    </span>
                </div>

                <p style={{ color: '#ccc', fontSize: '0.9rem', marginBottom: '1rem', flex: 1 }}>
                    {product.description?.substring(0, 60)}...
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'white', fontSize: '1.25rem', fontWeight: '700' }}>
                            ${product.price}
                        </span>
                        {product.stock > 0 && (
                            <span style={{ fontSize: '0.75rem', color: product.stock < 5 ? '#ef4444' : '#888', marginTop: '2px' }}>
                                {product.stock} items left
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                        style={{
                            background: product.stock > 0 ? '#646cff' : '#444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'background 0.2s'
                        }}
                    >
                        <Plus size={16} />
                        Add
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
