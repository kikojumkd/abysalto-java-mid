import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, User, LogOut, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.logo}>
          <Package size={22} strokeWidth={1.5} />
          <span style={styles.logoText}>Abysalto</span>
          <span style={styles.logoBadge}>store</span>
        </Link>

        <div style={styles.links}>
          <Link to="/" style={{ ...styles.link, ...(isActive('/') ? styles.activeLink : {}) }}>
            Products
          </Link>
          <Link to="/favorites" style={{ ...styles.link, ...(isActive('/favorites') ? styles.activeLink : {}) }}>
            <Heart size={16} />
            Favorites
          </Link>
          <Link to="/cart" style={styles.cartLink}>
            <ShoppingCart size={18} />
            {itemCount > 0 && <span style={styles.badge}>{itemCount}</span>}
          </Link>

          <div style={styles.divider} />

          <Link to="/profile" style={styles.userLink}>
            <User size={16} />
            <span>{user?.firstName}</span>
          </Link>
          <button onClick={logout} style={styles.logoutBtn} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: '#ffffff',
    borderBottom: '1px solid var(--color-border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(12px)',
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: 'var(--color-text)',
    textDecoration: 'none',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  logoBadge: {
    fontSize: '0.6875rem',
    fontWeight: 500,
    background: 'var(--color-accent-light)',
    color: 'var(--color-accent)',
    padding: '0.125rem 0.5rem',
    borderRadius: 20,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-secondary)',
    fontSize: '0.875rem',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  activeLink: {
    color: 'var(--color-accent)',
    background: 'var(--color-accent-light)',
  },
  cartLink: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-secondary)',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    background: 'var(--color-accent)',
    color: '#ffffff',
    fontSize: '0.625rem',
    fontWeight: 700,
    width: 18,
    height: 18,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: 24,
    background: 'var(--color-border)',
    margin: '0 0.5rem',
  },
  userLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-secondary)',
    fontSize: '0.875rem',
    textDecoration: 'none',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-muted)',
    background: 'transparent',
    transition: 'all 0.2s',
  },
};
