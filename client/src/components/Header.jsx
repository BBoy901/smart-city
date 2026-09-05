import { Settings as SettingsIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header({ title, showBack = false, right, titleRight, showSettings = true }) {
  return (
    <header className="header">
      <div className="header-top-row">
        <Link to="/" className="header-brand"><span className="header-brand-mark" />Smart City</Link>
        <div className="header-actions">
          {right}
          {showSettings && <Link to="/settings" className="header-settings" title="Settings" aria-label="Settings"><SettingsIcon size={19} /></Link>}
        </div>
      </div>
      {title && title !== 'Smart City' && (
        <div className="header-title-row">
          <h1 className="header-title">{title}</h1>
          {titleRight}
        </div>
      )}
    </header>
  );
}
