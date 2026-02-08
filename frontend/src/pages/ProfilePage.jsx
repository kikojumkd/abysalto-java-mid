import React, { useState } from 'react';
import { User, Shield, ShieldCheck, ShieldOff, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../services/api';
import QrCode from '../components/QrCode';

export default function ProfilePage() {
  const { user, fetchUser } = useAuth();
  const toast = useToast();
  const [setupData, setSetupData] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const initSetup = async () => {
    setLoading(true);
    try {
      const res = await authApi.setup2fa();
      setSetupData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const confirmSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.confirm2fa(code);
      toast.success('Two-factor authentication enabled!');
      setSetupData(null);
      setCode('');
      await fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const disable2fa = async () => {
    setLoading(true);
    try {
      await authApi.disable2fa();
      toast.success('Two-factor authentication disabled');
      await fetchUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(setupData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
      <div style={{ padding: '2rem 0 4rem' }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 600, marginBottom: '2rem' }}>
            Profile
          </h1>

          {/* User Info */}
          <div style={styles.card} className="fade-in">
            <div style={styles.cardHeader}>
              <div style={styles.avatar}>
                <User size={28} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{user?.firstName} {user?.lastName}</h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>@{user?.username}</p>
              </div>
            </div>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Email</span>
                <span style={styles.infoValue}>{user?.email}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Member since</span>
                <span style={styles.infoValue}>
                {user?.createdAt && new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              </div>
            </div>
          </div>

          {/* 2FA Section */}
          <div style={{ ...styles.card, marginTop: '1.5rem' }} className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <Shield size={20} style={{ color: 'var(--color-accent)' }} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Two-Factor Authentication</h2>
            </div>

            {user?.twoFactorEnabled ? (
                <div>
                  <div style={styles.statusBadge}>
                    <ShieldCheck size={16} />
                    <span>2FA is enabled</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '1rem 0' }}>
                    Your account is protected with TOTP-based two-factor authentication.
                  </p>
                  <button onClick={disable2fa} className="btn btn-danger btn-sm" disabled={loading}>
                    <ShieldOff size={14} /> Disable 2FA
                  </button>
                </div>
            ) : setupData ? (
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                    Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.),
                    or manually enter the secret key.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <QrCode value={setupData.qrCodeUri} size={200} />
                  </div>

                  <div style={styles.secretBox}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Or enter this secret key manually
                  </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <code style={styles.secretCode}>{setupData.secret}</code>
                      <button onClick={copySecret} className="btn btn-ghost btn-sm">
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <form onSubmit={confirmSetup} style={{ marginTop: '1.25rem' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.375rem' }}>
                      Enter code from authenticator
                    </label>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <input
                          type="text"
                          maxLength={6}
                          value={code}
                          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="000000"
                          style={{ maxWidth: 160, textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.3em', fontWeight: 600 }}
                          required
                      />
                      <button type="submit" className="btn btn-primary" disabled={loading || code.length !== 6}>
                        Verify & Enable
                      </button>
                    </div>
                  </form>

                  <button onClick={() => setSetupData(null)} className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }}>
                    Cancel
                  </button>
                </div>
            ) : (
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                    Add an extra layer of security to your account by enabling TOTP-based two-factor authentication.
                  </p>
                  <button onClick={initSetup} className="btn btn-primary btn-sm" disabled={loading}>
                    <Shield size={14} /> Enable 2FA
                  </button>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}

const styles = {
  card: {
    background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)', padding: '1.5rem',
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem',
  },
  avatar: {
    width: 56, height: 56, borderRadius: '50%',
    background: 'var(--color-accent-light)', color: 'var(--color-accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  infoLabel: { fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  infoValue: { fontSize: '0.9375rem', fontWeight: 500 },
  statusBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-sm)',
    background: '#ecfdf5', color: 'var(--color-success)',
    fontSize: '0.8125rem', fontWeight: 500,
  },
  secretBox: {
    background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-sm)',
    padding: '1rem', marginBottom: '1rem',
  },
  secretCode: {
    fontFamily: 'monospace', fontSize: '0.9375rem', fontWeight: 600,
    letterSpacing: '0.08em', wordBreak: 'break-all',
  },
};