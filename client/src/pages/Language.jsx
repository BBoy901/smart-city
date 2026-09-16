import { Check, Languages } from 'lucide-react';
import Header from '../components/Header';
import { useLanguage } from '../context/LanguageContext';

const languageOptions = [
  {
    value: 'en',
    label: 'English',
    flag: '🇬🇧',
  },
  {
    value: 'sw',
    label: 'Kiswahili',
    flag: '🇹🇿',
  },
];

export default function Language() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="page settings-page">
      <Header title={t('language.title')} />

      <div className="settings-content">
        <section className="settings-section">
          <div className="settings-section-heading">
            <Languages size={18} />
            <span>{t('language.choose')}</span>
          </div>

          <div className="language-options">
            {languageOptions.map((option) => {
              const isActive = language === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={`language-option ${
                    isActive ? 'active' : ''
                  }`}
                  onClick={() => setLanguage(option.value)}
                  aria-pressed={isActive}
                >
                  <span className="language-option-main">
                    <span className="language-flag">
                      {option.flag}
                    </span>

                    <span>
                      {option.value === 'en'
                        ? t('language.english')
                        : t('language.swahili')}
                    </span>
                  </span>

                  {isActive && (
                    <span className="language-check">
                      <Check size={17} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}