import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', firstName: '', lastName: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to Abysalto.');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.fieldErrors
        ? Object.values(err.response.data.fieldErrors || {}).join(', ')
        : 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div style={styles.page}>
      <div style={styles.card} className="fade-in">
        <div style={styles.header}>
          <div style={styles.iconWrap}><Package size={28} strokeWidth={1.5} /></div>
          <h1 style={styles.title}>Create account</h1>
          <p style={styles.subtitle}>Join Abysalto to start shopping</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>First Name</label>
              <input value={form.firstName} onChange={update('firstName')} placeholder="John" required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Last Name</label>
              <input value={form.lastName} onChange={update('lastName')} placeholder="Doe" required />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input value={form.username} onChange={update('username')} placeholder="johndoe" required minLength={3} />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input type="email" value={form.email} onChange={update('email')} placeholder="john@example.com" required />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={update('password')}
                placeholder="Min 6 characters"
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><UserPlus size={16} /> Create Account</>}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)', padding: '2rem',
  },
  card: {
    background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', padding: '2.5rem',
    width: '100%', maxWidth: 460, boxShadow: 'var(--shadow-lg)',
  },
  header: { textAlign: 'center', marginBottom: '2rem' },
  iconWrap: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 56, height: 56, borderRadius: 'var(--radius-md)',
    background: 'var(--color-accent-light)', color: 'var(--color-accent)', marginBottom: '1rem',
  },
  title: { fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.375rem' },
  subtitle: { color: 'var(--color-text-secondary)', fontSize: '0.9375rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.375rem' },
  label: { fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)' },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer',
  },
  footer: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' },
};
