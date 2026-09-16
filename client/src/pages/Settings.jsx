import {
  Bell,
  ChevronRight,
  Info,
  Languages,
  LockKeyhole,
  Palette,
  UserRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function Settings() {
  const { appearance, setAppearance } = useTheme();
  const { language, t } = useLanguage();
  const appearanceOptions = [
  {
    value: 'light',
    label: t('settings.appearanceLight'),
    icon: '☀️',
  },
  {
    value: 'dark',
    label: t('settings.appearanceDark'),
    icon: '🌙',
  },
  {
    value: 'system',
    label: t('settings.appearanceSystem'),
    icon: '⚙️',
  },
];

  const settingsLinks = [
    {
      label: t('settings.notifications'),
      icon: Bell,
      to: '/notifications',
    },
    {
      label: t('settings.language'),
      icon: Languages,
      value:
        language === 'sw'
          ? t('language.swahili')
          : t('language.english'),
      to: '/language',
    },
    {
      label: t('settings.privacySecurity'),
      icon: LockKeyhole,
      to: '/privacy-security',
    },
    {
      label: t('settings.account'),
      icon: UserRound,
      to: '/account',
    },
  ];

  return (
    <div className="page settings-page">
      <Header title={t('settings.title')} showBack />

      <div className="settings-content">
        {/* Appearance */}
        <section className="settings-section">
          <div className="settings-section-heading">
            <Palette size={18} />
            <span>{t('settings.appearance')}</span>
          </div>

          <div
            className="appearance-options"
            role="group"
            aria-label={t('settings.appearance')}
          >
            {appearanceOptions.map((option) => {
              const isActive = appearance === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`appearance-option ${
                    isActive ? 'active' : ''
                  }`}
                  onClick={() => setAppearance(option.value)}
                  aria-pressed={isActive}
                >
                  <span className="appearance-icon">
                    {option.icon}
                  </span>

                  <span className="appearance-label">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Preferences */}
        <section className="settings-section">
          <div className="settings-section-heading">
            <span>{t('settings.preferences')}</span>
          </div>

          <div className="settings-list">
            {settingsLinks.map(({ label, icon: Icon, value, to }) => {
              const content = (
                <>
                  <span className="settings-item-label">
                    <Icon size={19} />
                    <span>{label}</span>
                  </span>

                  <span className="settings-item-value">
                    {value && <span>{value}</span>}
                    <ChevronRight size={18} />
                  </span>
                </>
              );

              return (
                <Link
                  className="settings-item"
                  key={label}
                  to={to}
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </section>

        {/* About */}
<section className="settings-section">
  <div className="settings-list settings-about-list">
    <Link
      to="/about"
      className="settings-item settings-about-link"
    >
      <span className="settings-item-label">
        <Info size={19} />
        <span>{t('settings.about')}</span>
      </span>

      <span className="settings-item-value">
        <ChevronRight size={18} />
      </span>
    </Link>
  </div>
</section>
      </div>
    </div>
  );
}