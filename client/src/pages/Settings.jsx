import { Bell, ChevronRight, Info, Languages, LockKeyhole, Palette, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';

const appearanceOptions = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'System', icon: '⚙️' },
];

const settingsLinks = [
  { label: 'Notifications', icon: Bell },
  { label: 'Language', icon: Languages, value: 'English' },
  { label: 'Privacy & Security', icon: LockKeyhole },
  { label: 'Account', icon: UserRound },
];

export default function Settings() {
  const { appearance, setAppearance } = useTheme();

  return (
    <div className="page settings-page">
      <Header title="Settings" showBack />
      <section className="settings-section">
        <div className="settings-section-heading"><Palette size={18} /> <span>Appearance</span></div>
        <div className="appearance-options" role="group" aria-label="Appearance">
          {appearanceOptions.map((option) => (
            <button
              key={option.value}
              className={`appearance-option ${appearance === option.value ? 'active' : ''}`}
              onClick={() => setAppearance(option.value)}
              aria-pressed={appearance === option.value}
            >
              <span className="appearance-icon">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-section settings-list">
        {settingsLinks.map(({ label, icon: Icon, value }) => (
          <button className="settings-item" key={label}>
            <span className="settings-item-label"><Icon size={19} /> {label}</span>
            <span className="settings-item-value">{value}<ChevronRight size={18} /></span>
          </button>
        ))}
      </section>
      <Link to="/about" className="settings-item settings-about-link">
        <span className="settings-item-label"><Info size={19} /> About Smart City</span>
        <span className="settings-item-value"><ChevronRight size={18} /></span>
      </Link>
    </div>
  );
}
