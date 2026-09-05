import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import { Users, Package, Store, Tag, Settings, LogOut, Power } from 'lucide-react';
import { Link, Routes, Route, useSearchParams } from 'react-router-dom';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  const o = stats?.overview || {};
  const manageItems = [
    { to: '/admin/users', icon: Users, label: 'Customers', count: o.totalCustomers },
    { to: '/admin/users?role=SELLER', icon: Store, label: 'Sellers', count: o.totalSellers },
    { to: '/admin/products', icon: Package, label: 'Products', count: o.totalProducts },
    { to: '/admin/categories', icon: Tag, label: 'Categories', count: o.totalCategories },
    { to: '/admin/shops', icon: Store, label: 'Shops', count: o.totalShops },
  ];

  return (
    <div>
      <div className="admin-eyebrow">Kariakoo Pilot · Overview</div>
      <div className="stat-grid admin-overview-grid">
        <div className="stat-card"><div className="stat-card-value">{o.totalCustomers}</div><div className="stat-card-label">Customers</div></div>
        <div className="stat-card"><div className="stat-card-value">{o.totalSellers}</div><div className="stat-card-label">Sellers</div></div>
        <div className="stat-card"><div className="stat-card-value">{o.totalProducts}</div><div className="stat-card-label">Products listed</div></div>
        <div className="stat-card"><div className="stat-card-value">{o.totalMessages}</div><div className="stat-card-label">Messages sent</div></div>
      </div>

      <div className="admin-dashboard-section">
        <h2 className="admin-section-title">Most searched products</h2>
        <div className="admin-list-card admin-search-list">
          {(stats?.topSearches?.length ? stats.topSearches : stats?.topProducts?.map((p) => ({ query: p.name, count: p.viewCount })))?.map((item, index) => (
            <div className="admin-ranking-row" key={`${item.query}-${index}`}>
              <span className="admin-rank">{index + 1}</span>
              <span className="admin-ranking-name">{item.query}</span>
              <span className="admin-ranking-meta">{item.count} {item.count === 1 ? 'search' : 'searches'}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="admin-dashboard-section">
        <h2 className="admin-section-title">Popular Categories</h2>
        <div className="admin-category-list">
          {stats?.popularCategories?.slice(0, 6).map((category) => (
            <div className="admin-category-item" key={category.id}>
              <span>{category.icon} {category.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-dashboard-section">
        <h2 className="admin-section-title">Manage</h2>
        <div className="admin-manage-grid">
          {manageItems.map(({ to, icon: Icon, label, count }) => (
            <Link className="admin-manage-card" to={to} key={label}>
              <Icon size={20} />
              <span>{label}</span>
              <strong>{count ?? 0}</strong>
            </Link>
          ))}
          <div className="admin-manage-card admin-manage-disabled"><Settings size={20} /><span>Settings</span><strong>-</strong></div>
        </div>
      </section>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');
  useEffect(() => { api.getAdminUsers(role ? { role } : {}).then(setUsers).catch(console.error); }, [role]);

  const toggle = async (id, isActive) => {
    await api.toggleUserStatus(id, !isActive);
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isActive: !isActive } : u));
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>{role === 'SELLER' ? 'Sellers' : 'Customers'}</h1>
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Email</th><th>Roles</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.roles.join(', ')}</td>
              <td>{u.isActive ? '✅ Active' : '❌ Disabled'}</td>
              <td><button className="btn btn-sm btn-secondary" onClick={() => toggle(u.id, u.isActive)}>{u.isActive ? 'Disable' : 'Enable'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminProducts() {
  const [products, setProducts] = useState([]);
  useEffect(() => { api.getAdminProducts().then(setProducts).catch(console.error); }, []);

  const toggle = async (id, isActive) => {
    await api.toggleProductStatus(id, !isActive);
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isActive: !isActive } : p));
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Products</h1>
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Shop</th><th>Price</th><th>Views</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.shop?.name}</td>
              <td>{p.price ? `TSh ${p.price.toLocaleString()}` : '-'}</td>
              <td>{p.viewCount}</td>
              <td>{p.isActive ? '✅' : '❌'}</td>
              <td><button className="btn btn-sm btn-secondary" onClick={() => toggle(p.id, p.isActive)}>{p.isActive ? 'Disable' : 'Enable'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminShops() {
  const [shops, setShops] = useState([]);
  useEffect(() => { api.getAdminShops().then(setShops).catch(console.error); }, []);

  const toggle = async (id, isActive) => {
    await api.toggleShopStatus(id, !isActive);
    setShops((prev) => prev.map((s) => s.id === id ? { ...s, isActive: !isActive } : s));
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Shops</h1>
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Owner</th><th>Area</th><th>Products</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          {shops.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.sellerProfile?.user?.name}</td>
              <td>{s.location?.area || '-'}</td>
              <td>{s._count?.products}</td>
              <td>{s.isActive ? '✅' : '❌'}</td>
              <td><button className="btn btn-sm btn-secondary" onClick={() => toggle(s.id, s.isActive)}>{s.isActive ? 'Disable' : 'Enable'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user?.roles?.includes('ADMIN')) {
    return <div style={{ padding: 48, textAlign: 'center' }}><h2>Admin access required</h2><Link to="/login">Login</Link></div>;
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-brand"><span className="admin-brand-mark" />Smart City <span className="admin-role">ADMIN</span></div>
        <button className="admin-logout" title="Log out" onClick={() => { logout(); navigate('/'); }}><Power size={18} /></button>
      </header>
      <main className="admin-main">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="shops" element={<AdminShops />} />
          <Route path="categories" element={<AdminCategories />} />
        </Routes>
      </main>
    </div>
  );
}

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  useEffect(() => { api.getAdminCategories().then(setCategories).catch(console.error); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const cat = await api.createCategory({ name, icon: '📦' });
    setCategories((prev) => [...prev, cat]);
    setName('');
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Categories</h1>
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" required style={{ maxWidth: 300 }} />
        <button type="submit" className="btn btn-primary btn-sm">Add</button>
      </form>
      <table className="admin-table">
        <thead><tr><th>Name</th><th>Products</th><th>Status</th></tr></thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}><td>{c.icon} {c.name}</td><td>{c._count?.products}</td><td>{c.isActive ? '✅' : '❌'}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
