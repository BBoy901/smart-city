import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Bookmark, MessageCircle, Phone, MapPin, Store } from 'lucide-react';
import { api, formatPrice, getImageUrl, getLocationString } from '../api/client';
import Header from '../components/Header';
import Loading from '../components/Loading';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProduct(id).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const product = data?.product;
  const related = data?.relatedProducts || [];

  const handleLike = async () => {
    try {
      const { liked } = await api.likeProduct(id);
      setData((d) => ({ ...d, product: { ...d.product, isLiked: liked } }));
    } catch { /* */ }
  };

  const handleSave = async () => {
    try {
      const { saved } = await api.saveProduct(id);
      setData((d) => ({ ...d, product: { ...d.product, isSaved: saved } }));
    } catch { /* */ }
  };

  if (loading) return <div className="page"><Loading /></div>;
  if (!product) return <div className="page"><Header title="Not Found" showBack /><div className="empty-state"><h3>Product not found</h3></div></div>;

  const image = product.images?.[0]?.url;
  const shop = product.shop;
  const sellerUser = shop?.sellerProfile?.user;

  return (
    <div className="page-no-nav">
      <Header title={product.name} showBack />
      {image ? (
        <img src={getImageUrl(image)} alt={product.name} className="product-detail-image" />
      ) : (
        <div className="product-detail-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>📦</div>
      )}

      <div className="product-detail-info">
        <h1 className="product-detail-name">{product.name}</h1>
        {product.price && <div className="product-detail-price">{formatPrice(product.price)}</div>}
        <div style={{ marginBottom: 12 }}>
          <span className="chip" style={{ fontSize: '0.75rem' }}>
            {product.availability === 'IN_STOCK' ? '✅ In Stock' : product.availability === 'LOW_STOCK' ? '⚠️ Low Stock' : '❌ Out of Stock'}
          </span>
        </div>
        {product.description && <p className="product-detail-desc">{product.description}</p>}

        <Link to={`/shop/${shop?.id}`} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Store size={24} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{shop?.name}</div>
            {shop?.location && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <MapPin size={12} style={{ display: 'inline' }} /> {getLocationString(shop.location)}
              </div>
            )}
          </div>
        </Link>
      </div>

      <div className="action-bar" style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50)', maxWidth: 'var(--max-width)', width: '100%', zIndex: 50 }}>
        <button className="btn-icon" onClick={handleLike}><Heart size={20} fill={product.isLiked ? 'var(--danger)' : 'none'} color={product.isLiked ? 'var(--danger)' : 'currentColor'} /></button>
        <button className="btn-icon" onClick={handleSave}><Bookmark size={20} fill={product.isSaved ? 'var(--primary)' : 'none'} color={product.isSaved ? 'var(--primary)' : 'currentColor'} /></button>
        {shop?.phone && <a href={`tel:${shop.phone}`} className="btn btn-secondary btn-sm"><Phone size={16} /> Call</a>}
        <Link to={`/messages?to=${sellerUser?.id}`} className="btn btn-primary btn-sm"><MessageCircle size={16} /> Message</Link>
        {shop?.location?.latitude && (
          <a href={`https://maps.google.com/?q=${shop.location.latitude},${shop.location.longitude}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
            <MapPin size={16} /> Map
          </a>
        )}
      </div>

      {related.length > 0 && (
        <div className="section" style={{ paddingBottom: 80 }}>
          <h3 className="section-title" style={{ marginBottom: 12 }}>More from {shop?.name}</h3>
          <div className="feed-grid" style={{ padding: 0 }}>
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
