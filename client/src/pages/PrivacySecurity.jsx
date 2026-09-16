import { KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useLanguage } from '../context/LanguageContext';

export default function PrivacySecurity() {
  const { t } = useLanguage();

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
            <Link
              to="/reset-password"
              className="settings-item"
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
                <span>{t('settings.secure')}</span>
              </span>
            </Link>

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