import { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import Loading from '../components/Loading';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [area, setArea] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tab, setTab] = useState('all');

  useEffect(() => { api.getCategories().then(setCategories).catch(console.error); }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query && !category && !area) return;
    setLoading(true);
    try {
      const data = await api.search({ q: query, category, area, type: tab });
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    try {
      const { liked } = await api.likeProduct(id);
      setResults((prev) => ({
        ...prev,
        products: prev.products?.map((p) => p.id === id ? { ...p, isLiked: liked } : p),
      }));
    } catch { /* */ }
  };

  const handleSave = async (id) => {
    try {
      const { saved } = await api.saveProduct(id);
      setResults((prev) => ({
        ...prev,
        products: prev.products?.map((p) => p.id === id ? { ...p, isSaved: saved } : p),
      }));
    } catch { /* */ }
  };

  return (
    <div className="page">
      <Header title="Search" />
      <form onSubmit={handleSearch}>
        <div className="search-bar">
          <SearchIcon size={20} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Search products, sellers..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8 }}>
          <input className="form-input" placeholder="Area (e.g. Kariakoo)" value={area} onChange={(e) => setArea(e.target.value)} style={{ flex: 1 }} />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </div>
      </form>

      <div className="tabs" style={{ margin: '0 16px' }}>
        {['all', 'products', 'sellers'].map((t) => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading && <Loading />}

      {results && !loading && (
        <>
          {results.products?.length > 0 && (
            <div className="section">
              <h3 className="section-title" style={{ marginBottom: 12 }}>Products ({results.products.length})</h3>
              <div className="feed-grid" style={{ padding: 0 }}>
                {results.products.map((p) => (
                  <ProductCard key={p.id} product={p} onLike={handleLike} onSave={handleSave} />
                ))}
              </div>
            </div>
          )}

          {results.sellers?.length > 0 && (
            <div className="section">
              <h3 className="section-title" style={{ marginBottom: 12 }}>Sellers ({results.sellers.length})</h3>
              {results.sellers.map((shop) => (
                <Link key={shop.id} to={`/shop/${shop.id}`} className="card" style={{ display: 'block', padding: 16, marginBottom: 12 }}>
                  <div style={{ fontWeight: 600 }}>{shop.name}</div>
                  {shop.location && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <MapPin size={14} /> {shop.location.area}, {shop.location.street}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                    {shop.products?.length || 0} products
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!results.products?.length && !results.sellers?.length && (
            <div className="empty-state">
              <h3>No results found</h3>
              <p>Try different keywords or filters</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
