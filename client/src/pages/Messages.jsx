import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Loading from '../components/Loading';
import { ArrowLeft, Send, Settings } from 'lucide-react';

export default function Messages() {
  const { user, refreshUnreadMessages, setChatOpen } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toUserId = searchParams.get('to');
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEnd = useRef(null);

  useEffect(() => {
    setChatOpen(!!activeConv);
    return () => setChatOpen(false);
  }, [activeConv, setChatOpen]);

  useEffect(() => {
    if (!user) return;
    api.getConversations().then(setConversations).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user || !toUserId) return;
    api.startConversation(toUserId).then((conv) => {
      setActiveConv(conv);
      loadMessages(conv.id);
    }).catch(console.error);
  }, [user, toUserId]);

  const loadMessages = async (convId) => {
    const msgs = await api.getMessages(convId);
    setMessages(msgs);
    refreshUnreadMessages();
    setTimeout(() => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const openConversation = (conv) => {
    setActiveConv(conv);
    loadMessages(conv.id);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;
    try {
      const msg = await api.sendMessage(activeConv.id, newMessage);
      setMessages((prev) => [...prev, msg]);
      setNewMessage('');
      setTimeout(() => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="page">
        <Header title="Messages" />
        <div className="empty-state">
          <h3>Login to view messages</h3>
          <Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>Login</Link>
        </div>
      </div>
    );
  }

  if (activeConv) {
    const other = activeConv.otherUser || activeConv.participants?.find((p) => p.userId !== user.id)?.user;
    return (
      <div className="page-no-nav" style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
        <header className="chat-header">
          <div className="chat-header-brand"><span className="header-brand-mark" />Smart City</div>
          <div className="chat-header-user">
            <button className="chat-back" onClick={() => { setActiveConv(null); setMessages([]); }} title="Back"><ArrowLeft size={19} /></button>
            <div className="chat-avatar">{other?.name?.[0]?.toUpperCase() || '?'}</div>
            <strong>{other?.name || 'Chat'}</strong>
          </div>
        </header>
        <div className="chat-thread">
          {messages.map((m) => (
            <div key={m.id} className={`message-bubble ${m.senderId === user.id ? 'sent' : 'received'}`}>
              {m.content}
              <div className="message-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          ))}
          <div ref={messagesEnd} />
        </div>
        <form className="chat-composer" onSubmit={handleSend}>
          <input className="form-input" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Andika ujumbe..." style={{ flex: 1 }} />
          <button type="submit" className="chat-send" title="Send"><Send size={17} /></button>
        </form>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="messages-topbar">
        <Link to="/" className="messages-brand"><span className="messages-brand-mark" />Smart City</Link>
        <div className="messages-top-actions">
          <button onClick={() => navigate('/settings')} title="Settings" aria-label="Settings"><Settings size={17} /></button>
        </div>
      </header>
      <h1 className="messages-heading">Messages</h1>
      {loading ? <Loading /> : conversations.length === 0 ? (
        <div className="empty-state">
          <h3>No messages yet</h3>
          <p>Start a conversation by messaging a seller from a product page</p>
        </div>
      ) : (
        <div>
          {conversations.map((conv) => (
            <button key={conv.id} className="conversation-item" onClick={() => openConversation(conv)}>
              <div className="conversation-avatar">
                {conv.otherUser?.name?.[0]}
              </div>
              <div className="conversation-content">
                <div className="conversation-heading"><strong>{conv.otherUser?.name}</strong></div>
                <div className="conversation-preview">
                  {conv.lastMessage?.content || 'No messages yet'}
                </div>
              </div>
              <div className="conversation-side">
                <div className="conversation-time-row">
                  <time>{conv.lastMessageAt && new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                  {conv.unreadCount > 0 && <span className="message-badge">{conv.unreadCount} new</span>}
                </div>
                <span className="conversation-meta">{conv.messageCount || 0} messages · {conv.sentCount || 0} sent</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
