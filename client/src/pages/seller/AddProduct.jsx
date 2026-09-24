import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../api/client";
import Header from "../../components/Header";
import SellerApprovalBanner from "../../components/SellerApprovalBanner";
import { useAuth } from "../../context/AuthContext";

const MAX_IMAGES = 10;

export default function AddProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const {
    sellerApprovalStatus,
    sellerRejectionReason,
    isApprovedSeller,
  } = useAuth();

  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    shopId: "",
    name: "",
    description: "",
    price: "",
    categoryId: "",
    availability: "IN_STOCK",
  });

  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [imageDeleting, setImageDeleting] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      api.getMyShops(),
      api.getCategories(),
      isEdit ? api.getMyProducts().catch(() => []) : Promise.resolve([]),
    ])
      .then(([s, c, products]) => {
        if (!mounted) return;

        setShops(s);
        setCategories(c);

        if (isEdit) {
          const product = products.find((p) => p.id === id);

          if (!product) {
            setNotFound(true);
            return;
          }

          setForm({
            shopId: product.shopId || product.shop?.id || "",
            name: product.name || "",
            description: product.description || "",
            price:
              product.price != null
                ? String(product.price)
                : "",
            categoryId:
              product.categoryId ||
              product.category?.id ||
              "",
            availability:
              product.availability || "IN_STOCK",
          });

          setExistingImages(
            Array.isArray(product.images)
              ? [...product.images].sort(
                  (a, b) =>
                    (a.sortOrder ?? 0) -
                    (b.sortOrder ?? 0),
                )
              : [],
          );
        } else if (s.length > 0) {
          setForm((current) => ({
            ...current,
            shopId: s[0].id,
          }));
        }
      })
      .catch((err) => {
        console.error(err);

        if (mounted) {
          setError("Failed to load product information.");
        }
      })
      .finally(() => {
        if (mounted) {
          setPageLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  const totalImageCount =
    existingImages.length + images.length;

  const remainingImageSlots = Math.max(
    MAX_IMAGES - totalImageCount,
    0,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isApprovedSeller) return;

    setError("");

    if (totalImageCount > MAX_IMAGES) {
      setError(
        `A product can have a maximum of ${MAX_IMAGES} images.`,
      );
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fd.append(key, value);
        }
      });

      images.forEach((image) => {
        fd.append("images", image);
      });

      if (isEdit) {
        await api.updateProduct(id, fd);
      } else {
        await api.createProduct(fd);
      }

      navigate("/seller/products");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelection = (e) => {
    const selected = Array.from(e.target.files || []);

    if (!selected.length) return;

    if (remainingImageSlots <= 0) {
      setError(
        `This product already has the maximum of ${MAX_IMAGES} images.`,
      );
      e.target.value = "";
      return;
    }

    const imageFiles = selected.filter((file) =>
      file.type.startsWith("image/"),
    );

    if (imageFiles.length !== selected.length) {
      setError(
        "Some selected files are not images and were skipped.",
      );
    } else {
      setError("");
    }

    const acceptedImages = imageFiles.slice(
      0,
      remainingImageSlots,
    );

    if (imageFiles.length > remainingImageSlots) {
      setError(
        `You can only add ${remainingImageSlots} more image${
          remainingImageSlots === 1 ? "" : "s"
        }. The product limit is ${MAX_IMAGES} images.`,
      );
    }

    if (acceptedImages.length > 0) {
      setImages((current) => [
        ...current,
        ...acceptedImages,
      ]);
    }

    // Allows selecting the same file again later.
    e.target.value = "";
  };

  const removeNewImage = (index) => {
    setImages((current) =>
      current.filter(
        (_, imageIndex) => imageIndex !== index,
      ),
    );

    setError("");
  };

  const deleteExistingImage = async (imageId) => {
    if (!isEdit || !imageId) return;

    const confirmed = window.confirm(
      "Are you sure you want to remove this image?",
    );

    if (!confirmed) return;

    setError("");
    setImageDeleting(imageId);

    try {
      const result = await api.deleteProductImage(
        id,
        imageId,
      );

      if (Array.isArray(result.images)) {
        setExistingImages(
          [...result.images].sort(
            (a, b) =>
              (a.sortOrder ?? 0) -
              (b.sortOrder ?? 0),
          ),
        );
      } else {
        setExistingImages((current) =>
          current.filter(
            (image) => image.id !== imageId,
          ),
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to remove product image.",
      );
    } finally {
      setImageDeleting(null);
    }
  };

  const title = isEdit
    ? "Edit Product"
    : "Add Product";

  if (pageLoading) {
    return (
      <div className="page">
        <Header title={title} />
      </div>
    );
  }

  if (!isApprovedSeller) {
    return (
      <div className="page">
        <Header title={title} />

        <SellerApprovalBanner
          status={sellerApprovalStatus}
          rejectionReason={sellerRejectionReason}
        />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="page">
        <Header title={title} />

        <div className="empty-state">
          <h3>Product not found</h3>
        </div>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="page">
        <Header title={title} />

        <div className="empty-state">
          <h3>Create a shop first</h3>

          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            onClick={() =>
              navigate("/seller/setup")
            }
          >
            Create Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-no-nav">
      <Header title={title} />

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="seller-product-form"
      >
        <div className="form-group">
          <label className="form-label">
            Shop
          </label>

          <select
            className="form-input form-select"
            value={form.shopId}
            onChange={(e) =>
              setForm({
                ...form,
                shopId: e.target.value,
              })
            }
            required
          >
            {shops.map((shop) => (
              <option
                key={shop.id}
                value={shop.id}
              >
                {shop.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            Product Name *
          </label>

          <input
            className="form-input"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Description
          </label>

          <textarea
            className="form-input form-textarea"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Price (TSh)
          </label>

          <input
            className="form-input"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) =>
              setForm({
                ...form,
                price: e.target.value,
              })
            }
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Category
          </label>

          <select
            className="form-input form-select"
            value={form.categoryId}
            onChange={(e) =>
              setForm({
                ...form,
                categoryId: e.target.value,
              })
            }
          >
            <option value="">
              Select category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            Availability
          </label>

          <select
            className="form-input form-select"
            value={form.availability}
            onChange={(e) =>
              setForm({
                ...form,
                availability: e.target.value,
              })
            }
          >
            <option value="IN_STOCK">
              In Stock
            </option>

            <option value="LOW_STOCK">
              Low Stock
            </option>

            <option value="OUT_OF_STOCK">
              Out of Stock
            </option>
          </select>
        </div>

        {isEdit && existingImages.length > 0 && (
          <div className="form-group">
            <label className="form-label">
              Existing Images (
              {existingImages.length}/{MAX_IMAGES})
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 12,
                marginTop: 8,
              }}
            >
              {existingImages.map((image) => (
                <div
                  key={image.id}
                  style={{
                    position: "relative",
                    borderRadius: 12,
                    overflow: "hidden",
                    border:
                      "1px solid var(--border)",
                    background:
                      "var(--surface)",
                  }}
                >
                  <img
                    src={image.url}
                    alt="Product"
                    style={{
                      width: "100%",
                      height: 120,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  {image.isPrimary && (
                    <span
                      style={{
                        position: "absolute",
                        left: 6,
                        top: 6,
                        padding: "4px 7px",
                        borderRadius: 6,
                        background:
                          "rgba(0, 0, 0, 0.7)",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      Primary
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      deleteExistingImage(
                        image.id,
                      )
                    }
                    disabled={
                      imageDeleting === image.id
                    }
                    style={{
                      width: "100%",
                      border: 0,
                      padding: "8px 6px",
                      cursor:
                        imageDeleting === image.id
                          ? "wait"
                          : "pointer",
                    }}
                  >
                    {imageDeleting === image.id
                      ? "Removing..."
                      : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">
            {isEdit
              ? "Add More Images"
              : "Product Images"}{" "}
            (maximum {MAX_IMAGES})
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            disabled={
              loading ||
              remainingImageSlots <= 0
            }
            onChange={handleImageSelection}
          />

          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              color: "var(--text-secondary)",
            }}
          >
            {totalImageCount} of {MAX_IMAGES} images
            selected
          </div>

          {remainingImageSlots > 0 && (
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              You can add {remainingImageSlots} more
              image
              {remainingImageSlots === 1
                ? ""
                : "s"}
              .
            </div>
          )}

          {remainingImageSlots === 0 && (
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              Maximum image limit reached.
            </div>
          )}

          {images.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                New Images ({images.length})
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {images.map((image, index) => (
                  <div
                    key={`${image.name}-${index}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      gap: 12,
                      padding: 10,
                      border:
                        "1px solid var(--border)",
                      borderRadius: 8,
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {image.name}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        removeNewImage(index)
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading
            ? isEdit
              ? "Saving..."
              : "Publishing..."
            : isEdit
              ? "Save Changes"
              : "Publish Product"}
        </button>
      </form>
    </div>
  );
}