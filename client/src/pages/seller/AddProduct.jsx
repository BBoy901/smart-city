import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import Header from '../../components/Header';

export default function AddProduct() {
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    shopId: '', name: '', description: '', price: '', categoryId: '', availability: 'IN_STOCK',
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.getMyShops(), api.getCategories()])
      .then(([s, c]) => {
        setShops(s);
        setCategories(c);
        if (s.length > 0) setForm((f) => ({ ...f, shopId: s[0].id }));
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      images.forEach((img) => fd.append('images', img));

      await api.createProduct(fd);
      navigate('/seller/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (shops.length === 0) {
    return (
      <div className="page">
        <Header title="Add Product" showBack />
        <div className="empty-state">
          <h3>Create a shop first</h3>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/seller/setup')}>Create Shop</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-no-nav" style={{ padding: '16px' }}>
      <Header title="Add Product" showBack />
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Shop</label>
          <select className="form-input form-select" value={form.shopId} onChange={(e) => setForm({ ...form, shopId: e.target.value })} required>
            {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Product Name *</label>
          <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Price (TSh)</label>
          <input className="form-input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-input form-select" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Availability</label>
          <select className="form-input form-select" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Product Images</label>
          <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files))} />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Publishing...' : 'Publish Product'}
        </button>
      </form>
    </div>
  );
}
