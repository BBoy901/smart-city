import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import Loading from '../components/Loading';

const SECTIONS = [
  { key: 'for-you', label: 'For You' },
  { key: 'trending', label: 'Trending' },
  { key: 'new', label: 'New' },
  { key: 'popular', label: 'Popular' },
];

export default function Home() {
  const { user } = useAuth();
  const [section, setSection] = useState('for-you');
  const [categoryId, setCategoryId] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getFeed({ section });
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [section]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  const visibleProducts = categoryId
    ? [...products].sort((first, second) => Number(second.categoryId === categoryId) - Number(first.categoryId === categoryId))
    : products;

  const handleLike = async (id) => {
    try {
      const { liked } = await api.likeProduct(id);
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isLiked: liked, likeCount: p.likeCount + (liked ? 1 : -1) } : p));
    } catch { /* guest */ }
  };

  const handleSave = async (id) => {
    try {
      const { saved } = await api.saveProduct(id);
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isSaved: saved } : p));
    } catch { /* guest */ }
  };

  return (
    <div className="page home-page">
      <Header
        title="Home"
        titleRight={(
          <div className="home-section-tabs">
            {SECTIONS.map((s) => (
              <button key={s.key} className={`chip ${section === s.key ? 'active' : ''}`} onClick={() => setSection(s.key)}>
                {s.label}
              </button>
            ))}
          </div>
        )}
      />
      <div className="scroll-row home-category-row">
        <button className={`chip ${!categoryId ? 'active' : ''}`} onClick={() => setCategoryId('')}>All</button>
        {categories.map((c) => (
          <button key={c.id} className={`chip ${categoryId === c.id ? 'active' : ''}`} onClick={() => setCategoryId(c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      {user && (
        <div style={{ padding: '0 16px 8px' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            {section === 'for-you' ? 'Personalized for you' : `Showing ${section} products`}
          </p>
        </div>
      )}

      {loading ? <Loading /> : visibleProducts.length === 0 ? (
        <div className="empty-state">
          <h3>No products yet</h3>
          <p>Check back soon for new discoveries in Kariakoo!</p>
        </div>
      ) : (
        <div className="feed-grid">
          {visibleProducts.map((p) => (
            <ProductCard key={p.id} product={p} onLike={handleLike} onSave={handleSave} />
          ))}
        </div>
      )}
    </div>
  );
}
