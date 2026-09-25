import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../api/client";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";
import { Heart, Clock, Store, ArrowRightLeft } from "lucide-react";

export default function Profile() {
  const {
    user,
    logout,
    switchMode,
    addRole,
    isSeller,
    isCustomer,
    isSellerMode,
  } = useAuth();

  const { t } = useLanguage();
  const navigate = useNavigate();

  const [tab, setTab] = useState("saved");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const fetcher =
      tab === "saved"
        ? api.getSaved
        : tab === "liked"
          ? api.getLiked
          : api.getRecent;

    fetcher()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tab, user]);

  const handleSwitchMode = async () => {
    const newMode = isSellerMode ? "CUSTOMER" : "SELLER";

    await switchMode(newMode);

    navigate(newMode === "SELLER" ? "/seller" : "/");
  };

  const handleBecomeSeller = async () => {
    await addRole("SELLER");
    navigate("/seller/setup");
  };

  const handleBecomeCustomer = async () => {
    await addRole("CUSTOMER");
    navigate("/onboarding");
  };

  if (!user) {
    return (
      <div className="page">
        <Header title={t("settings.profile")} />

        <div className="empty-state">
          <h3>{t("settings.loginToViewProfile")}</h3>

          <Link
            to="/login"
            className="btn btn-primary"
            style={{ marginTop: 16 }}
          >
            {t("settings.login")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Header title={t("settings.profile")} />

      <div className="profile-header">
        <div className="profile-avatar">{user.name?.[0]?.toUpperCase()}</div>

        <div className="profile-name">{user.name}</div>

        <div className="profile-email">{user.email}</div>

        <div style={{ marginTop: 12 }}>
          <span className="mode-badge">
            {isSellerMode
              ? `🏪 ${t("settings.sellerMode")}`
              : `🛍️ ${t("settings.customerMode")}`}
          </span>
        </div>

        {isCustomer && isSeller && (
          <button type="button"
            className="btn btn-secondary btn-sm"
            style={{ marginTop: 12 }}
            onClick={handleSwitchMode}
          >
            <ArrowRightLeft size={16} />

            {isSellerMode
              ? t("settings.switchToCustomer")
              : t("settings.switchToSeller")}
          </button>
        )}

        {!isSeller && isCustomer && (
          <button type="button"
            className="btn btn-outline btn-sm"
            style={{ marginTop: 12 }}
            onClick={handleBecomeSeller}
          >
            <Store size={16} />

            {t("settings.becomeSeller")}
          </button>
        )}

        {!isCustomer && isSeller && (
          <button type="button"
            className="btn btn-outline btn-sm"
            style={{ marginTop: 12 }}
            onClick={handleBecomeCustomer}
          >
            🛍️ {t("settings.becomeCustomer")}
          </button>
        )}
      </div>

      <div className="tabs" style={{ margin: "0 16px" }}>
        <button type="button"
          className={`tab ${tab === "saved" ? "active" : ""}`}
          onClick={() => setTab("saved")}
        >
          {t("settings.saved")}
        </button>

        <button type="button"
          className={`tab ${tab === "liked" ? "active" : ""}`}
          onClick={() => setTab("liked")}
        >
          {t("settings.liked")}
        </button>

        <button type="button"
          className={`tab ${tab === "recent" ? "active" : ""}`}
          onClick={() => setTab("recent")}
        >
          {t("settings.recent")}
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : items.length === 0 ? (
        <div className="empty-state">
          {tab === "saved" && (
            <>
              <Heart size={48} />
              <h3>{t("settings.noSavedProducts")}</h3>
            </>
          )}

          {tab === "liked" && (
            <>
              <Heart size={48} />
              <h3>{t("settings.noLikedProducts")}</h3>
            </>
          )}

          {tab === "recent" && (
            <>
              <Clock size={48} />
              <h3>{t("settings.noRecentlyViewed")}</h3>
            </>
          )}
        </div>
      ) : (
        <div className="feed-grid">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      <div style={{ padding: 16 }}>
        <button type="button"
          className="btn btn-danger btn-block"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          {t("settings.logout")}
        </button>
      </div>
    </div>
  );
}
