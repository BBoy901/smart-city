import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(Boolean(location.state?.forgotPassword));
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
      const from = location.state?.from;
      if (from) {
        navigate(from, { replace: true });
      } else if (user.roles.includes('ADMIN')) {
        navigate('/admin', { replace: true });
      } else {
        navigate(user.activeMode === 'SELLER' ? '/seller' : '/', { replace: true });
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
    <div className="page-no-nav auth-page">
      <div className="auth-brand">
        <img src="/smart-city-icon.png" alt="" className="header-brand-logo" />
        <span className="header-brand-name">
          <span className="header-brand-smart">Smart</span>
          <span className="header-brand-city">City</span>
        </span>
      </div>
      <h1 className="auth-title">Welcome back</h1>
      <p className="auth-subtitle">Login to Smart City</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="password-field">
            <input className="form-input" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
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
          <button type="button" className="btn btn-secondary btn-block" onClick={requestReset} disabled={resetLoading}>
            {resetLoading ? 'Preparing link...' : 'Get reset link'}
          </button>
          {resetError && <div className="alert alert-error">{resetError}</div>}
          {resetLink && (
            <div className="reset-link-result">
              <span>Reset link ready</span>
              <a href={resetLink}>{resetLink}</a>
            </div>
          )}
        </div>
      )}

      <p className="auth-footer">
        Don't have an account? <Link to="/register">Create Account</Link>
      </p>
      <p className="auth-footer auth-footer-secondary">
        <Link to="/explore">Continue as guest</Link>
      </p>
    </div>
  );
}
