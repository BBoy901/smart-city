import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { User, Palette, Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminSettings() {
  const { user } = useAuth();
  const { appearance, setAppearance } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await api.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      });

      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-settings-page">
      <div className="admin-settings-heading">
        <div>
          <h1 className="admin-page-title">Settings</h1>
          <p className="admin-section-copy">
            Manage your admin account and app appearance.
          </p>
        </div>
      </div>

      <section className="admin-settings-card">
        <div className="admin-settings-card-heading">
          <div className="admin-settings-icon">
            <User size={20} />
          </div>
          <div>
            <h2>Admin profile</h2>
            <p>Update your account information.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="admin-settings-form">
          <label>
            Full name
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </label>

          <label>
            Email address
            <input
              className="form-input"
              value={user?.email || ''}
              disabled
              readOnly
            />
            <small>Email address cannot be changed here.</small>
          </label>

          <label>
            Phone number
            <input
              className="form-input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
            />
          </label>

          {message && (
            <div className="admin-settings-success">
              <CheckCircle size={17} />
              {message}
            </div>
          )}

          {error && (
            <div className="admin-settings-error">
              <AlertCircle size={17} />
              {error}
            </div>
          )}

          <button
            className="btn btn-primary admin-settings-save"
            type="submit"
            disabled={saving || !name.trim()}
          >
            <Save size={17} />
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </section>

      <section className="admin-settings-card">
        <div className="admin-settings-card-heading">
          <div className="admin-settings-icon">
            <Palette size={20} />
          </div>
          <div>
            <h2>Appearance</h2>
            <p>Choose how Smart City looks on this device.</p>
          </div>
        </div>

        <div className="admin-appearance-options">
          {[
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              className={`admin-appearance-option ${
                appearance === option.value ? 'active' : ''
              }`}
              onClick={() => setAppearance(option.value)}
              aria-pressed={appearance === option.value}
            >
              <span className={`appearance-preview ${option.value}`} />
              <span>{option.label}</span>
              {appearance === option.value && <CheckCircle size={17} />}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}