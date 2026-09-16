import { Settings as SettingsIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header({
  title,
  right,
  titleRight,
  showSettings = true,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const isSettingsPage = location.pathname === '/settings';

  const handleSettings = () => {
    if (isSettingsPage) {
      const from = location.state?.from;

      if (from) {
        navigate(from);
      } else {
        navigate(-1);
      }

      return;
    }

    navigate('/settings', {
      state: {
        from: `${location.pathname}${location.search}`,
      },
    });
  };

  return (
    <header className="header">
      <div className="header-top-row">
        <Link to="/" className="header-brand">
          <span className="header-brand-mark" />
          Smart City
        </Link>

        <div className="header-actions">
          {right}

          {showSettings && (
            <button
              type="button"
              className="header-settings"
              onClick={handleSettings}
              title="Settings"
              aria-label="Settings"
            >
              <SettingsIcon size={19} />
            </button>
          )}
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
