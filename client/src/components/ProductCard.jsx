import { Heart, Bookmark, MessageCircle, Phone, MapPin, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl } from '../api/client';

export default function ProductCard({ product, onLike, onSave }) {
  const image = product.images?.[0]?.url;
  const location = product.shop?.location;

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <div className="product-card-image">
          {image ? (
            <img src={getImageUrl(image)} alt={product.name} loading="lazy" />
          ) : (
            <div className="product-card-placeholder">📦</div>
          )}
        </div>
      </Link>
      <div className="product-card-body">
        <Link to={`/product/${product.id}`}>
          <div className="product-card-name">{product.name}</div>
          {product.price && <div className="product-card-price">{formatPrice(product.price)}</div>}
          <div className="product-card-seller">{product.shop?.name}</div>
          {location && (
            <div className="product-card-location">
              <MapPin size={12} /> {location.area}
            </div>
          )}
        </Link>
      </div>
      <div className="product-card-actions">
        <button className="btn-icon" onClick={() => onLike?.(product.id)} title="Like">
          <Heart size={18} fill={product.isLiked ? 'var(--danger)' : 'none'} color={product.isLiked ? 'var(--danger)' : 'currentColor'} />
        </button>
        <button className="btn-icon" onClick={() => onSave?.(product.id)} title="Save">
          <Bookmark size={18} fill={product.isSaved ? 'var(--primary)' : 'none'} color={product.isSaved ? 'var(--primary)' : 'currentColor'} />
        </button>
        <Link to={`/shop/${product.shop?.id}`} className="btn-icon" title="View Seller">
          <Store size={18} />
        </Link>
        {product.shop?.phone && (
          <a href={`tel:${product.shop.phone}`} className="btn-icon" title="Call">
            <Phone size={18} />
          </a>
        )}
        <Link to={`/messages?to=${product.shop?.sellerProfile?.user?.id}`} className="btn-icon" title="Message">
          <MessageCircle size={18} />
        </Link>
      </div>
    </div>
  );
}
