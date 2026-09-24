import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Bookmark,
  MessageCircle,
  Phone,
  MapPin,
  Store,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  api,
  formatPrice,
  getImageUrl,
  getLocationString,
} from "../api/client";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ProductCard from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    setSelectedImageIndex(0);

    api
      .getProduct(id)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const product = data?.product;
  const related = data?.relatedProducts || [];
  const images = product?.images || [];
  const selectedImage = images[selectedImageIndex]?.url;
  const shop = product?.shop;
  const sellerUser = shop?.sellerProfile?.user;

  const requireLogin = (action, productId) => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: `/product/${productId}`,
          action,
        },
      });
      return false;
    }

    return true;
  };

  const handleLike = async (productId = id) => {
    if (!requireLogin("like", productId)) return;

    try {
      const { liked } = await api.likeProduct(productId);

      setData((current) => {
        if (!current) return current;

        return {
          ...current,
          product:
            current.product?.id === productId
              ? { ...current.product, isLiked: liked }
              : current.product,
          relatedProducts: (current.relatedProducts || []).map((item) =>
            item.id === productId ? { ...item, isLiked: liked } : item,
          ),
        };
      });
    } catch (error) {
      console.error("Like failed:", error);
    }
  };

  const handleSave = async (productId = id) => {
    if (!requireLogin("save", productId)) return;

    try {
      const { saved } = await api.saveProduct(productId);

      setData((current) => {
        if (!current) return current;

        return {
          ...current,
          product:
            current.product?.id === productId
              ? { ...current.product, isSaved: saved }
              : current.product,
          relatedProducts: (current.relatedProducts || []).map((item) =>
            item.id === productId ? { ...item, isSaved: saved } : item,
          ),
        };
      });
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  const showPreviousImage = () => {
    setSelectedImageIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  };

  const showNextImage = () => {
    setSelectedImageIndex((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  };

  if (loading) {
    return (
      <div className="page">
        <Loading />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page">
        <Header title="Not Found" showBack />
        <div className="empty-state">
          <h3>Product not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="page-no-nav">
      <Header title={product.name} />

      {/* Image gallery */}
      <section style={{ padding: "12px 16px 0" }}>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 18,
            background: "var(--surface-secondary, var(--border))",
          }}
        >
          {selectedImage ? (
            <img
              src={getImageUrl(selectedImage)}
              alt={`${product.name} photo ${selectedImageIndex + 1}`}
              style={{
                display: "block",
                width: "100%",
                height: "min(72vw, 440px)",
                objectFit: "contain",
              }}
            />
          ) : (
            <div
              style={{
                height: 280,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 64,
              }}
            >
              📦
            </div>
          )}

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPreviousImage}
                aria-label="Previous photo"
                style={galleryArrowStyle("left")}
              >
                <ChevronLeft size={23} />
              </button>

              <button
                type="button"
                onClick={showNextImage}
                aria-label="Next photo"
                style={galleryArrowStyle("right")}
              >
                <ChevronRight size={23} />
              </button>

              <span
                style={{
                  position: "absolute",
                  right: 12,
                  bottom: 12,
                  padding: "5px 10px",
                  borderRadius: 20,
                  background: "rgba(0,0,0,.65)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {selectedImageIndex + 1} / {images.length}
              </span>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: 9,
              overflowX: "auto",
              padding: "12px 0 4px",
            }}
          >
            {images.map((image, index) => (
              <button
                key={image.id || `${image.url}-${index}`}
                type="button"
                onClick={() => setSelectedImageIndex(index)}
                aria-label={`View photo ${index + 1}`}
                aria-pressed={selectedImageIndex === index}
                style={{
                  flex: "0 0 68px",
                  width: 68,
                  height: 68,
                  padding: 0,
                  overflow: "hidden",
                  borderRadius: 12,
                  border:
                    selectedImageIndex === index
                      ? "2px solid var(--primary)"
                      : "2px solid var(--border)",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <img
                  src={getImageUrl(image.url)}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  loading="lazy"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Product information */}
      <section className="product-detail-info" style={{ paddingTop: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1
              className="product-detail-name"
              style={{
                fontSize: "clamp(1.35rem, 5vw, 1.8rem)",
                lineHeight: 1.25,
              }}
            >
              {product.name}
            </h1>

            {product.price && (
              <div
                className="product-detail-price"
                style={{ marginTop: 10, fontSize: "1.4rem" }}
              >
                {formatPrice(product.price)}
              </div>
            )}
          </div>

          <span
            className="chip"
            style={{ flexShrink: 0, fontSize: 12, marginTop: 4 }}
          >
            {product.availability === "IN_STOCK"
              ? "✅ In Stock"
              : product.availability === "LOW_STOCK"
                ? "⚠️ Low Stock"
                : "❌ Out of Stock"}
          </span>
        </div>

        {product.description && (
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 8 }}>Description</h3>
            <p
              className="product-detail-desc"
              style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}
            >
              {product.description}
            </p>
          </div>
        )}

        {/* Seller card */}
        <Link
          to={`/shop/${shop?.id}`}
          className="card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: 14,
            margin: "20px 0",
            borderRadius: 16,
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              flexShrink: 0,
              borderRadius: "50%",
              background: "var(--primary-light)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Store size={23} color="var(--primary)" />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700 }}>{shop?.name}</div>

            {shop?.location && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 5,
                  fontSize: 12,
                  color: "var(--text-secondary)",
                }}
              >
                <MapPin size={13} />
                {getLocationString(shop.location)}
              </div>
            )}
          </div>

          <ChevronRight size={19} color="var(--text-secondary)" />
        </Link>

        {/* Actions */}
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn-secondary"
              onClick={() => handleLike(id)}
              style={{ flex: 1, justifyContent: "center" }}
            >
              <Heart
                size={18}
                fill={product.isLiked ? "var(--danger)" : "none"}
                color={product.isLiked ? "var(--danger)" : "currentColor"}
              />
              {product.isLiked ? "Liked" : "Like"}
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => handleSave(id)}
              style={{ flex: 1, justifyContent: "center" }}
            >
              <Bookmark
                size={18}
                fill={product.isSaved ? "var(--primary)" : "none"}
                color={product.isSaved ? "var(--primary)" : "currentColor"}
              />
              {product.isSaved ? "Saved" : "Save"}
            </button>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Link
              to={
  isAuthenticated
    ? `/messages?to=${sellerUser?.id}&product=${product.id}`
    : "/login"
}
              state={
                !isAuthenticated
                  ? { from: `/product/${id}`, action: "message" }
                  : undefined
              }
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: "center" }}
            >
              <MessageCircle size={18} />
              Message Seller
            </Link>

            {shop?.phone && (
              <a
                href={`tel:${shop.phone}`}
                className="btn btn-secondary"
                style={{ justifyContent: "center" }}
              >
                <Phone size={18} />
                Call
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section
          className="section"
          style={{ paddingBottom: 90, paddingTop: 28 }}
        >
          <div style={{ marginBottom: 16 }}>
            <h2 className="section-title" style={{ marginBottom: 5 }}>
              More from {shop?.name}
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: 13,
                margin: 0,
              }}
            >
              You may also like these products
            </p>
          </div>

          <div className="feed-grid" style={{ padding: 0 }}>
            {related.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onLike={handleLike}
                onSave={handleSave}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function galleryArrowStyle(side) {
  return {
    position: "absolute",
    [side]: 10,
    top: "50%",
    transform: "translateY(-50%)",
    width: 38,
    height: 38,
    border: 0,
    borderRadius: "50%",
    background: "rgba(0,0,0,.58)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };
}
