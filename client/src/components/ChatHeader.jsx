import { Settings as SettingsIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ChatHeader({ name, avatar }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSettings = () => {
    navigate('/settings', {
      state: {
        from: `${location.pathname}${location.search}`,
      },
    });
  };

  return (
    <header className="chat-header">
      <div className="chat-header-top">
        <div className="chat-header-brand">
          <span className="header-brand-mark" />
          Smart City
        </div>

        <button
          type="button"
          className="header-settings"
          onClick={handleSettings}
          title="Settings"
          aria-label="Settings"
        >
          <SettingsIcon size={19} />
        </button>
      </div>

      <div className="chat-header-user">
        <div className="chat-avatar">
          {avatar || name?.charAt(0)?.toUpperCase()}
        </div>

        <strong>{name}</strong>
      </div>
    </header>
  );
}