import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, formatPrice } from '../../api/client';
import Header from '../../components/Header';
import Loading from '../../components/Loading';
import { Edit, Trash2 } from 'lucide-react';

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyProducts().then(setProducts).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api.deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="page">
      <Header title="My Products" />
      {loading ? <Loading /> : products.length === 0 ? (
        <div className="empty-state">
          <h3>No products yet</h3>
          <Link to="/seller/add-product" className="btn btn-primary" style={{ marginTop: 16 }}>Add Product</Link>
        </div>
      ) : (
        <div className="section">
          
          {products.map((p) => (
  <div key={p.id} className="seller-product-card">
    <div className="seller-product-image">
      {p.images?.[0] ? (
        <img src={p.images[0].url} alt="" />
      ) : (
        <span>📦</span>
      )}
    </div>

    <div className="seller-product-info">
      <div className="seller-product-name">{p.name}</div>

      {p.price && (
        <div className="seller-product-price">
          {formatPrice(p.price)}
        </div>
      )}

      <div className="seller-product-status">
        {p.availability.replace('_', ' ')}
      </div>
    </div>

    <div className="seller-product-actions">
      <Link
        to={`/seller/edit-product/${p.id}`}
        className="btn-icon"
        title="Edit product"
      >
        <Edit size={16} />
      </Link>

      <button
        className="btn-icon"
        onClick={() => handleDelete(p.id)}
        title="Delete product"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>
))}
        </div>
      )}
    </div>
  );
}
