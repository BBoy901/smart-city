import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import Header from '../../components/Header';

export default function SellerSetup() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: '', description: '', phone: '', businessHours: '',
    area: 'Kariakoo', street: '', building: '', floor: '', shopNumber: '',
    categoryIds: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  const toggleCategory = (id) => {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(id) ? f.categoryIds.filter((x) => x !== id) : [...f.categoryIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('phone', form.phone);
      fd.append('businessHours', form.businessHours);
      fd.append('categoryIds', JSON.stringify(form.categoryIds));

      const shop = await api.createShop(fd);
      await api.setShopLocation(shop.id, {
        area: form.area, street: form.street, building: form.building,
        floor: form.floor, shopNumber: form.shopNumber,
        city: 'Dar es Salaam', region: 'Dar es Salaam', country: 'Tanzania',
      });
      navigate('/seller');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-no-nav" style={{ padding: '16px' }}>
      <Header title="Create Shop" showBack />
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Shop Information</h3>
        <div className="form-group">
          <label className="form-label">Shop Name *</label>
          <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input className="form-input" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+255..." />
        </div>
        <div className="form-group">
          <label className="form-label">Business Hours</label>
          <input className="form-input" value={form.businessHours} onChange={(e) => setForm({ ...form, businessHours: e.target.value })} placeholder="Mon-Sat: 8AM - 7PM" />
        </div>

        <h3 style={{ fontWeight: 600, margin: '24px 0 12px' }}>Categories</h3>
        <div className="chips-row" style={{ marginBottom: 16 }}>
          {categories.map((c) => (
            <button type="button" key={c.id} className={`chip ${form.categoryIds.includes(c.id) ? 'active' : ''}`} onClick={() => toggleCategory(c.id)}>
              {c.name}
            </button>
          ))}
        </div>

        <h3 style={{ fontWeight: 600, margin: '24px 0 12px' }}>Location</h3>
        <div className="form-group">
          <label className="form-label">Area *</label>
          <input className="form-input" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Street</label>
          <input className="form-input" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Building</label>
          <input className="form-input" value={form.building} onChange={(e) => setForm({ ...form, building: e.target.value })} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Floor</label>
            <input className="form-input" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Shop No.</label>
            <input className="form-input" value={form.shopNumber} onChange={(e) => setForm({ ...form, shopNumber: e.target.value })} />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 16 }}>
          {loading ? 'Creating...' : 'Create Shop & Start Selling'}
        </button>
      </form>
    </div>
  );
}
