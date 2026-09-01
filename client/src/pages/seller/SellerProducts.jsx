import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, formatPrice } from '../../api/client';
import Header from '../../components/Header';
import Loading from '../../components/Loading';
import { Edit, Trash2 } from 'lucide-react';

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyProducts().then(setProducts).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="page">
      <Header title="My Products" />
      {loading ? <Loading /> : products.length === 0 ? (
        <div className="empty-state">
          <h3>No products yet</h3>
          <Link to="/seller/add-product" className="btn btn-primary" style={{ marginTop: 16 }}>Add Product</Link>
        </div>
      ) : (
        <div className="section">
          {products.map((p) => (
            <div key={p.id} className="card" style={{ display: 'flex', gap: 12, padding: 12, marginBottom: 12 }}>
              <div style={{ width: 64, height: 64, borderRadius: 8, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                {p.images?.[0] ? <img src={p.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} /> : '📦'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                {p.price && <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem' }}>{formatPrice(p.price)}</div>}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.availability.replace('_', ' ')}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Link to={`/seller/edit-product/${p.id}`} className="btn-icon"><Edit size={16} /></Link>
                <button className="btn-icon" onClick={() => handleDelete(p.id)}><Trash2 size={16} color="var(--danger)" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
