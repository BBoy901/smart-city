import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.roles.includes('ADMIN')) {
        navigate('/admin');
      } else {
        navigate(user.activeMode === 'SELLER' ? '/seller' : '/');
      }
    } catch (err) {
      setError(err.message === 'Invalid credentials' ? 'Email au password si sahihi. Tafadhali hakikisha umeandika vizuri.' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestReset = async () => {
    setResetLoading(true);
    setResetError('');
    try {
      const data = await api.forgotPassword(resetEmail || email);
      if (data.resetToken) setResetLink(`${window.location.origin}/reset-password?token=${encodeURIComponent(data.resetToken)}`);
      else setResetError('Weka email iliyosajiliwa ili kupata reset link.');
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="page-no-nav" style={{ padding: '32px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>🏙️</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Welcome Back</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Login to Smart City</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="password-field"><input className="form-input" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
        </div>
        <button type="button" className="text-button login-forgot" onClick={() => setShowForgotPassword((visible) => !visible)}>
          Forgot password?
        </button>
        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {showForgotPassword && (
        <div className="forgot-password-panel">
          <h3>Reset your password</h3>
          <p>Weka email yako kupata link ya kubadilisha password.</p>
          <input className="form-input" type="email" placeholder="Your email" value={resetEmail || email} onChange={(e) => setResetEmail(e.target.value)} required />
          <button type="button" className="btn btn-secondary btn-block" onClick={requestReset} disabled={resetLoading}>{resetLoading ? 'Preparing link...' : 'Get reset link'}</button>
          {resetError && <div className="alert alert-error">{resetError}</div>}
          {resetLink && <div className="reset-link-result"><span>Reset link ready</span><a href={resetLink}>{resetLink}</a></div>}
        </div>
      )}

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create Account</Link>
      </p>
      <p style={{ textAlign: 'center', marginTop: 12 }}>
        <Link to="/explore" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Continue as guest</Link>
      </p>
    </div>
  );
}
