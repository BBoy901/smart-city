import { useState, useEffect } from 'react';
import { api } from '../api/client';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Saved() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    api.getSaved().then(setProducts).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="page">
        <Header title="Saved" />
        <div className="empty-state">
          <h3>Login to view saved products</h3>
          <Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Header title="Saved Products" />
      {loading ? <Loading /> : products.length === 0 ? (
        <div className="empty-state">
          <h3>No saved products</h3>
          <p>Save products you like to find them later</p>
        </div>
      ) : (
        <div className="feed-grid">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
