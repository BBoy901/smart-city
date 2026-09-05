import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);

  const refreshUnreadMessages = useCallback(async () => {
    if (!localStorage.getItem('token')) { setUnreadMessages(0); return; }
    try {
      const conversations = await api.getConversations();
      setUnreadMessages(conversations.reduce((total, conversation) => total + (conversation.unreadCount || 0), 0));
    } catch {
      setUnreadMessages(0);
    }
  }, []);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const data = await api.getMe();
      setUser(data);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  useEffect(() => {
    if (!user) { setUnreadMessages(0); return undefined; }
    refreshUnreadMessages();
    const timer = setInterval(refreshUnreadMessages, 30000);
    return () => clearInterval(timer);
  }, [user, refreshUnreadMessages]);

  const login = async (email, password) => {
    const { token, user: u } = await api.login({ email, password });
    localStorage.setItem('token', token);
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const { token, user: u } = await api.register(data);
    localStorage.setItem('token', token);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    const data = await api.getMe();
    setUser(data);
    return data;
  };

  const switchMode = async (mode) => {
    const updated = await api.switchMode(mode);
    setUser(updated);
    return updated;
  };

  const addRole = async (role) => {
    const updated = await api.addRole(role);
    setUser(updated);
    return updated;
  };

  const isCustomer = user?.roles?.includes('CUSTOMER');
  const isSeller = user?.roles?.includes('SELLER');
  const isAdmin = user?.roles?.includes('ADMIN');
  const isSellerMode = user?.activeMode === 'SELLER';

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout, refreshUser, switchMode, addRole,
      isCustomer, isSeller, isAdmin, isSellerMode, unreadMessages, refreshUnreadMessages,
      chatOpen, setChatOpen, isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
