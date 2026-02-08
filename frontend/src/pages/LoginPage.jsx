import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Shield, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [twoFactor, setTwoFactor] = useState({ required: false, token: '', code: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, verify2fa } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(form);
      if (result.twoFactorRequired) {
        setTwoFactor({ required: true, token: result.twoFactorToken, code: '' });
        toast.success('Enter your authenticator code');
      } else {
        toast.success('Welcome back!');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handle2faSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verify2fa(twoFactor.token, twoFactor.code);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card} className="fade-in">
        <div style={styles.header}>
          <div style={styles.iconWrap}><Package size={28} strokeWidth={1.5} /></div>
          <h1 style={styles.title}>Welcome back</h1>
          <p style={styles.subtitle}>Sign in to your Abysalto account</p>
        </div>

        {!twoFactor.required ? (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Enter your username"
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordWrap}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>
        ) : (
          <form onSubmit={handle2faSubmit} style={styles.form}>
            <div style={styles.twoFaInfo}>
              <Shield size={20} style={{ color: 'var(--color-accent)' }} />
              <span>Enter the 6-digit code from your authenticator app</span>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Authentication Code</label>
              <input
                type="text"
                maxLength={6}
                value={twoFactor.code}
                onChange={(e) => setTwoFactor({ ...twoFactor, code: e.target.value.replace(/\D/g, '') })}
                placeholder="000000"
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', fontWeight: 600 }}
                autoFocus
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Verify'}
            </button>
            <button type="button" onClick={() => setTwoFactor({ required: false, token: '', code: '' })}
              className="btn btn-secondary" style={{ width: '100%' }}>Back to Login</button>
          </form>
        )}

        <p style={styles.footer}>
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
    padding: '2rem',
  },
  card: {
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-lg)',
    padding: '2.5rem',
    width: '100%',
    maxWidth: 420,
    boxShadow: 'var(--shadow-lg)',
  },
  header: { textAlign: 'center', marginBottom: '2rem' },
  iconWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-accent-light)',
    color: 'var(--color-accent)',
    marginBottom: '1rem',
  },
  title: { fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.375rem' },
  subtitle: { color: 'var(--color-text-secondary)', fontSize: '0.9375rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.125rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.375rem' },
  label: { fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)' },
  passwordWrap: { position: 'relative' },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer',
  },
  twoFaInfo: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.875rem', borderRadius: 'var(--radius-sm)',
    background: 'var(--color-accent-light)', fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
  },
  footer: {
    textAlign: 'center', marginTop: '1.5rem',
    fontSize: '0.875rem', color: 'var(--color-text-secondary)',
  },
};
