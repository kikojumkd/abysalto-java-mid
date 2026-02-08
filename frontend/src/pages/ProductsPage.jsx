import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { productApi } from '../services/api';
import ProductCard from '../components/ProductCard';

const SORT_OPTIONS = [
  { label: 'Default', sortBy: '', order: '' },
  { label: 'Price: Low → High', sortBy: 'price', order: 'asc' },
  { label: 'Price: High → Low', sortBy: 'price', order: 'desc' },
  { label: 'Rating: Best', sortBy: 'rating', order: 'desc' },
  { label: 'Name: A → Z', sortBy: 'title', order: 'asc' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortIdx, setSortIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 12;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const sort = SORT_OPTIONS[sortIdx];
      let res;
      if (search) {
        res = await productApi.search({ q: search, limit, skip });
      } else {
        res = await productApi.getAll({ limit, skip, sortBy: sort.sortBy || undefined, order: sort.order || undefined });
      }
      setProducts(res.data.products);
      setTotal(res.data.total);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [skip, sortIdx, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSkip(0);
    setSearch(searchInput);
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(skip / limit) + 1;

  return (
    <div style={styles.page}>
      <div className="container">
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Products</h1>
            <p style={styles.subtitle}>{total} products available</p>
          </div>
        </div>

        <div style={styles.toolbar}>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <Search size={16} style={styles.searchIcon} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              style={styles.searchInput}
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(''); setSearch(''); setSkip(0); }}
                style={styles.clearBtn}>✕</button>
            )}
          </form>

          <div style={styles.sortWrap}>
            <SlidersHorizontal size={14} style={{ color: 'var(--color-text-muted)' }} />
            <select
              value={sortIdx}
              onChange={(e) => { setSortIdx(Number(e.target.value)); setSkip(0); }}
              style={styles.select}
            >
              {SORT_OPTIONS.map((opt, i) => (
                <option key={i} value={i}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyText}>No products found{search && ` for "${search}"`}</p>
          </div>
        ) : (
          <>
            <div style={styles.grid}>
              {products.map((p, i) => (
                <div key={p.id} style={{ animationDelay: `${i * 40}ms` }} className="fade-in">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  onClick={() => setSkip(Math.max(0, skip - limit))}
                  disabled={skip === 0}
                  className="btn btn-secondary btn-sm"
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <span style={styles.pageInfo}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setSkip(skip + limit)}
                  disabled={skip + limit >= total}
                  className="btn btn-secondary btn-sm"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '2rem 0 4rem' },
  header: { marginBottom: '1.5rem' },
  title: { fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 600 },
  subtitle: { color: 'var(--color-text-secondary)', fontSize: '0.9375rem', marginTop: '0.25rem' },
  toolbar: {
    display: 'flex', gap: '1rem', marginBottom: '2rem',
    flexWrap: 'wrap', alignItems: 'center',
  },
  searchForm: {
    position: 'relative', flex: 1, minWidth: 240,
  },
  searchIcon: {
    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
    color: 'var(--color-text-muted)',
  },
  searchInput: {
    paddingLeft: '2.5rem', width: '100%',
  },
  clearBtn: {
    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: 'var(--color-text-muted)',
    cursor: 'pointer', fontSize: '0.875rem',
  },
  sortWrap: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
  },
  select: {
    width: 'auto', padding: '0.625rem 0.75rem', fontSize: '0.8125rem',
    minWidth: 170,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '1.25rem',
  },
  pagination: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '1rem', marginTop: '2.5rem',
  },
  pageInfo: {
    fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontWeight: 500,
  },
  empty: {
    textAlign: 'center', padding: '4rem 0',
  },
  emptyText: {
    color: 'var(--color-text-muted)', fontSize: '1rem',
  },
};
