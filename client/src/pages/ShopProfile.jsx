import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react';
import { api, getLocationString } from '../api/client';
import Header from '../components/Header';
import Loading from '../components/Loading';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

export default function ShopProfile() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [tab, setTab] = useState('products');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getShop(id).then(setShop).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page"><Loading /></div>;
  if (!shop) return <div className="page"><Header title="Not Found" showBack /><div className="empty-state"><h3>Shop not found</h3></div></div>;

  const sellerUser = shop.sellerProfile?.user;

  return (
    <div className="page-no-nav">
      <Header title={shop.name} showBack />
      <div className="seller-banner" />
      <div className="seller-info">
        <div className="seller-avatar">🏪</div>
        <h1 className="seller-name">{shop.name}</h1>
        {shop.description && <p className="seller-desc">{shop.description}</p>}
        {shop.shopCategories?.length > 0 && (
          <div className="chips-row" style={{ marginTop: 8 }}>
            {shop.shopCategories.map((sc) => (
              <span key={sc.categoryId} className="chip">{sc.category.name}</span>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {shop.phone && <a href={`tel:${shop.phone}`} className="btn btn-primary btn-sm"><Phone size={16} /> Call</a>}
          <Link to={`/messages?to=${sellerUser?.id}`} className="btn btn-secondary btn-sm"><MessageCircle size={16} /> Message</Link>
        </div>
      </div>

      <div className="tabs" style={{ margin: '16px' }}>
        {['products', 'about', 'location'].map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'products' && (
        <div className="feed-grid">
          {shop.products?.length > 0 ? shop.products.map((p) => (
            <ProductCard key={p.id} product={{ ...p, shop }} />
          )) : (
            <div className="empty-state"><p>No products listed yet</p></div>
          )}
        </div>
      )}

      {tab === 'about' && (
        <div className="section">
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>About</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{shop.description || 'No description available.'}</p>
          {shop.businessHours && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={16} /> Business Hours</h4>
              <p style={{ color: 'var(--text-secondary)' }}>{shop.businessHours}</p>
            </div>
          )}
          {shop.phone && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={16} /> Phone</h4>
              <a href={`tel:${shop.phone}`} style={{ color: 'var(--primary)' }}>{shop.phone}</a>
            </div>
          )}
        </div>
      )}

      {tab === 'location' && (
        <div className="section">
          {shop.location ? (
            <>
              <h3 style={{ fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={18} /> Location</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{getLocationString(shop.location)}</p>
              {shop.location.latitude && (
                <a
                  href={`https://maps.google.com/?q=${shop.location.latitude},${shop.location.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                >
                  <MapPin size={16} /> Get Directions
                </a>
              )}
            </>
          ) : (
            <div className="empty-state"><p>Location not provided</p></div>
          )}
        </div>
      )}
    </div>
  );
}
