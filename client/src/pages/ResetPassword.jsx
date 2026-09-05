import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password.length < 8) return setError('Password iwe na angalau herufi 8.');
    if (password !== confirmPassword) return setError('Passwords hazifanani.');
    setLoading(true);
    setError('');
    try {
      await api.resetPassword({ token: searchParams.get('token'), password });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-no-nav auth-page">
      <div className="auth-brand"><span className="header-brand-mark" />Smart City</div>
      <div className="auth-card">
        <h1>Set a new password</h1>
        {done ? (
          <><p className="auth-help">Password yako imebadilishwa. Unaweza kuingia sasa.</p><button className="btn btn-primary btn-block" onClick={() => navigate('/login')}>Go to Login</button></>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group"><label className="form-label">New password</label><div className="password-field"><input className="form-input" type={showPassword ? 'text' : 'password'} minLength="8" value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
            <div className="form-group"><label className="form-label">Confirm password</label><div className="password-field"><input className="form-input" type={showConfirmPassword ? 'text' : 'password'} minLength="8" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /><button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
            <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Updating...' : 'Update password'}</button>
          </form>
        )}
        <Link to="/login" className="auth-back-link">Back to Login</Link>
      </div>
    </div>
  );
}