import { useState, useEffect, useRef } from "react";
import {
  useSearchParams,
  useLocation,
  useNavigate,
  Link,
} from "react-router-dom";
import {
  Plus,
  Search as SearchIcon,
  Send,
  MoreVertical,
  Trash2,
  Image as ImageIcon,
  ShoppingBag,
  X,
} from "lucide-react";

import { api, formatPrice, getImageUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Loading from "../components/Loading";
import ChatHeader from "../components/ChatHeader";

function formatConversationTime(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  const now = new Date();

  const diffMs = now - date;
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffHours < 24) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (diffDays < 7) {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return date.toLocaleDateString([], {
      weekday: "long",
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getConversationStatus(conv, user) {
  if (conv.unreadCount > 0) {
    return {
      label: "Unread",
      unread: true,
    };
  }

  if (conv.lastMessage?.senderId === user?.id) {
    return {
      label: "Sent",
      unread: false,
    };
  }

  return {
    label: "Seen",
    unread: false,
  };
}

const menuStyle = {
  position: "absolute",
  right: 8,
  top: 36,
  zIndex: 30,
  minWidth: 170,
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
  padding: 6,
};

const menuButtonStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 10px",
  border: 0,
  borderRadius: 7,
  background: "transparent",
  cursor: "pointer",
  textAlign: "left",
  color: "inherit",
};

function getTimelineProductId(item) {
  if (!item || item.type !== "PRODUCT") return null;

  return item.productId || item.product?.id || null;
}

function getProductShopId(product) {
  return product?.shop?.id || product?.shopId || product?.shop_id || null;
}

function ProductMessageCard({ product, onViewProduct, onViewShop }) {
  if (!product) return null;

  const image =
    product.imageUrl ||
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    product.images?.[0]?.imageUrl ||
    null;

  const price =
    product.price !== null && product.price !== undefined
      ? formatPrice(product.price, product.currency || "TSh")
      : null;

  const availability = product.availability
    ? String(product.availability).replaceAll("_", " ").toLowerCase()
    : null;

  return (
    <div
      style={{
        width: "min(380px, 100%)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        background: "var(--surface)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 12,
          padding: 12,
        }}
      >
        {/* LEFT — product information */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              lineHeight: 1.3,
              marginBottom: 8,
            }}
          >
            {product.name || "Product"}
          </div>

          {price && (
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              {price}
            </div>
          )}

          {availability && (
            <div
              style={{
                fontSize: 12,
                textTransform: "capitalize",
                opacity: 0.7,
              }}
            >
              {availability}
            </div>
          )}
        </div>

        {/* RIGHT — REAL PRODUCT IMAGE */}
        <div
          style={{
            width: 105,
            height: 105,
            flexShrink: 0,
            borderRadius: 10,
            overflow: "hidden",
            background: "var(--background)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {image ? (
            <img
              src={getImageUrl(image)}
              alt={product.name || "Product"}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <ShoppingBag size={28} />
          )}
        </div>
      </div>

      {/* BUTTONS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          padding: "0 12px 12px",
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onViewProduct?.(product);
          }}
          style={{
            minHeight: 38,
            border: "1px solid var(--border)",
            borderRadius: 9,
            background: "var(--surface)",
            color: "var(--text)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          View Product
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const shopId = getProductShopId(product);
            if (shopId) onViewShop?.(shopId);
          }}
          style={{
            minHeight: 38,
            border: "1px solid var(--border)",
            borderRadius: 9,
            background: "var(--surface)",
            color: "var(--text)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          View Shop
        </button>
      </div>
    </div>
  );
}

function ProductPicker({ products, onSelect, onClose, sending }) {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onClose]);

  return (
    <div
      ref={pickerRef}
      style={{
        position: "absolute",
        left: 8,
        right: 8,
        bottom: 62,
        zIndex: 40,
        maxHeight: "65vh",
        overflowY: "auto",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        boxShadow: "0 12px 35px rgba(0,0,0,0.18)",
        padding: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <strong>Share a product</strong>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product picker"
          style={{
            border: 0,
            background: "transparent",
            cursor: "pointer",
            color: "inherit",
            padding: 4,
          }}
        >
          <X size={18} />
        </button>
      </div>

      {products.length === 0 ? (
        <div
          style={{
            padding: 20,
            textAlign: "center",
            opacity: 0.7,
            fontSize: 13,
          }}
        >
          No products available from this seller.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {products.map((product) => {
            const image =
              product.imageUrl ||
              product.images?.find((img) => img.isPrimary)?.url ||
              product.images?.[0]?.url ||
              product.images?.[0]?.imageUrl ||
              null;

            const price =
              product.price !== null && product.price !== undefined
                ? formatPrice(product.price, product.currency || "TSh")
                : null;

            const availability = product.availability
              ? String(product.availability).replaceAll("_", " ").toLowerCase()
              : null;

            return (
              <button
                key={product.id}
                type="button"
                onClick={() => onSelect(product)}
                disabled={sending}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "stretch",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: 10,
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  background: "var(--surface)",
                  color: "var(--text)",
                  textAlign: "left",
                  cursor: sending ? "wait" : "pointer",
                  opacity: sending ? 0.65 : 1,
                }}
              >
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      lineHeight: 1.3,
                    }}
                  >
                    {product.name || "Product"}
                  </span>

                  {price && (
                    <span
                      style={{
                        marginTop: 6,
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {price}
                    </span>
                  )}

                  {availability && (
                    <span
                      style={{
                        marginTop: 4,
                        fontSize: 12,
                        opacity: 0.7,
                        textTransform: "capitalize",
                      }}
                    >
                      {availability}
                    </span>
                  )}
                </span>

                <span
                  style={{
                    width: 78,
                    height: 78,
                    flexShrink: 0,
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "var(--background)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {image ? (
                    <img
                      src={getImageUrl(image)}
                      alt={product.name || "Product"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <ShoppingBag size={24} />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProductDetailsModal({ product, onClose, onViewShop }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fullProduct, setFullProduct] = useState(product);

  useEffect(() => {
    let mounted = true;

    setSelectedIndex(0);
    setFullProduct(product);

    if (!product?.id) return undefined;

    setLoading(true);

    api
      .getProduct(product.id)
      .then((result) => {
        if (mounted && result) {
          setFullProduct(result.product ?? result);
          setSelectedIndex(0);
        }
      })
      .catch((err) => {
        console.error("Failed to load product details", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [product]);

  if (!fullProduct) return null;

  const images = Array.isArray(fullProduct.images)
    ? fullProduct.images
        .map((item) => item?.url || item?.imageUrl)
        .filter(Boolean)
        .slice(0, 10)
    : [];

  if (!images.length && fullProduct.imageUrl) {
    images.push(fullProduct.imageUrl);
  }

  const selectedImage = images[selectedIndex] || images[0];

  const shopId = fullProduct.shopId || fullProduct.shop?.id;

  const price =
    fullProduct.price !== null && fullProduct.price !== undefined
      ? formatPrice(fullProduct.price, fullProduct.currency || "TSh")
      : null;

  const availability = fullProduct.availability
    ? String(fullProduct.availability).replaceAll("_", " ").toLowerCase()
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${fullProduct.name || "Product"} details`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1200,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(560px, 100%)",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "var(--surface)",
          color: "var(--text)",
          borderRadius: 16,
          border: "1px solid var(--border)",
          boxShadow: "0 18px 60px rgba(0,0,0,0.3)",
          padding: 14,
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <strong
            style={{
              fontSize: 16,
              lineHeight: 1.3,
            }}
          >
            {fullProduct.name || "Product"}
          </strong>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            style={{
              width: 36,
              height: 36,
              flexShrink: 0,
              borderRadius: "50%",
              border: "1px solid var(--border)",
              background: "var(--background)",
              color: "var(--text)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* MAIN IMAGE */}
        <div
          style={{
            width: "100%",
            aspectRatio: "4 / 3",
            borderRadius: 12,
            overflow: "hidden",
            background: "var(--background)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {selectedImage ? (
            <img
              src={getImageUrl(selectedImage)}
              alt={fullProduct.name || "Product"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <ShoppingBag size={48} />
          )}
        </div>

        {/* THUMBNAILS */}
        {images.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              padding: "10px 0 4px",
            }}
          >
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`View image ${index + 1}`}
                style={{
                  width: 64,
                  height: 64,
                  flexShrink: 0,
                  padding: 2,
                  borderRadius: 8,
                  border:
                    index === selectedIndex
                      ? "2px solid var(--primary)"
                      : "1px solid var(--border)",
                  background: "var(--background)",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
              >
                <img
                  src={getImageUrl(image)}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 5,
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* PRODUCT INFO */}
        <div style={{ paddingTop: 12 }}>
          {price && (
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              {price}
            </div>
          )}

          {availability && (
            <div
              style={{
                marginTop: 5,
                fontSize: 13,
                opacity: 0.75,
                textTransform: "capitalize",
              }}
            >
              {availability}
            </div>
          )}

          {fullProduct.description && (
            <div
              style={{
                marginTop: 12,
                lineHeight: 1.5,
                fontSize: 13,
              }}
            >
              {fullProduct.description}
            </div>
          )}
        </div>

        {loading && (
          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              opacity: 0.65,
            }}
          >
            Loading product gallery...
          </div>
        )}

        {/* VIEW SHOP */}
        {shopId && (
          <button
            type="button"
            onClick={() => onViewShop?.(shopId)}
            style={{
              width: "100%",
              marginTop: 14,
              minHeight: 42,
              border: 0,
              borderRadius: 9,
              background: "var(--primary)",
              color: "white",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            View Shop
          </button>
        )}
      </div>
    </div>
  );
}

export default function Messages() {
  const { user, refreshUnreadMessages, setChatOpen } = useAuth();

  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const toUserId = searchParams.get("to");
  const originalProductId = searchParams.get("product");

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [messageSearch, setMessageSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [openMessageMenu, setOpenMessageMenu] = useState(null);
  const [openConversationMenu, setOpenConversationMenu] = useState(null);

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);

  const [conversationProducts, setConversationProducts] = useState([]);

  const [sendingPhoto, setSendingPhoto] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [sendingProduct, setSendingProduct] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEnd = useRef(null);

  useEffect(() => {
    setChatOpen(!!activeConv);

    return () => setChatOpen(false);
  }, [activeConv, setChatOpen]);

  useEffect(() => {
    if (!user) return;

    api
      .getConversations()
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const refreshConversations = async () => {
      try {
        const next = await api.getConversations();
        if (!cancelled) setConversations(next || []);
      } catch (err) {
        console.error(err);
      }
    };

    const interval = window.setInterval(refreshConversations, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    const chatFromHistory = location.state?.chat;

    if (chatFromHistory) {
      setActiveConv(chatFromHistory);
      loadMessages(chatFromHistory.id);
    } else if (!toUserId) {
      setActiveConv(null);
      setMessages([]);
    }
  }, [location.state, toUserId]);

  useEffect(() => {
    if (!user || !toUserId) return;

    api
      .startConversation(toUserId, originalProductId)
      .then((conv) => {
        setActiveConv(conv);
        loadMessages(conv.id);

        navigate("/messages", {
          replace: true,
          state: { chat: conv },
        });
      })
      .catch(console.error);
  }, [user, toUserId, originalProductId]);

  useEffect(() => {
    const closeMenus = () => {
      setOpenMessageMenu(null);
      setOpenConversationMenu(null);
    };

    document.addEventListener("click", closeMenus);

    return () => {
      document.removeEventListener("click", closeMenus);
    };
  }, []);

  const loadMessages = async (convId) => {
    try {
      const msgs = await api.getMessages(convId);

      setMessages(msgs);
      refreshUnreadMessages();

      setTimeout(() => {
        messagesEnd.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user || !activeConv?.id) return;

    let cancelled = false;

    const syncMessages = async () => {
      try {
        const next = await api.getMessages(activeConv.id);
        if (cancelled) return;

        setMessages((prev) => {
          const prevIds = new Set(prev.map((message) => message.id));
          const hasNewMessages = next.some((message) => !prevIds.has(message.id));

          if (hasNewMessages) {
            setTimeout(() => {
              messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
            }, 60);
          }

          return next;
        });

        refreshUnreadMessages();
      } catch (err) {
        if (!cancelled) console.error(err);
      }
    };

    const interval = window.setInterval(syncMessages, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [user, activeConv?.id, refreshUnreadMessages]);

  const loadConversationProducts = async () => {
    if (!activeConv) return;

    try {
      const products = await api.getConversationProducts(activeConv.id);
      setConversationProducts(products || []);
    } catch (err) {
      console.error(err);
      window.alert(err.message || "Failed to load seller products");
    }
  };

  const openConversation = (conv) => {
    setOpenConversationMenu(null);

    navigate("/messages", {
      state: { chat: conv },
    });

    setActiveConv(conv);
    loadMessages(conv.id);
  };

  const updateConversationPreview = (msg) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConv?.id
          ? {
              ...conv,
              lastMessage: msg,
              lastMessageAt: msg.createdAt,
              updatedAt: msg.createdAt,
            }
          : conv,
      ),
    );
  };

  const appendMessage = (msg) => {
    setMessages((prev) => {
      if (prev.some((item) => item.id === msg.id)) {
        return prev;
      }

      return [...prev, msg];
    });

    updateConversationPreview(msg);

    setTimeout(() => {
      messagesEnd.current?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !activeConv) return;

    try {
      const msg = await api.sendMessage(activeConv.id, newMessage.trim());

      appendMessage(msg);
      setNewMessage("");
    } catch (err) {
      console.error(err);
      window.alert(err.message || "Failed to send message");
    }
  };

  const handlePhotoButton = () => {
    setShowAddMenu(false);
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = async (e) => {
    const file = e.target.files?.[0];

    e.target.value = "";

    if (!file || !activeConv) return;

    if (!file.type.startsWith("image/")) {
      window.alert("Please select an image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      window.alert("Image must be 10MB or smaller.");
      return;
    }

    try {
      setSendingPhoto(true);

      const msg = await api.sendPhoto(activeConv.id, file);

      appendMessage(msg);
    } catch (err) {
      console.error(err);
      window.alert(err.message || "Failed to send photo");
    } finally {
      setSendingPhoto(false);
    }
  };

  const handleProductButton = async () => {
    setShowAddMenu(false);
    setShowProductPicker(true);

    await loadConversationProducts();
  };

  const handleProductSelect = async (product) => {
    if (!activeConv || !product || sendingProduct) return;

    try {
      setSendingProduct(true);

      const msg = await api.sendProduct(activeConv.id, product.id);

      appendMessage(msg);
      setShowProductPicker(false);
    } catch (err) {
      console.error(err);
      window.alert(err.message || "Failed to share product");
    } finally {
      setSendingProduct(false);
    }
  };

  const handleDeleteMessage = async (message, mode) => {
    if (!activeConv || deleting) return;

    try {
      setDeleting(true);
      setOpenMessageMenu(null);

      await api.deleteMessage(activeConv.id, message.id, mode);

      setMessages((prev) => {
  const next = prev.filter((item) => item.id !== message.id);

  // Keep consecutive identical PRODUCT messages collapsed in the UI.
  // Other saved PRODUCT events are not deleted.
  return next.filter((item, index) => {
    if (item.type !== "PRODUCT") return true;

    const previous = next[index - 1];
    const currentProductId = getTimelineProductId(item);
    const previousProductId = getTimelineProductId(previous);

    return !(
      currentProductId &&
      previousProductId &&
      String(currentProductId) === String(previousProductId)
    );
  });
});

      if (mode === "for_everyone") {
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== activeConv.id) return conv;

            if (conv.lastMessage?.id !== message.id) {
              return conv;
            }

            const remaining = messages.filter((item) => item.id !== message.id);

            const last = remaining[remaining.length - 1];

            return {
              ...conv,
              lastMessage: last || null,
              lastMessageAt: last?.createdAt || conv.updatedAt,
            };
          }),
        );
      }
    } catch (err) {
      console.error(err);
      window.alert(err.message || "Failed to delete message");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (deleting) return;

    const confirmed = window.confirm(
      "Delete this chat for you? The other person will still keep the conversation.",
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setOpenConversationMenu(null);

      await api.deleteConversationForMe(conversationId);

      setConversations((prev) =>
        prev.filter((conv) => conv.id !== conversationId),
      );

      if (activeConv?.id === conversationId) {
        setActiveConv(null);
        setMessages([]);
        navigate("/messages", {
          replace: true,
        });
      }
    } catch (err) {
      console.error(err);
      window.alert(err.message || "Failed to delete chat");
    } finally {
      setDeleting(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const search = messageSearch.trim().toLowerCase();

    if (!search) return true;

    const name = conv.otherUser?.name?.toLowerCase() || "";
    const preview = conv.lastMessage?.content?.toLowerCase() || "";

    return name.includes(search) || preview.includes(search);
  });

  if (!user) {
    return (
      <div className="page">
        <Header title="Messages" />

        <div className="empty-state">
          <h3>Login to view messages</h3>

          <Link
            to="/login"
            className="btn btn-primary"
            style={{ marginTop: 16 }}
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (activeConv) {
    const other =
      activeConv.otherUser ||
      activeConv.participants?.find((p) => p.userId !== user.id)?.user;

    const originalProduct =
      activeConv.originalProduct || activeConv.product || null;

    // Legacy conversations may have the product only as conversation
    // metadata. New "Message Seller" requests create a real PRODUCT
    // message, so do not render the metadata product a second time.
    const showOriginalProductFallback =
      Boolean(originalProduct) &&
      !messages.some(
        (message) =>
          message.type === "PRODUCT" &&
          String(message.productId || message.product?.id || "") ===
            String(originalProduct.id),
      );

    const closeImageViewer = () => {
      setViewingImage(null);
    };

    return (
      <div
        className="page-no-nav chat-page"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
        }}
      >
        {viewingImage && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={() => setViewingImage(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: "rgba(0, 0, 0, 0.88)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <button
              type="button"
              aria-label="Close image"
              onClick={(e) => {
                e.stopPropagation();
                setViewingImage(null);
              }}
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.35)",
                background: "rgba(0,0,0,0.45)",
                color: "white",
                fontSize: 24,
                cursor: "pointer",
                zIndex: 2,
              }}
            >
              ×
            </button>

<img
  src={viewingImage}
  alt="Full size"
  style={{
    display: "block",
    width: "90%",
    height: "90%",
    objectFit: "contain",
    objectPosition: "center",
  }}
/>
          </div>
        )}

        {viewingProduct && (
          <ProductDetailsModal
            product={viewingProduct}
            onClose={() => setViewingProduct(null)}
            onViewShop={(shopId) => {
              setViewingProduct(null);
              navigate(`/shop/${shopId}`);
            }}
          />
        )}

<ChatHeader
  name={other?.name || "Chat"}
  avatar={other?.name?.[0]?.toUpperCase() || "?"}
  lastSeenAt={other?.lastSeenAt}
/>
        <div className="chat-thread">
          {showOriginalProductFallback && (
            <div
              className="message-bubble sent product-message-bubble"
              style={{ position: "relative" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 6,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <ProductMessageCard
                    product={originalProduct}
                    onViewProduct={setViewingProduct}
                    onViewShop={(shopId) => {
                      if (shopId) navigate(`/shop/${shopId}`);
                    }}
                  />

                  <div className="message-time">
                    {new Date(activeConv.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((m, index) => {
  const isMine = m.senderId === user.id;

  // The original product is the first virtual item in the
  // conversation timeline.
  const previousTimelineItem =
    index === 0 && showOriginalProductFallback
      ? { type: "PRODUCT", productId: originalProduct.id }
      : messages[index - 1];

  const currentProductId = getTimelineProductId(m);
  const previousProductId =
    getTimelineProductId(previousTimelineItem);

  const isRepeatedProduct =
    Boolean(currentProductId) &&
    Boolean(previousProductId) &&
    String(currentProductId) === String(previousProductId);

  if (isRepeatedProduct) {
    return null;
  }

  return (
    <div
      key={m.id}
      className={`message-bubble ${isMine ? "sent" : "received"}${
        m.type === "PRODUCT"
          ? " product-message-bubble"
          : ""
      }${
        m.type === "PHOTO"
          ? " photo-message-bubble"
          : ""
      }`}
      style={{
        position: "relative",
        ...(m.type === "PHOTO"
          ? {
              background: "transparent",
              border: "none",
              padding: 0,
            }
          : {}),
      }}
    >
      {/* PHOTO / PRODUCT / TEXT CONTAINER */}
      <div
        style={{
          display: "block",
          width:
            m.type === "PHOTO"
              ? "fit-content"
              : "100%",
          maxWidth: "100%",

          ...(m.type === "PHOTO"
            ? {
                marginLeft: isMine ? "auto" : 0,
                marginRight: isMine ? 0 : "auto",
                border: "1px solid var(--border)",
                borderRadius: 12,
                background: "var(--surface)",
                overflow: "hidden",
              }
            : {}),
        }}
      >
        {/* MESSAGE CONTENT */}
        <div
          style={{
            width:
              m.type === "PHOTO"
                ? "fit-content"
                : "100%",
            maxWidth: "100%",
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          {m.type === "PHOTO" && m.imageUrl ? (
            <button
              type="button"
              onClick={() =>
                setViewingImage(
                  getImageUrl(m.imageUrl),
                )
              }
              style={{
                display: "block",
                width: "fit-content",
                maxWidth: "100%",
                padding: 0,
                margin: 0,
                border: 0,
                background: "transparent",
                cursor: "zoom-in",
              }}
            >
              <img
                src={getImageUrl(m.imageUrl)}
                alt="Shared"
                style={{
                  display: "block",
                  width: "auto",
                  height: "auto",
                  maxWidth: "100%",
                  maxHeight: "360px",
                  objectFit: "contain",
                  borderRadius: 0,
                  border: "none",
                  background: "transparent",
                }}
              />
            </button>
          ) : m.type === "PRODUCT" &&
            m.product ? (
            <ProductMessageCard
              product={m.product}
              onViewProduct={setViewingProduct}
              onViewShop={(shopId) => {
                if (shopId) {
                  navigate(`/shop/${shopId}`);
                }
              }}
            />
          ) : (
            <div>{m.content}</div>
          )}
        </div>

        {/* TIME + THREE DOTS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            marginTop:
              m.type === "PHOTO" ? 0 : 4,
            width: "100%",
            padding:
              m.type === "PHOTO"
                ? "6px 8px 8px"
                : 0,
            boxSizing: "border-box",
          }}
        >
          <div className="message-time">
            {new Date(
              m.createdAt,
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>

          <button
            type="button"
            title="Message options"
            aria-label="Message options"
            onClick={(e) => {
              e.stopPropagation();

              setOpenMessageMenu((current) =>
                current === m.id
                  ? null
                  : m.id,
              );

              setOpenConversationMenu(null);
              setShowAddMenu(false);
              setShowProductPicker(false);
            }}
            style={{
              padding: 2,
              margin: 0,
              cursor: "pointer",
              opacity: 1,
              color: "var(--text)",
              background: "var(--surface)",
              border:
                "1px solid var(--border)",
              borderRadius: "50%",
              width: 30,
              height: 30,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* MESSAGE OPTIONS MENU */}
      {openMessageMenu === m.id && (
        <div
          style={{
            ...menuStyle,
            right: 8,
            top: "auto",
            bottom: 38,
          }}
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          <button
            type="button"
            style={menuButtonStyle}
            onClick={() =>
              handleDeleteMessage(
                m,
                "for_me",
              )
            }
          >
            <Trash2 size={15} />
            Delete for me
          </button>

          {m.senderId === user.id && (
            <button
              type="button"
              style={menuButtonStyle}
              onClick={() =>
                handleDeleteMessage(
                  m,
                  "for_everyone",
                )
              }
            >
              <Trash2 size={15} />
              Delete for everyone
            </button>
          )}
        </div>
      )}
    </div>
  );
})}

          <div ref={messagesEnd} />
        </div>

        <form
          className="chat-composer"
          onSubmit={handleSend}
          style={{
            position: "relative",
          }}
        >
          {showAddMenu && (
            <div
              style={{
                position: "absolute",
                left: 8,
                bottom: 58,
                zIndex: 35,
                minWidth: 180,
                padding: 6,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                style={menuButtonStyle}
                onClick={handlePhotoButton}
                disabled={sendingPhoto}
              >
                <ImageIcon size={17} />
                {sendingPhoto ? "Sending photo..." : "Photo"}
              </button>

              <button
                type="button"
                style={menuButtonStyle}
                onClick={handleProductButton}
                disabled={sendingProduct}
              >
                <ShoppingBag size={17} />
                Product
              </button>
            </div>
          )}

          {showProductPicker && (
            <ProductPicker
              products={conversationProducts}
              onSelect={handleProductSelect}
              onClose={() => setShowProductPicker(false)}
              sending={sendingProduct}
            />
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelected}
            style={{ display: "none" }}
          />

          <button
            type="button"
            className="chat-add"
            title="Add"
            aria-label="Add"
            onClick={(e) => {
              e.stopPropagation();

              setShowProductPicker(false);
              setShowAddMenu((current) => !current);
            }}
          >
            <Plus size={19} />
          </button>

          <input
            className="form-input"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Andika ujumbe..."
          />

          <button
            type="submit"
            className="chat-send"
            title="Send"
            aria-label="Send"
            disabled={!newMessage.trim()}
          >
            <Send size={17} />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="page">
      <Header
        title="Messages"
        titleRight={
          <div className="messages-inline-search">
            <SearchIcon size={15} />

            <input
              type="search"
              value={messageSearch}
              onChange={(e) => setMessageSearch(e.target.value)}
              placeholder="Search..."
              aria-label="Search messages"
            />
          </div>
        }
      />

      {loading ? (
        <Loading />
      ) : filteredConversations.length === 0 ? (
        <div className="messages-empty-state">
          <div className="messages-empty-illustration" aria-hidden="true">
            <div className="messages-empty-spark spark-one" />
            <div className="messages-empty-spark spark-two" />
            <div className="messages-empty-spark spark-three" />

            <div className="messages-empty-bubble bubble-main">
              <span />
              <span />
              <span />
            </div>

            <div className="messages-empty-bubble bubble-small">
              <span />
              <span />
              <span />
            </div>
          </div>

          <h3>{messageSearch ? "No messages found" : "No messages yet"}</h3>

          <p>
            {messageSearch
              ? "Try a different name or message"
              : "Start a conversation by messaging a seller"}
          </p>
        </div>
      ) : (
        <div className="conversation-list">
          {filteredConversations.map((conv) => {
            const status = getConversationStatus(conv, user);

            return (
              <div
                key={conv.id}
                className={`conversation-item ${
                  status.unread ? "conversation-unread" : ""
                }`}
                onClick={() => openConversation(conv)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    openConversation(conv);
                  }
                }}
                style={{
                  position: "relative",
                  cursor: "pointer",
                }}
              >
                <div className="conversation-avatar">
                  {conv.otherUser?.name?.[0]?.toUpperCase() || "?"}
                </div>

                <div
                  className="conversation-content"
                  style={{
                    minWidth: 0,
                    flex: 1,
                    paddingRight: 6,
                  }}
                >
                  <div className="conversation-heading">
                    <strong>{conv.otherUser?.name || "Unknown user"}</strong>
                  </div>

                  <div className="conversation-preview">
                    {conv.lastMessage?.type === "PHOTO"
                      ? "📷 Photo"
                      : conv.lastMessage?.type === "PRODUCT"
                        ? "🛍 Product"
                        : conv.lastMessage?.content || "No messages yet"}
                  </div>
                </div>

                <div
                  className="conversation-side"
                  style={{
                    flex: "0 0 96px",
                    width: 96,
                    minWidth: 96,
                    paddingRight: 38,
                    boxSizing: "border-box",
                    textAlign: "right",
                    minHeight: 48,
                  }}
                >
                  <time
                    style={{
                      display: "block",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {formatConversationTime(conv.lastMessageAt)}
                  </time>

                  <div
                    className={`conversation-status ${
                      status.unread ? "is-unread" : ""
                    }`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 4,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {status.unread && (
                      <span
                        className="conversation-unread-dot"
                        aria-hidden="true"
                      />
                    )}

                    <span>{status.label}</span>
                  </div>
                </div>

                <button
                  type="button"
                  title="Conversation options"
                  aria-label="Conversation options"
                  onClick={(e) => {
                    e.stopPropagation();

                    setOpenConversationMenu((current) =>
                      current === conv.id ? null : conv.id,
                    );

                    setOpenMessageMenu(null);
                  }}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    padding: 4,
                    cursor: "pointer",
                    color: "inherit",
                    opacity: 1,
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MoreVertical size={18} />
                </button>

                {openConversationMenu === conv.id && (
                  <div
                    style={{
                      ...menuStyle,
                      right: 8,
                      top: 38,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      style={menuButtonStyle}
                      onClick={() => handleDeleteConversation(conv.id)}
                    >
                      <Trash2 size={15} />
                      Delete chat
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
