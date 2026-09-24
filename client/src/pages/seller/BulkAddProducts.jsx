import Cropper from "react-easy-crop";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/client";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import SellerApprovalBanner from "../../components/SellerApprovalBanner";
import { useAuth } from "../../context/AuthContext";
import { Plus, Trash2, ImagePlus, X, Package, Crop } from "lucide-react";

const MAX_IMAGES = 10;

const createProduct = (shopId = "") => ({
  localId: `${Date.now()}-${Math.random()}`,
  shopId,
  name: "",
  description: "",
  price: "",
  categoryId: "",
  availability: "IN_STOCK",
  images: [],
});

function getList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.shops)) return data.shops;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

async function getCroppedImage(imageSrc, pixelCrop, originalFile) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Could not crop this image."));
      },
      "image/jpeg",
      0.92,
    );
  });

  const baseName = originalFile.name.replace(/\.[^/.]+$/, "");

  return new File([blob], `${baseName}-cropped.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

function ProductImagePreview({ file, onCrop, onRemove, disabled }) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div
      style={{
        width: 116,
        border: "1px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
        background: "var(--surface)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: 90,
          background: "var(--background-secondary)",
        }}
      >
        {previewUrl && (
          <img
            src={previewUrl}
            alt={file.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        )}
      </div>

      <div style={{ padding: 7 }}>
        <div
          title={file.name}
          style={{
            fontSize: 11,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            marginBottom: 7,
          }}
        >
          {file.name}
        </div>

        <div style={{ display: "flex", gap: 5 }}>
          <button
            type="button"
            title="Crop image"
            aria-label={`Crop ${file.name}`}
            disabled={disabled}
            onClick={onCrop}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              padding: "6px 4px",
              border: "1px solid var(--border)",
              borderRadius: 7,
              background: "transparent",
              color: "var(--text)",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            <Crop size={14} />
            <span style={{ fontSize: 11 }}>Crop</span>
          </button>

          <button
            type="button"
            title="Remove image"
            aria-label={`Remove ${file.name}`}
            disabled={disabled}
            onClick={onRemove}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px 7px",
              border: "1px solid var(--border)",
              borderRadius: 7,
              background: "transparent",
              color: "var(--text-secondary)",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BulkAddProducts() {
  const navigate = useNavigate();
  const {
  sellerApprovalStatus,
  sellerRejectionReason,
  isApprovedSeller,
} = useAuth();

  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([createProduct()]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [failedProducts, setFailedProducts] = useState([]);

  const [cropTarget, setCropTarget] = useState(null);
  const [cropImage, setCropImage] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [savingCrop, setSavingCrop] = useState(false);

  // Lock the background page while the cropper is open.
  useEffect(() => {
    if (!cropTarget) return undefined;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;

    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      html.style.overflow = previous.htmlOverflow;

      window.scrollTo(0, scrollY);
    };
  }, [cropTarget]);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [shopResponse, categoryResponse] = await Promise.all([
          api.getMyShops(),
          api.getCategories(),
        ]);

        if (cancelled) return;

        const shopList = getList(shopResponse);
        const categoryList = getList(categoryResponse);

        setShops(shopList);
        setCategories(categoryList);

        if (shopList.length > 0) {
          setProducts([createProduct(shopList[0].id)]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load shop and category data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (cropImage) URL.revokeObjectURL(cropImage);
    };
  }, [cropImage]);

  const updateProduct = (localId, updates) => {
    setProducts((current) =>
      current.map((product) =>
        product.localId === localId ? { ...product, ...updates } : product,
      ),
    );
  };

  const addProduct = () => {
    setProducts((current) => [...current, createProduct(shops[0]?.id || "")]);
  };

  const removeProduct = (localId) => {
    setProducts((current) => {
      const remaining = current.filter(
        (product) => product.localId !== localId,
      );

      return remaining.length ? remaining : [createProduct(shops[0]?.id || "")];
    });

    setFailedProducts((current) =>
      current.filter((product) => product.localId !== localId),
    );
  };

  const updateImages = (localId, files) => {
    const selectedImages = Array.from(files || []);
    const product = products.find((item) => item.localId === localId);

    if (!product || selectedImages.length === 0) return;

    const remainingSlots = MAX_IMAGES - product.images.length;

    if (remainingSlots <= 0) {
      setError(
  `Each product can have a maximum of ${MAX_IMAGES} images.`,
);
      return;
    }

    const imageFiles = selectedImages.filter((file) =>
      file.type.startsWith("image/"),
    );

    const acceptedImages = imageFiles.slice(0, remainingSlots);

    if (imageFiles.length !== selectedImages.length) {
      setError("Baadhi ya files ulizochagua si picha, kwa hiyo zimerukwa.");
    } else if (imageFiles.length > remainingSlots) {
      setError(
  `Only ${remainingSlots} images were added to reach the limit of ${MAX_IMAGES}.`,
);
    } else {
      setError("");
    }

    if (acceptedImages.length > 0) {
      updateProduct(localId, {
        images: [...product.images, ...acceptedImages],
      });
    }
  };

  const removeImage = (localId, imageIndex) => {
    const product = products.find((item) => item.localId === localId);
    if (!product) return;

    updateProduct(localId, {
      images: product.images.filter((_, index) => index !== imageIndex),
    });
  };

  const openCropper = (localId, imageIndex) => {
    const product = products.find((item) => item.localId === localId);
    const file = product?.images?.[imageIndex];

    if (!file) return;

    setCropTarget({ localId, imageIndex, file });
    setCropImage(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const closeCropper = () => {
    setCropTarget(null);
    setCropImage("");
    setCroppedAreaPixels(null);
    setSavingCrop(false);
  };

  const saveCroppedImage = async () => {
    if (!cropTarget || !cropImage || !croppedAreaPixels) return;

    try {
      setSavingCrop(true);

      const croppedFile = await getCroppedImage(
        cropImage,
        croppedAreaPixels,
        cropTarget.file,
      );

      const product = products.find(
        (item) => item.localId === cropTarget.localId,
      );

      if (!product) {
        closeCropper();
        return;
      }

      const updatedImages = [...product.images];
      updatedImages[cropTarget.imageIndex] = croppedFile;

      updateProduct(cropTarget.localId, {
        images: updatedImages,
      });

      closeCropper();
    } catch (err) {
      setError(err.message || "Failed to crop image.");
      setSavingCrop(false);
    }
  };

  const isComplete = (product) =>
    Boolean(product.shopId && product.name.trim());

  const publishProducts = async (event) => {
    event.preventDefault();

    if (publishing) return;

    setError("");
    setProgress("");
    setFailedProducts([]);

    const completeProducts = products.filter(isComplete);
    const skippedCount = products.length - completeProducts.length;

    if (completeProducts.length === 0) {
      setError("Jaza jina la bidhaa na uchague shop kwa angalau bidhaa moja.");
      return;
    }

    setPublishing(true);

    const failed = [];
    let successCount = 0;

    for (let index = 0; index < completeProducts.length; index += 1) {
      const product = completeProducts[index];

      setProgress(
        `Inatuma bidhaa ${index + 1} kati ya ${completeProducts.length}: ${product.name}`,
      );

      const formData = new FormData();

      formData.append("shopId", product.shopId);
      formData.append("name", product.name.trim());

      if (product.description.trim()) {
        formData.append("description", product.description.trim());
      }

      if (product.price !== "") {
        formData.append("price", product.price);
      }

      if (product.categoryId) {
        formData.append("categoryId", product.categoryId);
      }

      formData.append("availability", product.availability);

      product.images.forEach((image) => {
        formData.append("images", image);
      });

      try {
        await api.createProduct(formData);
        successCount += 1;
      } catch (err) {
        failed.push({
          ...product,
          error: err.message || "Failed to publish product.",
        });
      }
    }

    if (failed.length > 0) {
      setProducts(failed.map(({ error: _error, ...product }) => product));
      setFailedProducts(failed);

      setProgress(
        `${successCount} bidhaa zimetumwa. ${failed.length} hazikutumwa. ` +
          "Bidhaa zilizoshindikana zimebaki hapa ili ujaribu tena.",
      );
    } else {
      setProgress(
        `${successCount} bidhaa zimetumwa kikamilifu.` +
          (skippedCount > 0
            ? ` Bidhaa ${skippedCount} ambazo hazijakamilika zimerukwa.`
            : ""),
      );

      setProducts([createProduct(shops[0]?.id || "")]);

      setTimeout(() => {
        navigate("/seller/products");
      }, 1000);
    }

    setPublishing(false);
  };

  if (loading) {
    return (
      <div className="page">
        <Header title="Add Products" />
        <Loading />
      </div>
    );
  }

  if (!isApprovedSeller) {
    return (
      <div className="page">
        <Header title="Add Products" />
        <SellerApprovalBanner
  status={sellerApprovalStatus}
  rejectionReason={sellerRejectionReason}
/>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="page">
        <Header title="Add Products" />

        <div className="section">
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <Package
              size={42}
              style={{
                margin: "0 auto 12px",
                color: "var(--primary)",
              }}
            />

            <h3>No shop found</h3>
            <p
              style={{
                color: "var(--text-secondary)",
                margin: "8px 0 16px",
              }}
            >
              Create your shop before adding products.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/seller/setup")}
            >
              Create Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Header title="Add Products" />

      <div className="section">
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ marginBottom: 6 }}>Bulk Add Products</h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 14,
            }}
          >
            Add multiple products in one session. Each product can have up to 10
            photos. Select photos in batches, preview them, crop or remove
            individual photos, then publish.
          </p>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        {progress && (
          <div className="alert" role="status" style={{ marginBottom: 16 }}>
            {progress}
          </div>
        )}

        <form onSubmit={publishProducts}>
          {products.map((product, index) => (
            <div
              key={product.localId}
              className="card"
              style={{ padding: 16, marginBottom: 16 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <h3 style={{ marginBottom: 4 }}>Product {index + 1}</h3>

                  <span
                    style={{
                      fontSize: 12,
                      color: isComplete(product)
                        ? "var(--primary)"
                        : "var(--text-secondary)",
                    }}
                  >
                    {isComplete(product) ? "Ready to publish" : "Incomplete"}
                  </span>
                </div>

                {products.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={publishing}
                    onClick={() => removeProduct(product.localId)}
                    aria-label={`Remove product ${index + 1}`}
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Shop *</label>
                <select
                  className="form-input form-select"
                  value={product.shopId}
                  disabled={publishing}
                  required
                  onChange={(event) =>
                    updateProduct(product.localId, {
                      shopId: event.target.value,
                    })
                  }
                >
                  <option value="">Choose shop</option>
                  {shops.map((shop) => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  className="form-input"
                  type="text"
                  value={product.name}
                  disabled={publishing}
                  placeholder="Enter product name"
                  onChange={(event) =>
                    updateProduct(product.localId, {
                      name: event.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={product.description}
                  disabled={publishing}
                  placeholder="Describe your product"
                  onChange={(event) =>
                    updateProduct(product.localId, {
                      description: event.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price (TSh)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="any"
                  value={product.price}
                  disabled={publishing}
                  placeholder="Enter price"
                  onChange={(event) =>
                    updateProduct(product.localId, {
                      price: event.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input form-select"
                  value={product.categoryId}
                  disabled={publishing}
                  onChange={(event) =>
                    updateProduct(product.localId, {
                      categoryId: event.target.value,
                    })
                  }
                >
                  <option value="">Choose category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Availability</label>
                <select
                  className="form-input form-select"
                  value={product.availability}
                  disabled={publishing}
                  onChange={(event) =>
                    updateProduct(product.localId, {
                      availability: event.target.value,
                    })
                  }
                >
                  <option value="IN_STOCK">In Stock</option>
                  <option value="LOW_STOCK">Low Stock</option>
                  <option value="OUT_OF_STOCK">Out of Stock</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Product Photos (maximum 10)</label>

                <label
                  className="btn btn-secondary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    cursor:
                      publishing || product.images.length >= MAX_IMAGES
                        ? "not-allowed"
                        : "pointer",
                    marginBottom: 10,
                    opacity: product.images.length >= MAX_IMAGES ? 0.6 : 1,
                  }}
                >
                  <ImagePlus size={18} />
                  {product.images.length >= MAX_IMAGES
                    ? "Maximum Photos Selected"
                    : "Select Photos"}

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={publishing || product.images.length >= MAX_IMAGES}
                    style={{ display: "none" }}
                    onChange={(event) => {
                      updateImages(product.localId, event.target.files);
                      event.target.value = "";
                    }}
                  />
                </label>

                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    margin: "0 0 12px",
                  }}
                >
                  You can select multiple photos at once and add more later.
                  Crop and remove each photo individually.
                </p>

                {product.images.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 10,
                    }}
                  >
                    {product.images.map((image, imageIndex) => (
                      <ProductImagePreview
                        key={`${product.localId}-${imageIndex}-${image.name}-${image.lastModified}`}
                        file={image}
                        disabled={publishing}
                        onCrop={() => openCropper(product.localId, imageIndex)}
                        onRemove={() =>
                          removeImage(product.localId, imageIndex)
                        }
                      />
                    ))}
                  </div>
                )}

                <p
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    marginTop: 10,
                  }}
                >
                  {product.images.length} of {MAX_IMAGES} photos selected
                </p>
              </div>

              {failedProducts.some(
                (failed) => failed.localId === product.localId,
              ) && (
                <div className="alert alert-error" role="alert">
                  {
                    failedProducts.find(
                      (failed) => failed.localId === product.localId,
                    )?.error
                  }
                </div>
              )}
            </div>
          ))}

          <div
            className="bulk-product-actions"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginTop: 24,
              marginBottom: 24,
              alignItems: "stretch",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              disabled={publishing}
              onClick={addProduct}
              style={{
                flex: "1 1 180px",
                minHeight: 48,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderRadius: 12,
                fontWeight: 600,
                padding: "12px 18px",
              }}
            >
              <Plus size={18} />
              Add Another Product
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={publishing}
              style={{
                flex: "2 1 220px",
                minHeight: 48,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                borderRadius: 12,
                fontWeight: 600,
                padding: "12px 18px",
              }}
            >
              {publishing ? (
                <>
                  <span className="button-spinner" aria-hidden="true" />
                  Publishing...
                </>
              ) : (
                <>
                  <Package size={18} />
                  Publish Products
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {cropTarget && cropImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Crop product photo"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.78)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            overscrollBehavior: "none",
            touchAction: "none",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: 560,
              padding: 16,
              background: "var(--surface)",
              overscrollBehavior: "none",
              touchAction: "none",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
                gap: 10,
              }}
            >
              <h3 style={{ margin: 0 }}>Crop Photo</h3>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeCropper}
                disabled={savingCrop}
                aria-label="Close cropper"
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                position: "relative",
                height: 320,
                width: "100%",
                background: "#111",
                borderRadius: 10,
                overflow: "hidden",
                overscrollBehavior: "none",
                touchAction: "none",
              }}
            >
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, croppedPixels) =>
                  setCroppedAreaPixels(croppedPixels)
                }
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <label className="form-label">Zoom</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                disabled={savingCrop}
                style={{
                  width: "100%",
                  touchAction: "pan-x",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                flexWrap: "wrap",
                gap: 10,
                marginTop: 16,
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeCropper}
                disabled={savingCrop}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={saveCroppedImage}
                disabled={savingCrop || !croppedAreaPixels}
              >
                {savingCrop ? "Saving..." : "Save Crop"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
