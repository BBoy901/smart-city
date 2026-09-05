import { Home, Search, Bookmark, MessageCircle, User, Package, PlusCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const { isSellerMode, unreadMessages, chatOpen } = useAuth();

  if (chatOpen) return null;

  const customerLinks = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/saved', icon: Bookmark, label: 'Saved' },
    { to: '/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const sellerLinks = [
    { to: '/seller', icon: Home, label: 'Home' },
    { to: '/seller/products', icon: Package, label: 'Products' },
    { to: '/seller/add-product', icon: PlusCircle, label: 'Add' },
    { to: '/messages', icon: MessageCircle, label: 'Messages' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const links = isSellerMode ? sellerLinks : customerLinks;

  return (
    <nav className="bottom-nav">
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} end={to === '/' || to === '/seller'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Icon />
          <span>{label}</span>
          {label === 'Messages' && unreadMessages > 0 && <span className="nav-badge">{unreadMessages > 99 ? '99+' : unreadMessages}</span>}
        </NavLink>
      ))}
    </nav>
  );
}
