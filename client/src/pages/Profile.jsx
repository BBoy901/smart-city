import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import Loading from '../components/Loading';
import { Link } from 'react-router-dom';
import { Heart, Clock, Store, ArrowRightLeft } from 'lucide-react';

export default function Profile() {
  const { user, logout, switchMode, addRole, isSeller, isCustomer, isSellerMode } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('saved');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const fetcher = tab === 'saved' ? api.getSaved : tab === 'liked' ? api.getLiked : api.getRecent;
    fetcher().then(setItems).catch(console.error).finally(() => setLoading(false));
  }, [tab, user]);

  const handleSwitchMode = async () => {
    const newMode = isSellerMode ? 'CUSTOMER' : 'SELLER';
    await switchMode(newMode);
    navigate(newMode === 'SELLER' ? '/seller' : '/');
  };

  const handleBecomeSeller = async () => {
    await addRole('SELLER');
    navigate('/seller/setup');
  };

  const handleBecomeCustomer = async () => {
    await addRole('CUSTOMER');
    navigate('/onboarding');
  };

  if (!user) {
    return (
      <div className="page">
        <Header title="Profile" />
        <div className="empty-state">
          <h3>Login to view your profile</h3>
          <Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Header title="Profile" />
      <div className="profile-header">
        <div className="profile-avatar">{user.name?.[0]?.toUpperCase()}</div>
        <div className="profile-name">{user.name}</div>
        <div className="profile-email">{user.email}</div>
        <div style={{ marginTop: 12 }}>
          <span className="mode-badge">
            {isSellerMode ? '🏪 Seller Mode' : '🛍️ Customer Mode'}
          </span>
        </div>
        {isCustomer && isSeller && (
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 12 }} onClick={handleSwitchMode}>
            <ArrowRightLeft size={16} /> Switch to {isSellerMode ? 'Customer' : 'Seller'}
          </button>
        )}
        {!isSeller && isCustomer && (
          <button className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={handleBecomeSeller}>
            <Store size={16} /> Become a Seller
          </button>
        )}
        {!isCustomer && isSeller && (
          <button className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={handleBecomeCustomer}>
            🛍️ Become a Customer
          </button>
        )}
      </div>

      <div className="tabs" style={{ margin: '0 16px' }}>
        <button className={`tab ${tab === 'saved' ? 'active' : ''}`} onClick={() => setTab('saved')}>Saved</button>
        <button className={`tab ${tab === 'liked' ? 'active' : ''}`} onClick={() => setTab('liked')}>Liked</button>
        <button className={`tab ${tab === 'recent' ? 'active' : ''}`} onClick={() => setTab('recent')}>Recent</button>
      </div>

      {loading ? <Loading /> : items.length === 0 ? (
        <div className="empty-state">
          {tab === 'saved' && <><Heart size={48} /><h3>No saved products</h3></>}
          {tab === 'liked' && <><Heart size={48} /><h3>No liked products</h3></>}
          {tab === 'recent' && <><Clock size={48} /><h3>No recently viewed</h3></>}
        </div>
      ) : (
        <div className="feed-grid">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      <div style={{ padding: 16 }}>
        <button className="btn btn-danger btn-block" onClick={() => { logout(); navigate('/'); }}>
          Logout
        </button>
      </div>
    </div>
  );
}
