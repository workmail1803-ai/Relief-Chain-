/**
 * Checkout View - Shopping cart checkout page
 * This is a View in the MVC architecture
 */
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as productModel from '../models/productModel';
import { CreditCard, MapPin, Phone, User, CheckCircle } from 'lucide-react';

const Checkout = () => {
    const { cart, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Success
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        phone: '',
        email: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('bkash');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Process "Payment" (Mock)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 2. Decrement Stock for each item
            for (const item of cart) {
                // Fetch current stock to ensure we don't go below 0 (simple check)
                const { data: product, error: fetchError } = await productModel.getProductStock(item.id);

                if (fetchError || !product) {
                    console.error(`Error fetching stock for ${item.name}`, fetchError);
                    continue; // Skip or handle error
                }

                if (product.stock < item.quantity) {
                    alert(`Not enough stock for ${item.name}. Available: ${product.stock}`);
                    setLoading(false);
                    return; // Stop checkout
                }

                const { error: updateError } = await productModel.updateProductStock(item.id, product.stock - item.quantity);

                if (updateError) {
                    console.error(`Error updating stock for ${item.name}`, updateError);
                    // You might want to rollback here in a real app
                }
            }

            // 3. Success
            setStep(3);
            clearCart();

        } catch (error) {
            console.error("Checkout error:", error);
            alert("An error occurred during checkout.");
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0 && step !== 3) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#ccc' }}>
                <h2>Your cart is empty</h2>
                <button onClick={() => navigate('/shop')} style={{ marginTop: '1rem', padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Go to Shop</button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', minHeight: '80vh' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center', color: 'white' }}>Checkout</h1>

            {step === 3 ? (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ textAlign: 'center', padding: '3rem', background: '#1a1a1a', borderRadius: '16px', border: '1px solid #333' }}
                >
                    <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ color: 'white' }}>Order Placed Successfully!</h2>
                    <p style={{ color: '#aaa', marginBottom: '2rem' }}>Thank you for your purchase. Your contribution helps our relief efforts.</p>
                    <button
                        onClick={() => navigate('/shop')}
                        style={{ padding: '12px 24px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                    >
                        Continue Shopping
                    </button>
                </motion.div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                    {/* Form Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Delivery Info */}
                        <div className="glass-card" style={{ padding: '1.5rem', background: '#1e1e1e', borderRadius: '12px', border: '1px solid #333' }}>
                            <h3 style={{ color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <MapPin size={20} color="#6366f1" /> Delivery Information
                            </h3>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <input className="form-input" name="name" placeholder="Full Name" onChange={handleChange} required />
                                <input className="form-input" name="phone" placeholder="Phone Number" onChange={handleChange} required />
                                <input className="form-input" name="address" placeholder="Address" onChange={handleChange} required />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <input className="form-input" name="city" placeholder="City" onChange={handleChange} required />
                                    <input className="form-input" name="email" placeholder="Email (Optional)" onChange={handleChange} />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="glass-card" style={{ padding: '1.5rem', background: '#1e1e1e', borderRadius: '12px', border: '1px solid #333' }}>
                            <h3 style={{ color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CreditCard size={20} color="#6366f1" /> Payment Method
                            </h3>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => setPaymentMethod('bkash')}
                                    style={{
                                        flex: 1, padding: '1rem', borderRadius: '8px',
                                        border: paymentMethod === 'bkash' ? '2px solid #e2136e' : '1px solid #444',
                                        background: paymentMethod === 'bkash' ? 'rgba(226, 19, 110, 0.1)' : 'transparent',
                                        color: 'white', cursor: 'pointer', fontWeight: '600'
                                    }}
                                >
                                    bKash
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    style={{
                                        flex: 1, padding: '1rem', borderRadius: '8px',
                                        border: paymentMethod === 'card' ? '2px solid #6366f1' : '1px solid #444',
                                        background: paymentMethod === 'card' ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                        color: 'white', cursor: 'pointer', fontWeight: '600'
                                    }}
                                >
                                    Credit Card
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div style={{ alignSelf: 'start' }}>
                        <div style={{ background: '#242424', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
                            <h3 style={{ color: 'white', margin: '0 0 1.5rem 0' }}>Order Summary</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                                {cart.map(item => (
                                    <div key={`${item.id}-${item.size}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#ccc' }}>
                                        <span>{item.quantity}x {item.name} {item.size && `(${item.size})`}</span>
                                        <span>${item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ borderTop: '1px solid #444', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                                <span>Total</span>
                                <span>${getCartTotal()}</span>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: loading ? '#666' : '#6366f1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '700',
                                    fontSize: '1rem',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {loading ? 'Processing...' : `Pay $${getCartTotal()}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Checkout;
