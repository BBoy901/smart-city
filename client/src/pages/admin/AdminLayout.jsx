import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import { LayoutDashboard, Users, Package, Store, Tag, BarChart3, LogOut } from 'lucide-react';
import { Link, Routes, Route, NavLink } from 'react-router-dom';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  const o = stats?.overview || {};

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-card-value">{o.totalCustomers}</div><div className="stat-card-label">Customers</div></div>
        <div className="stat-card"><div className="stat-card-value">{o.totalSellers}</div><div className="stat-card-label">Sellers</div></div>
        <div className="stat-card"><div className="stat-card-value">{o.totalProducts}</div><div className="stat-card-label">Products</div></div>
        <div className="stat-card"><div className="stat-card-value">{o.totalShops}</div><div className="stat-card-label">Shops</div></div>
        <div className="stat-card"><div className="stat-card-value">{o.productViews}</div><div className="stat-card-label">Product Views</div></div>
        <div className="stat-card"><div className="stat-card-value">{o.totalMessages}</div><div className="stat-card-label">Messages</div></div>
        <div className="stat-card"><div className="stat-card-value">{o.totalSearches}</div><div className="stat-card-label">Searches</div></div>
        <div className="stat-card"><div className="stat-card-value">{o.shopViews}</div><div className="stat-card-label">Shop Views</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <h2 style={{ fontWeight: 600, marginBottom: 12 }}>Top Products</h2>
          <table className="admin-table">
            <thead><tr><th>Product</th><th>Views</th><th>Likes</th></tr></thead>
            <tbody>
              {stats?.topProducts?.map((p) => (
                <tr key={p.id}><td>{p.name}</td><td>{p.viewCount}</td><td>{p.likeCount}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2 style={{ fontWeight: 600, marginBottom: 12 }}>Top Searches</h2>
          <table className="admin-table">
            <thead><tr><th>Query</th><th>Count</th></tr></thead>
            <tbody>
              {stats?.topSearches?.map((s, i) => (
                <tr key={i}><td>{s.query}</td><td>{s.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => { api.getAdminUsers().then(setUsers).catch(console.error); }, []);

  const toggle = async (id, isActive) => {
    await api.toggleUserStatus(id, !isActive);
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isActive: !isActive } : u));
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 24 }}>Users</h1>
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

  const links = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/products', icon: Package, label: 'Products' },
    { to: '/admin/shops', icon: Store, label: 'Shops' },
    { to: '/admin/categories', icon: Tag, label: 'Categories' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 32 }}>🏙️ Smart City</div>
        <nav>
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <button className="admin-nav-link" style={{ marginTop: 'auto', position: 'absolute', bottom: 24 }} onClick={() => { logout(); navigate('/'); }}>
          <LogOut size={18} /> Logout
        </button>
      </aside>
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
