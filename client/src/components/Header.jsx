import { ChevronLeft, Settings as SettingsIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header({
  title,
  right,
  titleRight,
  showBack = false,
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
        <div className="header-left">
          {showBack && (
            <button
              type="button"
              className="header-back"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <Link to="/" className="header-brand" aria-label="Smart City home">
            <img
              src="/smart-city-icon.png"
              alt=""
              className="header-brand-logo"
            />
            <span className="header-brand-name">
              <span className="header-brand-smart">Smart</span>
              <span className="header-brand-city">City</span>
            </span>
          </Link>
        </div>

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
