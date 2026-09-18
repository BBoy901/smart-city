import { useState } from 'react';
import { KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api/client';

export default function PrivacySecurity() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLink, setResetLink] = useState('');

  const requestReset = async () => {
    setResetLoading(true);
    setResetError('');
    setResetLink('');
    try {
      const data = await api.forgotPassword(user?.email);
      if (data.resetToken) {
        setResetLink(`${window.location.origin}/reset-password?token=${encodeURIComponent(data.resetToken)}`);
      } else {
        setResetError(t('settings.resetPasswordDescription'));
      }
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="page settings-page">
      <Header title={t('settings.privacySecurity')} />

      <div className="settings-content">
        <section className="settings-section">
          <div className="settings-section-heading">
            <ShieldCheck size={18} />
            <span>{t('settings.security')}</span>
          </div>

          <div className="settings-list">
            <button
              type="button"
              className="settings-item"
              onClick={requestReset}
              disabled={resetLoading}
            >
              <span className="settings-item-label">
                <KeyRound size={19} />

                <span>
                  <strong>{t('settings.resetPassword')}</strong>
                  <small>
                    {t('settings.resetPasswordDescription')}
                  </small>
                </span>
              </span>

              <span className="settings-item-value">
                <span>{resetLoading ? t('settings.saving') : t('settings.secure')}</span>
              </span>
            </button>

            {resetError && <div className="alert alert-error">{resetError}</div>}
            {resetLink && (
              <div className="reset-link-result">
                <span>Reset link ready</span>
                <a href={resetLink}>{resetLink}</a>
              </div>
            )}

            <div className="settings-item">
              <span className="settings-item-label">
                <LockKeyhole size={19} />

                <span>
                  <strong>{t('settings.accountProtection')}</strong>
                  <small>
                    {t('settings.accountProtectionDescription')}
                  </small>
                </span>
              </span>

              <span className="security-status">
                <ShieldCheck size={16} />
                {t('settings.protected')}
              </span>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <div className="security-info">
            <ShieldCheck size={20} />

            <div>
              <strong>
                {t('settings.keepAccountSecure')}
              </strong>

              <p>
                {t('settings.keepAccountSecureDescription')}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
