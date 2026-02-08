import React from 'react';
import { ShoppingCart, Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function CartPage() {
  const { cart, loading, removeFromCart, updateQuantity, clearCart } = useCart();

  if (loading) {
    return <div className="loading-container" style={{ minHeight: 400 }}><div className="spinner" /></div>;
  }

  const items = cart?.items || [];

  return (
    <div style={{ padding: '2rem 0 4rem' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShoppingCart size={24} style={{ color: 'var(--color-accent)' }} /> Cart
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
              {cart?.totalQuantity || 0} items
            </p>
          </div>
          {items.length > 0 && (
            <button onClick={clearCart} className="btn btn-danger btn-sm">
              <Trash2 size={14} /> Clear Cart
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <ShoppingCart size={48} style={{ color: 'var(--color-border)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>Your cart is empty</p>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              Browse Products
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.map((item) => (
                <div key={item.cartItemId} style={styles.item} className="fade-in">
                  <img src={item.thumbnail} alt={item.title} style={styles.thumb} />
                  <div style={styles.itemInfo}>
                    <h3 style={styles.itemTitle}>{item.title}</h3>
                    <p style={styles.itemPrice}>${item.price.toFixed(2)} each</p>
                  </div>
                  <div style={styles.qtyControls}>
                    <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      className="btn btn-ghost" style={{ padding: '0.25rem' }}>
                      <Minus size={14} />
                    </button>
                    <span style={styles.qty}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      className="btn btn-ghost" style={{ padding: '0.25rem' }}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <div style={styles.itemTotal}>
                    <span style={{ fontWeight: 600 }}>${item.discountedTotal.toFixed(2)}</span>
                    {item.discountPercentage > 0 && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                        ${item.total.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <button onClick={() => removeFromCart(item.cartItemId)} className="btn btn-ghost"
                    style={{ color: 'var(--color-danger)', padding: '0.375rem' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            <div style={styles.summary}>
              <h3 style={styles.summaryTitle}>Order Summary</h3>
              <div style={styles.summaryRow}>
                <span>Subtotal ({cart.totalProducts} items)</span>
                <span>${cart.totalPrice.toFixed(2)}</span>
              </div>
              <div style={styles.summaryRow}>
                <span>Discount</span>
                <span style={{ color: 'var(--color-success)' }}>
                  -${(cart.totalPrice - cart.totalDiscountedPrice).toFixed(2)}
                </span>
              </div>
              <div style={styles.divider} />
              <div style={{ ...styles.summaryRow, fontWeight: 700, fontSize: '1.125rem' }}>
                <span>Total</span>
                <span>${cart.totalDiscountedPrice.toFixed(2)}</span>
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }}>
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  item: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)', padding: '1rem',
  },
  thumb: {
    width: 64, height: 64, objectFit: 'contain',
    background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-sm)', flexShrink: 0,
  },
  itemInfo: { flex: 1, minWidth: 0 },
  itemTitle: {
    fontSize: '0.9375rem', fontWeight: 600,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  itemPrice: { fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' },
  qtyControls: {
    display: 'flex', alignItems: 'center', gap: '0.375rem',
    background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-sm)',
    padding: '0.25rem',
  },
  qty: { fontSize: '0.875rem', fontWeight: 600, minWidth: 24, textAlign: 'center' },
  itemTotal: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
    minWidth: 80,
  },
  summary: {
    background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)', padding: '1.5rem',
    position: 'sticky', top: 80,
  },
  summaryTitle: {
    fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem',
  },
  summaryRow: {
    display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem',
    marginBottom: '0.75rem', color: 'var(--color-text-secondary)',
  },
  divider: {
    height: 1, background: 'var(--color-border)', margin: '0.75rem 0',
  },
};
