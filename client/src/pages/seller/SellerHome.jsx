import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import Header from '../../components/Header';
import Loading from '../../components/Loading';
import { Package, PlusCircle, Store } from 'lucide-react';

export default function SellerHome() {
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getMyShops(), api.getMyProducts()])
      .then(([s, p]) => { setShops(s); setProducts(p); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><Loading /></div>;

  return (
    <div className="page">
      <Header title="Seller Dashboard" />
      <div className="section">
        {shops.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <Store size={48} style={{ margin: '0 auto 16px', color: 'var(--primary)' }} />
            <h3 style={{ marginBottom: 8 }}>Set up your shop</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Create your shop profile to start selling</p>
            <Link to="/seller/setup" className="btn btn-primary">Create Shop</Link>
          </div>
        ) : (
          <>
            <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className="stat-card">
                <div className="stat-card-value">{shops.length}</div>
                <div className="stat-card-label">Shops</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-value">{products.length}</div>
                <div className="stat-card-label">Products</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <Link to="/seller/add-product" className="btn btn-primary" style={{ flex: 1 }}><PlusCircle size={18} /> Add Product</Link>
              <Link to="/seller/products" className="btn btn-secondary" style={{ flex: 1 }}><Package size={18} /> My Products</Link>
            </div>

            {shops.map((shop) => (
              <div key={shop.id} className="card" style={{ padding: 16, marginBottom: 12 }}>
                <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{shop.name}</div>
                {shop.location && <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 4 }}>📍 {shop.location.area}</div>}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>{shop._count?.products || 0} products</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
