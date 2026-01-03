/**
 * Donations View - Donation page with Zakat calculator
 * This is a View in the MVC architecture
 */
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Heart, Calculator } from 'lucide-react';

const Donations = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Donation Form States
    const [amount, setAmount] = useState('');
    const [donationType, setDonationType] = useState('general'); // 'general' or 'zakat'
    const [paymentMethod, setPaymentMethod] = useState('bkash');
    const [phone, setPhone] = useState('');
    const [trxId, setTrxId] = useState('');

    // Zakat Calculator States
    const [assets, setAssets] = useState({
        savings: 0,
        goldSilver: 0
    });
    const [zakatResult, setZakatResult] = useState(null);

    const handleCalculateZakat = () => {
        const totalAssets = parseFloat(assets.savings) + parseFloat(assets.goldSilver);
        // Clean 2.5% calculation on total assets (User request removed liabilities)
        if (totalAssets > 0) {
            setZakatResult({
                netWorth: totalAssets,
                amount: (totalAssets * 0.025).toFixed(2)
            });
        } else {
            setZakatResult({ netWorth: 0, amount: 0 });
        }
    };

    const handleDonationSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!user) {
                alert("Please login to donate.");
                setLoading(false);
                return;
            }

            const { error } = await supabase
                .from('donations')
                .insert([{
                    user_id: user.id,
                    amount: parseFloat(amount),
                    donation_type: donationType,
                    payment_method: paymentMethod,
                    phone_last_4: phone.slice(-4),
                    transaction_id: trxId,
                    status: 'pending' // Admin must verify TrxID
                }]);

            if (error) throw error;

            alert("Thank you! Your donation has been recorded and is pending verification.");
            setAmount('');
            setTrxId('');
            setPhone('');
        } catch (error) {
            console.error(error);
            alert("Error processing donation: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: '2rem', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}
        >
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
                    Make a Difference Today
                </h1>
                <p style={{ color: '#aaa', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
                    Your general donations allow us to allocate funds where they are needed most—whether it's an urgent flood response or a critical medical surgery.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

                {/* General Donation Panel */}
                <div className="glass-card" style={{ padding: '2rem', border: '1px solid #333', background: '#111', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                        <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.2)', borderRadius: '12px', color: '#6366f1' }}>
                            <Heart size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'white' }}>General Fund</h2>
                    </div>

                    <form onSubmit={handleDonationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Type Toggle */}
                        <div style={{ display: 'flex', background: '#222', padding: '4px', borderRadius: '8px' }}>
                            <button type="button" onClick={() => setDonationType('general')}
                                style={{ flex: 1, padding: '10px', background: donationType === 'general' ? '#6366f1' : 'transparent', color: donationType === 'general' ? 'white' : '#888', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                General
                            </button>
                            <button type="button" onClick={() => setDonationType('zakat')}
                                style={{ flex: 1, padding: '10px', background: donationType === 'zakat' ? '#10b981' : 'transparent', color: donationType === 'zakat' ? 'white' : '#888', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Zakat
                            </button>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '8px' }}>Amount (BDT)</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="e.g. 1000"
                                    required
                                    style={{ width: '100%', padding: '12px 12px 12px 40px', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px', fontSize: '1.1rem' }}
                                />
                                <span style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#666', fontWeight: 'bold' }}>৳</span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '8px' }}>bKash Transaction ID</label>
                            <input
                                type="text"
                                value={trxId}
                                onChange={(e) => setTrxId(e.target.value)}
                                placeholder="e.g. 8N7S6D..."
                                required
                                style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', color: '#888', marginBottom: '8px' }}>Phone (Last 4)</label>
                                <input
                                    type="text"
                                    maxLength="4"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="xxxx"
                                    required
                                    style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#888', marginBottom: '8px' }}>Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '8px' }}
                                >
                                    <option value="bkash">bKash</option>
                                    <option value="card" disabled>Card (Soon)</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ background: '#2a2a2a', padding: '1rem', borderRadius: '8px', border: '1px dashed #444' }}>
                            <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>Official bKash Merchant</p>
                            <p style={{ margin: '4px 0 0 0', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px' }}>01700000000</p>
                        </div>

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '14px', background: donationType === 'zakat' ? '#10b981' : '#6366f1',
                            color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}>
                            {loading ? 'Processing...' : `Confirm ${donationType === 'zakat' ? 'Zakat' : 'Donation'}`}
                        </button>
                    </form>
                </div>

                {/* Zakat Calculator Panel */}
                <div className="glass-card" style={{ padding: '2rem', border: '1px solid #333', background: '#111', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                        <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '12px', color: '#10b981' }}>
                            <Calculator size={24} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'white' }}>Zakat Calculator</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                        <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            Zakat is 2.5% of your total wealth held for a lunar year. Enter your assets below to calculate.
                        </p>

                        <div style={{ display: 'grid', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', color: '#aaa', fontSize: '0.9rem', marginBottom: '4px' }}>Cash & Bank Savings</label>
                                <input type="number"
                                    onChange={(e) => setAssets({ ...assets, savings: e.target.value })}
                                    style={{ width: '100%', padding: '10px', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '6px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#aaa', fontSize: '0.9rem', marginBottom: '4px' }}>Gold & Silver (Value)</label>
                                <input type="number"
                                    onChange={(e) => setAssets({ ...assets, goldSilver: e.target.value })}
                                    style={{ width: '100%', padding: '10px', background: '#1a1a1a', border: '1px solid #333', color: 'white', borderRadius: '6px' }} />
                            </div>
                        </div>

                        <button onClick={handleCalculateZakat} style={{
                            marginTop: '1rem', width: '100%', padding: '12px', background: '#222',
                            color: '#10b981', border: '1px solid #10b981', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer'
                        }}>
                            Calculate
                        </button>

                        {zakatResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{ marginTop: 'auto', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ color: '#aaa', fontSize: '0.9rem' }}>Net Worth:</span>
                                    <span style={{ color: 'white', fontWeight: 'bold' }}>৳{zakatResult.netWorth}</span>
                                </div>
                                <div style={{ width: '100%', height: '1px', background: 'rgba(16, 185, 129, 0.2)', margin: '8px 0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>Zakat Due:</span>
                                    <span style={{ color: '#10b981', fontSize: '1.4rem', fontWeight: 'bold' }}>৳{zakatResult.amount}</span>
                                </div>
                                <button onClick={() => { setAmount(zakatResult.amount); setDonationType('zakat'); }} style={{ width: '100%', marginTop: '10px', background: '#10b981', color: '#000', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                    Pay This Amount
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Donations;
