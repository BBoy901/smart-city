import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', initialRole: 'CUSTOMER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      if (form.initialRole === 'CUSTOMER') {
        navigate('/onboarding');
      } else {
        navigate('/seller/setup');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      <h1 className="auth-title">Join Smart City</h1>
      <p className="auth-subtitle">Discover products and sellers near you</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div className="form-group">
          <label className="form-label">Phone (optional)</label>
          <input className="form-input" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+255..." />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div className="password-field">
            <input className="form-input" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">I want to start as</label>
          <div className="role-toggle">
            <button type="button" className={form.initialRole === 'CUSTOMER' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setForm({ ...form, initialRole: 'CUSTOMER' })}>
              Customer
            </button>
            <button type="button" className={form.initialRole === 'SELLER' ? 'btn btn-primary' : 'btn btn-secondary'} onClick={() => setForm({ ...form, initialRole: 'SELLER' })}>
              Seller
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
