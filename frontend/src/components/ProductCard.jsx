import React, { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { productApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProductCard({ product, onFavoriteToggle }) {
  const [favorited, setFavorited] = useState(product.favorited);
  const [favLoading, setFavLoading] = useState(false);
  const { addToCart } = useCart();
  const toast = useToast();

  const discountedPrice = product.price * (1 - product.discountPercentage / 100);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    setFavLoading(true);
    try {
      if (favorited) {
        await productApi.removeFavorite(product.id);
        setFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await productApi.addFavorite(product.id);
        setFavorited(true);
        toast.success('Added to favorites');
      }
      onFavoriteToggle?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update favorites');
    } finally {
      setFavLoading(false);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product.id);
  };

  return (
    <div style={styles.card} className="fade-in">
      <div style={styles.imageContainer}>
        <img src={product.thumbnail} alt={product.title} style={styles.image} />
        {product.discountPercentage > 5 && (
          <span style={styles.discountBadge}>-{Math.round(product.discountPercentage)}%</span>
        )}
        <button
          onClick={toggleFavorite}
          disabled={favLoading}
          style={{ ...styles.favBtn, ...(favorited ? styles.favBtnActive : {}) }}
        >
          <Heart size={16} fill={favorited ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div style={styles.content}>
        <span style={styles.category}>{product.category}</span>
        <h3 style={styles.title}>{product.title}</h3>

        <div style={styles.ratingRow}>
          <Star size={13} fill="#e8b73a" stroke="#e8b73a" />
          <span style={styles.rating}>{product.rating?.toFixed(1)}</span>
          <span style={styles.stock}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        <div style={styles.priceRow}>
          <div>
            <span style={styles.price}>${discountedPrice.toFixed(2)}</span>
            {product.discountPercentage > 0 && (
              <span style={styles.originalPrice}>${product.price.toFixed(2)}</span>
            )}
          </div>
          <button onClick={handleAddToCart} className="btn btn-primary btn-sm" style={styles.cartBtn}>
            <ShoppingCart size={14} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    border: '1px solid var(--color-border)',
    transition: 'all 0.25s ease',
    cursor: 'default',
  },
  imageContainer: {
    position: 'relative',
    background: 'var(--color-bg-elevated)',
    aspectRatio: '4/3',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    maxWidth: '80%',
    maxHeight: '80%',
    objectFit: 'contain',
    transition: 'transform 0.3s ease',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    background: 'var(--color-accent)',
    color: '#ffffff',
    fontSize: '0.6875rem',
    fontWeight: 600,
    padding: '0.2rem 0.5rem',
    borderRadius: 4,
  },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    background: 'rgba(255,255,255,0.9)',
    border: 'none',
    borderRadius: '50%',
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--color-text-muted)',
    transition: 'all 0.2s',
    backdropFilter: 'blur(4px)',
  },
  favBtnActive: {
    color: 'var(--color-danger)',
    background: 'var(--color-danger-light)',
  },
  content: {
    padding: '0.875rem 1rem 1rem',
  },
  category: {
    fontSize: '0.6875rem',
    fontWeight: 500,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  title: {
    fontSize: '0.9375rem',
    fontWeight: 600,
    margin: '0.25rem 0 0.5rem',
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  ratingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    marginBottom: '0.75rem',
  },
  rating: {
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  stock: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
    marginLeft: 'auto',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: '1.0625rem',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  originalPrice: {
    fontSize: '0.8125rem',
    color: 'var(--color-text-muted)',
    textDecoration: 'line-through',
    marginLeft: '0.5rem',
  },
  cartBtn: {
    gap: '0.375rem',
  },
};
