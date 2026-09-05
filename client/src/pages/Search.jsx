import { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { api, formatPrice, getImageUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import Loading from '../components/Loading';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export default function SearchPage() {
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [area, setArea] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tab, setTab] = useState('all');
  const [highlightResults, setHighlightResults] = useState({ products: [], sellers: [] });
  const [highlightLoading, setHighlightLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => { api.getCategories().then(setCategories).catch(console.error); }, []);

  useEffect(() => {
    if (isAuthenticated) {
      api.getRecentSearches().then((searches) => setRecentSearches(searches.map((search) => search.query))).catch(() => setRecentSearches([]));
      return undefined;
    }
    try {
      setRecentSearches(JSON.parse(localStorage.getItem('smart-city-recent-searches') || '[]'));
    } catch {
      setRecentSearches([]);
    }
    return undefined;
  }, [isAuthenticated]);

  useEffect(() => {
    const searchTerm = query.trim();
    if (!showHints || searchTerm.length < 2) {
      setHighlightResults({ products: [], sellers: [] });
      setHighlightLoading(false);
      return undefined;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setHighlightLoading(true);
      try {
        const data = await api.search({ q: searchTerm, type: tab, limit: 4 });
        if (active) setHighlightResults({ products: data.products || [], sellers: data.sellers || [] });
      } catch {
        if (active) setHighlightResults({ products: [], sellers: [] });
      } finally {
        if (active) setHighlightLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, tab, showHints]);

  const handleSearch = async (e, searchValue = query, searchType = tab) => {
    e?.preventDefault();
    if (!searchValue && !category && !area) return;
    setShowHints(false);
    setLoading(true);
    try {
      const data = await api.search({ q: searchValue, category, area, type: searchType });
      setResults(data);
      if (searchValue.trim()) {
        const nextSearches = [searchValue.trim(), ...recentSearches.filter((search) => search.toLowerCase() !== searchValue.trim().toLowerCase())].slice(0, 8);
        setRecentSearches(nextSearches);
        if (!isAuthenticated) localStorage.setItem('smart-city-recent-searches', JSON.stringify(nextSearches));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyRecentSearch = (search) => {
    setQuery(search);
    setShowHints(true);
  };

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    setShowHints(true);
    if (results && (query.trim() || category || area)) handleSearch(undefined, query, nextTab);
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
      <Header
        title="Search"
        titleRight={(
          <div className="header-search-field">
            <SearchIcon size={17} />
            <input
              type="search"
              aria-label="Search products or sellers"
              placeholder="Type product or seller..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); if (results) setResults(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(e); }}
            />
          </div>
        )}
      />
      <form onSubmit={handleSearch}>
        <div style={{ padding: '0 16px 12px', display: 'flex', gap: 8 }}>
          <input className="form-input" placeholder="Area (e.g. Kariakoo)" value={area} onChange={(e) => setArea(e.target.value)} style={{ flex: 1 }} />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </div>
      </form>

      <div className="tabs" style={{ margin: '0 16px' }}>
        {['all', 'products', 'sellers'].map((t) => (
          <button type="button" key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => handleTabChange(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {!results && showHints && recentSearches.length > 0 && (
        <section className="recent-searches">
          <div className="recent-searches-heading"><span>Recent searches</span><button type="button" onClick={() => { setRecentSearches([]); if (!isAuthenticated) localStorage.removeItem('smart-city-recent-searches'); }}>Clear</button></div>
          <div className="recent-search-list">
            {recentSearches.map((search) => <button type="button" className="recent-search-item" key={search} onClick={() => applyRecentSearch(search)}><SearchIcon size={14} /> {search}</button>)}
          </div>
        </section>
      )}

      {!results && showHints && (highlightLoading || highlightResults.products.length > 0 || highlightResults.sellers.length > 0) && (
        <div className="search-highlights">
          <div className="search-highlights-heading"><span>{tab === 'sellers' ? 'Seller highlights' : tab === 'products' ? 'Product highlights' : 'Matching highlights'} for “{query.trim()}”</span>{highlightLoading && <span className="search-loading">Searching...</span>}</div>
          {highlightResults.products.map((product) => {
            const image = product.images?.[0]?.url;
            return <Link key={product.id} to={`/product/${product.id}`} className="search-highlight-item">
              <div className="search-highlight-image">{image ? <img src={getImageUrl(image)} alt={product.name} /> : <span>📦</span>}</div>
              <div className="search-highlight-info"><strong>{product.name}</strong><b>{formatPrice(product.price)}</b><small>{product.shop?.name} · {product.shop?.location?.area || 'Location available'}</small></div>
            </Link>;
          })}
          {highlightResults.sellers.map((shop) => <Link key={shop.id} to={`/shop/${shop.id}`} className="search-highlight-item">
            <div className="search-highlight-image"><span>🏪</span></div>
            <div className="search-highlight-info"><strong>{shop.name}</strong><small>{shop.location?.area || 'Seller location available'} · {shop.products?.length || 0} products</small></div>
          </Link>)}
        </div>
      )}

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
