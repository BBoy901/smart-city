import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, formatPrice, getImageUrl } from "../../api/client";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import SellerApprovalBanner from "../../components/SellerApprovalBanner";
import { useAuth } from "../../context/AuthContext";
import { Edit, Trash2 } from "lucide-react";

export default function SellerProducts() {
  const {
  sellerApprovalStatus,
  sellerRejectionReason,
  isApprovedSeller,
} = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getMyProducts()
      .then(setProducts)
      .catch((err) => {
        setProducts([]);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page">
      <Header title="My Products" />
      <SellerApprovalBanner
  status={sellerApprovalStatus}
  rejectionReason={sellerRejectionReason}
/>
      {error && <div className="alert alert-error">{error}</div>}
      {loading ? (
        <Loading />
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3>No products yet</h3>
          {isApprovedSeller && (
            <Link
              to="/seller/add-product"
              className="btn btn-primary"
              style={{ marginTop: 16 }}
            >
              Add Product
            </Link>
          )}
        </div>
      ) : (
        <div className="section">
          {products.map((p) => (
            <div key={p.id} className="seller-product-card">
              <div className="seller-product-image">
                {p.images?.[0] ? (
                  <img src={getImageUrl(p.images[0].url)} alt="" />
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
                  {p.availability.replace("_", " ")}
                </div>
              </div>

              {isApprovedSeller && (
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
