/**
 * Shop View - Product listing page
 * This is a View in the MVC architecture
 */
import { useState, useEffect } from 'react';
import { fetchProducts } from '../models/productModel';
import { supabase } from '../supabaseClient';
import ProductCard from '../components/ProductCard';
import { ShoppingBag, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchProductsData();

        const channel = supabase
            .channel('shop-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
                fetchProductsData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchProductsData = async () => {
        setLoading(true);
        const { data, error } = await fetchProducts();

        if (error) {
            console.error('Error fetching products:', error);
        } else {
            setProducts(data || []);
        }
        setLoading(false);
    };

    const filteredProducts = products.filter(product => {
        const matchesCategory = category === 'All' || product.category === category;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const categories = ['All', 'T-Shirt', 'Hoodie', 'Bracelets', 'Stickers', 'Others'];

    return (
        <div style={{ minHeight: '100vh', padding: '2rem 1rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header / Hero */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    marginBottom: '1rem',
                    background: 'linear-gradient(to right, #6366f1, #a855f7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Relief Merchandise
                </h1>
                <p style={{ color: '#ccc', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
                    Shop for a cause. <span style={{ color: '#ef4444', fontWeight: 'bold' }}>80%</span> of profits go directly to donation funds,
                    and <span style={{ color: '#6366f1', fontWeight: 'bold' }}>20%</span> supports our operational costs.
                </p>
            </div>

            {/* Filters & Search */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                background: 'rgba(255,255,255,0.03)',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px', flex: '1 1 auto' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            style={{
                                background: category === cat ? '#6366f1' : 'transparent',
                                color: category === cat ? 'white' : '#aaa',
                                border: category === cat ? 'none' : '1px solid #444',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                fontSize: '0.9rem'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div style={{ position: 'relative', minWidth: '250px', flex: '0 1 300px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 10px 8px 36px',
                            background: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: 'white',
                            outline: 'none',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>
            </div>

            {/* Product Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>Loading shop...</div>
            ) : filteredProducts.length > 0 ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                    <ShoppingBag size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>No products found in this category.</p>
                </div>
            )}
        </div>
    );
};

export default Shop;
