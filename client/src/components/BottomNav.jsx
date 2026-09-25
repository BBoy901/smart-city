import {
  Home,
  Search,
  Bookmark,
  MessageCircle,
  User,
  Package,
  PlusCircle,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function BottomNav() {
  const { isSellerMode, unreadMessages, chatOpen } = useAuth();

  if (chatOpen) return null;

  const messageBadge = unreadMessages > 0 && (
    <span className="nav-badge">
      {unreadMessages > 99 ? "99+" : unreadMessages}
    </span>
  );

  if (isSellerMode) {
    const sellerLinks = [
      { to: "/seller", icon: Home, label: "Home" },
      { to: "/seller/products", icon: Package, label: "Products" },
      { to: "/seller/add-product", icon: PlusCircle, label: "Add" },
      { to: "/messages", icon: MessageCircle, label: "Messages" },
      { to: "/profile", icon: User, label: "Profile" },
    ];

    return (
      <nav
        className="bottom-nav bottom-nav--seller"
        aria-label="Seller navigation"
      >
        {sellerLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/seller"}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            {label === "Messages" ? (
              <span className="nav-icon-wrap">
                <Icon aria-hidden="true" />
                {messageBadge}
              </span>
            ) : (
              <Icon aria-hidden="true" />
            )}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    );
  }

  return (
    <nav
      className="bottom-nav bottom-nav--customer"
      aria-label="Main navigation"
    >
      <NavLink
        to="/"
        end
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <Home aria-hidden="true" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/saved"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <Bookmark aria-hidden="true" />
        <span>Saved</span>
      </NavLink>

      <NavLink
        to="/search"
        aria-label="Search"
        className={({ isActive }) =>
          `nav-item nav-item--search ${isActive ? "active" : ""}`
        }
      >
        <span className="nav-search-button">
          <Search aria-hidden="true" />
        </span>
        <span className="nav-search-label">Search</span>
      </NavLink>

      <NavLink
        to="/messages"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <span className="nav-icon-wrap">
          <MessageCircle aria-hidden="true" />
          {messageBadge}
        </span>
        <span>Messages</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
      >
        <User aria-hidden="true" />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
