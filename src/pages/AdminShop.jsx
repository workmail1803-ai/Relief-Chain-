/**
 * AdminShop View - Admin product management page
 * This is a View in the MVC architecture
 */
import { useState, useEffect } from 'react';
import * as productModel from '../models/productModel';
import { Plus, Trash2, Edit2, Upload, X } from 'lucide-react';

const AdminShop = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null);

    const [formData, setFormData] = useState({
        name: '', price: '', category: 'T-Shirt', stock: '', description: '', image: null
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProductsData();
    }, []);

    const fetchProductsData = async () => {
        setLoading(true);
        const { data, error } = await productModel.fetchProducts();
        if (!error) setProducts(data || []);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            const { error } = await productModel.deleteProduct(id);
            if (!error) fetchProductsData();
        }
    };

    const handleEdit = (product) => {
        setEditProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            category: product.category,
            stock: product.stock,
            description: product.description,
            image: null // New image optional
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditProduct(null);
        setFormData({ name: '', price: '', category: 'T-Shirt', stock: '', description: '', image: null });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            let imageUrl = editProduct ? editProduct.image_url : null;

            // Handle Image Upload
            if (formData.image) {
                imageUrl = await productModel.uploadProductImage(formData.image);
            }

            const productData = {
                name: formData.name,
                price: parseFloat(formData.price),
                category: formData.category,
                stock: parseInt(formData.stock),
                description: formData.description,
                image_url: imageUrl
            };

            if (editProduct) {
                const { error } = await productModel.updateProduct(editProduct.id, productData);
                if (error) throw error;
            } else {
                const { error } = await productModel.createProduct(productData);
                if (error) throw error;
            }

            setIsModalOpen(false);
            fetchProductsData();

        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error saving product: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ color: 'white', fontSize: '2rem' }}>Shop Management</h1>
                <button
                    onClick={handleCreate}
                    style={{
                        background: '#6366f1', color: 'white', border: 'none', padding: '10px 20px',
                        borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold'
                    }}
                >
                    <Plus size={20} /> Add Product
                </button>
            </div>

            {/* Product Table */}
            <div style={{ background: '#1e1e1e', padding: '1rem', borderRadius: '12px', border: '1px solid #333', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#ddd' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                            <th style={{ padding: '1rem', width: '80px' }}>Image</th>
                            <th style={{ padding: '1rem' }}>Name</th>
                            <th style={{ padding: '1rem' }}>Category</th>
                            <th style={{ padding: '1rem' }}>Price</th>
                            <th style={{ padding: '1rem' }}>Stock</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid #2a2a2a' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ width: '50px', height: '50px', background: '#333', borderRadius: '4px', overflow: 'hidden' }}>
                                        <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', fontWeight: '500' }}>{p.name}</td>
                                <td style={{ padding: '1rem' }}>{p.category}</td>
                                <td style={{ padding: '1rem' }}>${p.price}</td>
                                <td style={{ padding: '1rem', color: p.stock < 5 ? '#ef4444' : '#10b981' }}>{p.stock}</td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button onClick={() => handleEdit(p)} style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer', marginRight: '1rem' }}>
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(p.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && !loading && <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>No products found.</div>}
            </div>

            {/* Edit/Create Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
                }}>
                    <div style={{
                        background: '#1a1a1a', width: '90%', maxWidth: '500px', padding: '2rem', borderRadius: '16px', border: '1px solid #333'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ color: 'white', margin: 0 }}>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}>
                                <X />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                className="form-input" placeholder="Product Name" required
                                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input
                                    className="form-input" type="number" placeholder="Price" required step="0.01"
                                    value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })}
                                />
                                <input
                                    className="form-input" type="number" placeholder="Stock" required
                                    value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })}
                                />
                            </div>

                            <select
                                className="form-input" required
                                value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option>T-Shirt</option>
                                <option>Hoodie</option>
                                <option>Shirt</option>
                                <option>Bracelets</option>
                                <option>Stickers</option>
                                <option>Others</option>
                            </select>

                            <textarea
                                className="form-input" placeholder="Description" rows="3"
                                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />

                            <div style={{ border: '1px dashed #444', padding: '1rem', borderRadius: '8px', textAlign: 'center', cursor: 'pointer' }}>
                                <label style={{ cursor: 'pointer', display: 'block' }}>
                                    <Upload style={{ display: 'block', margin: '0 auto 8px auto', color: '#666' }} />
                                    <span style={{ color: '#888', fontSize: '0.9rem' }}>{formData.image ? formData.image.name : 'Upload Product Image'}</span>
                                    <input
                                        type="file" className="hidden" accept="image/*" style={{ display: 'none' }}
                                        onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
                                    />
                                </label>
                            </div>

                            <button
                                type="submit" disabled={uploading}
                                style={{
                                    marginTop: '1rem', width: '100%', padding: '12px', background: '#6366f1', color: 'white',
                                    border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: uploading ? 'wait' : 'pointer'
                                }}
                            >
                                {uploading ? 'Saving...' : 'Save Product'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminShop;
