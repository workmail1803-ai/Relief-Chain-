import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
    const {
        cart,
        isCartOpen,
        setIsCartOpen,
        removeFromCart,
        updateQuantity,
        getCartTotal
    } = useCart();

    const navigate = useNavigate();

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/checkout');
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.5)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 1000
                        }}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: '100%',
                            maxWidth: '400px',
                            background: '#1a1a1a',
                            borderLeft: '1px solid #333',
                            zIndex: 1001,
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid #333',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', color: 'white' }}>
                                <ShoppingBag size={20} /> Your Cart
                            </h2>
                            <button
                                onClick={() => setIsCartOpen(false)}
                                style={{ background: 'transparent', border: 'none', color: '#999', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                            {cart.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#666', marginTop: '3rem' }}>
                                    <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <p>Your cart is empty.</p>
                                    <button
                                        onClick={() => setIsCartOpen(false)}
                                        style={{
                                            background: 'transparent', border: '1px solid #444',
                                            color: '#aaa', padding: '8px 16px', borderRadius: '4px',
                                            cursor: 'pointer', marginTop: '1rem'
                                        }}
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {cart.map((item) => (
                                        <div key={`${item.id}-${item.size}`} style={{
                                            background: '#242424',
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            border: '1px solid #333',
                                            display: 'flex',
                                            gap: '1rem'
                                        }}>
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                backgroundImage: `url(${item.image_url || 'https://via.placeholder.com/60'})`,
                                                backgroundSize: 'cover',
                                                borderRadius: '4px',
                                                backgroundColor: '#333'
                                            }} />

                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <h4 style={{ margin: 0, color: '#eee', fontSize: '0.95rem' }}>{item.name}</h4>
                                                    <span style={{ color: 'white', fontWeight: '600' }}>${item.price * item.quantity}</span>
                                                </div>
                                                <p style={{ margin: 0, color: '#888', fontSize: '0.8rem', marginBottom: '8px' }}>
                                                    {item.size ? `Size: ${item.size}` : item.category} • <span style={{ color: item.quantity >= item.stock ? '#ef4444' : '#666' }}>Max: {item.stock}</span>
                                                </p>

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#111', borderRadius: '4px', padding: '2px' }}>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.size, -1)}
                                                            style={{
                                                                width: '24px', height: '24px', background: 'transparent',
                                                                border: 'none', color: '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}
                                                        >-</button>
                                                        <span style={{ color: 'white', fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.size, 1)}
                                                            style={{
                                                                width: '24px', height: '24px', background: 'transparent',
                                                                border: 'none', color: '#ccc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                            }}
                                                        >+</button>
                                                    </div>

                                                    <button
                                                        onClick={() => removeFromCart(item.id, item.size)}
                                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.8 }}
                                                        title="Remove Item"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cart.length > 0 && (
                            <div style={{ padding: '1.5rem', borderTop: '1px solid #333', background: '#1a1a1a' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#ccc' }}>
                                    <span>Subtotal</span>
                                    <span style={{ color: 'white', fontWeight: 'bold' }}>${getCartTotal()}</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '1rem', textAlign: 'center' }}>
                                    Shipping & taxes calculated at checkout
                                </p>
                                <button
                                    onClick={handleCheckout}
                                    style={{
                                        width: '100%',
                                        background: '#6366f1',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        fontSize: '1rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    Proceed to Checkout <ArrowRight size={18} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
