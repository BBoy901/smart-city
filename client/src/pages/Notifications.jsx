import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useLanguage } from '../context/LanguageContext';

const STORAGE_KEY = 'smart-city-notifications';

const defaultPreferences = {
  messages: true,
  products: true,
  marketing: false,
};

export default function Notifications() {
  const { t } = useLanguage();

  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      return saved
        ? { ...defaultPreferences, ...JSON.parse(saved) }
        : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(preferences)
    );
  }, [preferences]);

  const togglePreference = (key) => {
    setPreferences((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  const notificationOptions = [
    {
      key: 'messages',
      title: t('settings.messagesTitle'),
      description: t('settings.messagesDescription'),
    },
    {
      key: 'products',
      title: t('settings.productsTitle'),
      description: t('settings.productsDescription'),
    },
    {
      key: 'marketing',
      title: t('settings.marketingTitle'),
      description: t('settings.marketingDescription'),
    },
  ];

  return (
    <div className="page settings-page">
      <Header title={t('settings.notifications')} />

      <div className="settings-content">
        <section className="settings-section">
          <div className="settings-section-heading">
            <Bell size={18} />
            <span>
              {t('settings.notificationPreferences')}
            </span>
          </div>

          <div className="settings-list">
            {notificationOptions.map((option) => {
              const enabled = preferences[option.key];

              return (
                <div
                  className="settings-item"
                  key={option.key}
                >
                  <div className="settings-item-label notification-label">
                    <span>
                      <strong>{option.title}</strong>
                      <small>{option.description}</small>
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`settings-toggle ${
                      enabled ? 'active' : ''
                    }`}
                    onClick={() =>
                      togglePreference(option.key)
                    }
                    aria-pressed={enabled}
                    aria-label={
                      enabled
                        ? `Disable ${option.title} notifications`
                        : `Enable ${option.title} notifications`
                    }
                  >
                    <span />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}