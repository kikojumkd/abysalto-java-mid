import React, { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';
import { productApi } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function FavoritesPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productApi.getFavorites();
      setProducts(res.data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  return (
    <div style={{ padding: '2rem 0 4rem' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Heart size={24} style={{ color: 'var(--color-accent)' }} /> Favorites
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
            {products.length} saved {products.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Heart size={48} style={{ color: 'var(--color-border)', marginBottom: '1rem' }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>No favorites yet</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Browse products and heart the ones you like
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onFavoriteToggle={fetchFavorites} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
