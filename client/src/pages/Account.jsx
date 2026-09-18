import { useEffect, useState } from 'react';
import { Mail, Phone, UserRound } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api/client';

export default function Account() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    });
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccess('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setSuccess('');
    setError('');

    try {
      await api.updateProfile({
        name: form.name.trim(),
        phone: form.phone.trim(),
      });

      await refreshUser();

      setSuccess(t('settings.accountUpdated'));
    } catch (err) {
      setError(
        err.message || t('settings.unableToUpdateAccount')
      );
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="page settings-page">
      <Header title={t('settings.account')} />

      <div className="settings-content">
        <section className="settings-section">
          <div className="settings-section-heading">
            <UserRound size={18} />
            <span>
              {t('settings.accountInformation')}
            </span>
          </div>

          <form
            className="account-form"
            onSubmit={handleSubmit}
          >
            <div className="account-avatar">
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>

            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <div className="form-group">
              <label
                className="form-label"
                htmlFor="account-name"
              >
                {t('settings.name')}
              </label>

              <div className="account-input-wrap">
                <UserRound size={17} />

                <input
                  id="account-name"
                  name="name"
                  className="form-input"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label
                className="form-label"
                htmlFor="account-email"
              >
                {t('settings.email')}
              </label>

              <div className="account-input-wrap">
                <Mail size={17} />

                <input
                  id="account-email"
                  name="email"
                  type="email"
                  className="form-input"
                  value={form.email}
                  readOnly
                  disabled
                />
              </div>
            </div>

            <div className="form-group">
              <label
                className="form-label"
                htmlFor="account-phone"
              >
                {t('settings.phone')}
              </label>

              <div className="account-input-wrap">
                <Phone size={17} />

                <input
                  id="account-phone"
                  name="phone"
                  type="tel"
                  className="form-input"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+255..."
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={saving}
            >
              {saving
                ? t('settings.saving')
                : t('settings.saveChanges')}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
