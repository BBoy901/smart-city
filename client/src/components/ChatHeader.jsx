import { Settings as SettingsIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ChatHeader({ name, avatar, lastSeenAt }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleSettings = () => {
    navigate("/settings", {
      state: {
        from: `${location.pathname}${location.search}`,
      },
    });
  };

  return (
    <header className="chat-header">
      <div className="chat-header-top">
        <div className="chat-header-brand">
          <img
            src="/smart-city-icon.png"
            alt=""
            className="header-brand-logo"
          />
          <span className="header-brand-name">
            <span className="header-brand-smart">Smart</span>
            <span className="header-brand-city">City</span>
          </span>
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

  <div>
    <strong>{name}</strong>

    <div
      style={{
        marginTop: 2,
        fontSize: 12,
        color:
          lastSeenAt &&
          Date.now() - new Date(lastSeenAt).getTime() <= 30 * 1000
            ? "#22c55e"
            : "var(--text-secondary)",
      }}
    >
      {lastSeenAt &&
      Date.now() - new Date(lastSeenAt).getTime() <= 30 * 1000
        ? "🟢 Online"
        : "⚪ Offline"}
    </div>
  </div>
</div>
    </header>
  );
}
