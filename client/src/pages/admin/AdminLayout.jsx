import AdminSettings from "./AdminSettings";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading";
import {
  Users,
  Package,
  Store,
  Tag,
  Settings,
  LogOut,
  Power,
} from "lucide-react";
import { Link, Routes, Route, useSearchParams } from "react-router-dom";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAdminStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  const o = stats?.overview || {};
  const manageItems = [
    {
      to: "/admin/users",
      icon: Users,
      label: "Customers",
      count: o.totalCustomers,
    },
    {
      to: "/admin/users?role=SELLER",
      icon: Store,
      label: "Sellers",
      count: o.totalSellers,
    },
    {
      to: "/admin/sellers",
      icon: Users,
      label: "Pending Sellers",
      count: o.pendingSellers,
    },
    {
      to: "/admin/products",
      icon: Package,
      label: "Products",
      count: o.totalProducts,
    },
    {
      to: "/admin/categories",
      icon: Tag,
      label: "Categories",
      count: o.totalCategories,
    },
    { to: "/admin/shops", icon: Store, label: "Shops", count: o.totalShops },
  ];

  return (
    <div>
      <div className="admin-eyebrow">Kariakoo Pilot · Overview</div>
      <div className="stat-grid admin-overview-grid">
        <div className="stat-card">
          <div className="stat-card-value">{o.totalCustomers}</div>
          <div className="stat-card-label">Customers</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{o.totalSellers}</div>
          <div className="stat-card-label">Sellers</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{o.totalProducts}</div>
          <div className="stat-card-label">Products listed</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{o.totalMessages}</div>
          <div className="stat-card-label">Messages sent</div>
        </div>
      </div>

      <div className="admin-dashboard-section">
        <h2 className="admin-section-title">Most searched products</h2>
        <div className="admin-list-card admin-search-list">
          {(stats?.topSearches?.length
            ? stats.topSearches
            : stats?.topProducts?.map((p) => ({
                query: p.name,
                count: p.viewCount,
              }))
          )?.map((item, index) => (
            <div className="admin-ranking-row" key={`${item.query}-${index}`}>
              <span className="admin-rank">{index + 1}</span>
              <span className="admin-ranking-name">{item.query}</span>
              <span className="admin-ranking-meta">
                {item.count} {item.count === 1 ? "search" : "searches"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <section className="admin-dashboard-section">
        <h2 className="admin-section-title">Popular Categories</h2>
        <div className="admin-category-list">
          {stats?.popularCategories?.slice(0, 6).map((category) => (
            <div className="admin-category-item" key={category.id}>
              <span>
                {category.icon} {category.name}
              </span>
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
          <Link className="admin-manage-card" to="/admin/settings">
            <Settings size={20} />
            <span>Settings</span>
            <strong>→</strong>
          </Link>
        </div>
      </section>
    </div>
  );
}

function AdminSellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingSellers();
      setSellers(data);
    } catch (error) {
      console.error("Failed to load pending sellers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const handleApproval = async (id, approvalStatus) => {
  let rejectionReason;

  if (approvalStatus === "REJECTED") {
    rejectionReason = window.prompt(
      "Please enter the reason for rejecting this seller:",
    );

    if (rejectionReason === null) {
      return;
    }

    if (!rejectionReason.trim()) {
      alert("A rejection reason is required.");
      return;
    }
  }

  try {
    setProcessingId(id);

    await api.approveSeller(id, approvalStatus, rejectionReason);

    setSellers((prev) => prev.filter((seller) => seller.id !== id));
  } catch (error) {
    console.error(`Failed to ${approvalStatus.toLowerCase()} seller:`, error);

    alert(
      `Failed to ${approvalStatus.toLowerCase()} seller. Please try again.`,
    );
  } finally {
    setProcessingId(null);
  }
};

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="admin-section-heading">
        <h1 className="admin-page-title admin-page-title-inline">
          Pending Sellers
        </h1>
        <span className="admin-count-badge">{sellers.length}</span>
      </div>

      <p className="admin-section-copy">
        Review sellers waiting for admin approval.
      </p>

      {sellers.length === 0 ? (
        <div className="admin-list-card admin-empty-card">
          <div className="admin-empty-icon">✓</div>
          <strong>All caught up</strong>
          <p>There are no sellers waiting for approval.</p>
        </div>
      ) : (
        <div className="admin-list-card">
          {sellers.map((seller, index) => (
            <div
              key={seller.id}
              className={`admin-seller-row${index === sellers.length - 1 ? " is-last" : ""}`}
            >
              <div className="admin-seller-top">
                <div className="admin-seller-info">
                  <div className="admin-seller-name">
                    {seller.user?.name || "Unnamed seller"}
                  </div>
                  <div className="admin-seller-meta">
                    {seller.user?.email || "No email"}
                  </div>
                  {seller.user?.phone && (
                    <div className="admin-seller-meta">{seller.user.phone}</div>
                  )}
                  {seller.shops?.length > 0 && (
                    <div className="admin-seller-shop">
                      <span>Shop: </span>
                      <strong>
                        {seller.shops.map((shop) => shop.name).join(", ")}
                      </strong>
                    </div>
                  )}
                  <div className="admin-seller-date">
                    Applied{" "}
                    {seller.createdAt
                      ? new Date(seller.createdAt).toLocaleDateString()
                      : "-"}
                  </div>
                </div>
                <span className="admin-pending-badge">Pending</span>
              </div>

              <div className="admin-seller-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={processingId === seller.id}
                  onClick={() => handleApproval(seller.id, "APPROVED")}
                >
                  {processingId === seller.id ? "Processing..." : "Approve"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={processingId === seller.id}
                  onClick={() => handleApproval(seller.id, "REJECTED")}
                >
                  {processingId === seller.id ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");
  useEffect(() => {
    api
      .getAdminUsers(role ? { role } : {})
      .then(setUsers)
      .catch(console.error);
  }, [role]);

  const toggle = async (id, isActive) => {
    await api.toggleUserStatus(id, !isActive);
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !isActive } : u)),
    );
  };

  return (
    <div>
      <h1 className="admin-page-title">
        {role === "SELLER" ? "Sellers" : "Customers"}
      </h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.roles.join(", ")}</td>
              <td>{u.isActive ? "✅ Active" : "❌ Disabled"}</td>
              <td>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => toggle(u.id, u.isActive)}
                >
                  {u.isActive ? "Disable" : "Enable"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminProducts() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    api.getAdminProducts().then(setProducts).catch(console.error);
  }, []);

  const toggle = async (id, isActive) => {
    await api.toggleProductStatus(id, !isActive);
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !isActive } : p)),
    );
  };

  return (
    <div>
      <h1 className="admin-page-title">Products</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Shop</th>
            <th>Price</th>
            <th>Views</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.shop?.name}</td>
              <td>{p.price ? `TSh ${p.price.toLocaleString()}` : "-"}</td>
              <td>{p.viewCount}</td>
              <td>{p.isActive ? "✅" : "❌"}</td>
              <td>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => toggle(p.id, p.isActive)}
                >
                  {p.isActive ? "Disable" : "Enable"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminShops() {
  const [shops, setShops] = useState([]);
  useEffect(() => {
    api.getAdminShops().then(setShops).catch(console.error);
  }, []);

  const toggle = async (id, isActive) => {
    await api.toggleShopStatus(id, !isActive);
    setShops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !isActive } : s)),
    );
  };

  return (
    <div>
      <h1 className="admin-page-title">Shops</h1>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Owner</th>
            <th>Area</th>
            <th>Products</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {shops.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.sellerProfile?.user?.name}</td>
              <td>{s.location?.area || "-"}</td>
              <td>{s._count?.products}</td>
              <td>{s.isActive ? "✅" : "❌"}</td>
              <td>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => toggle(s.id, s.isActive)}
                >
                  {s.isActive ? "Disable" : "Enable"}
                </button>
              </td>
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

  if (!user?.roles?.includes("ADMIN")) {
    return (
      <div className="admin-access-denied">
        <h2>Admin access required</h2>
        <Link to="/login">Login</Link>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-brand">
          <span className="admin-brand-mark" />
          Smart City <span className="admin-role">ADMIN</span>
        </div>
        <button
          className="admin-logout"
          title="Log out"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          <Power size={18} />
        </button>
      </header>
      <main className="admin-main">
        <Routes>
          <Route path="settings" element={<AdminSettings />} />
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="sellers" element={<AdminSellers />} />
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
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingIcon, setEditingIcon] = useState("");
  const [editingActive, setEditingActive] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const loadCategories = async () => {
    try {
      const data = await api.getAdminCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      const cat = await api.createCategory({ name: name.trim(), icon: "📦" });
      setCategories((prev) => [...prev, cat]);
      setName("");
    } catch (error) {
      console.error("Failed to create category:", error);
      alert(error.message || "Failed to create category.");
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setEditingName(category.name || "");
    setEditingIcon(category.icon || "📦");
    setEditingActive(Boolean(category.isActive));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
    setEditingIcon("");
    setEditingActive(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingName.trim()) {
      alert("Category name is required.");
      return;
    }

    try {
      setSavingId(editingId);

      const updated = await api.updateCategory(editingId, {
        name: editingName.trim(),
        icon: editingIcon.trim() || "📦",
        isActive: editingActive,
      });

      setCategories((prev) =>
        prev.map((category) =>
          category.id === updated.id ? { ...category, ...updated } : category,
        ),
      );

      cancelEdit();
    } catch (error) {
      console.error("Failed to update category:", error);
      alert(error.message || "Failed to update category.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <h1 className="admin-page-title">Categories</h1>

      <form onSubmit={handleCreate} className="admin-category-form">
        <input
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          required
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Add
        </button>
      </form>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Products</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              {editingId === c.id ? (
                <>
                  <td>
                    <div className="admin-category-edit">
                      <input
                        className="form-input"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        aria-label="Category name"
                        required
                      />
                      <input
                        className="form-input"
                        value={editingIcon}
                        onChange={(e) => setEditingIcon(e.target.value)}
                        aria-label="Category icon"
                        maxLength={8}
                      />
                    </div>
                  </td>
                  <td>{c._count?.products ?? 0}</td>
                  <td>
                    <label>
                      <input
                        type="checkbox"
                        checked={editingActive}
                        onChange={(e) => setEditingActive(e.target.checked)}
                      />{" "}
                      Active
                    </label>
                  </td>
                  <td>
                    <div className="admin-category-actions">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={handleUpdate}
                        disabled={savingId === c.id}
                      >
                        {savingId === c.id ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={cancelEdit}
                        disabled={savingId === c.id}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td>
                    {c.icon} {c.name}
                  </td>
                  <td>{c._count?.products ?? 0}</td>
                  <td>{c.isActive ? "✅" : "❌"}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => startEdit(c)}
                    >
                      Edit
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
