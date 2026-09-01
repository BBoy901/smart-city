import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Loading from '../components/Loading';
import { Send } from 'lucide-react';

export default function Messages() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const toUserId = searchParams.get('to');
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEnd = useRef(null);

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
        <Header title={other?.name || 'Chat'} showBack right={
          <button onClick={() => { setActiveConv(null); setMessages([]); }} style={{ fontSize: '0.8125rem', color: 'var(--primary)' }}>Back</button>
        } />
        <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
          {messages.map((m) => (
            <div key={m.id} className={`message-bubble ${m.senderId === user.id ? 'sent' : 'received'}`}>
              {m.content}
              <div className="message-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          ))}
          <div ref={messagesEnd} />
        </div>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid var(--border)' }}>
          <input className="form-input" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." style={{ flex: 1 }} />
          <button type="submit" className="btn btn-primary btn-sm"><Send size={18} /></button>
        </form>
      </div>
    );
  }

  return (
    <div className="page">
      <Header title="Messages" />
      {loading ? <Loading /> : conversations.length === 0 ? (
        <div className="empty-state">
          <h3>No messages yet</h3>
          <p>Start a conversation by messaging a seller from a product page</p>
        </div>
      ) : (
        <div>
          {conversations.map((conv) => (
            <button key={conv.id} onClick={() => openConversation(conv)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, width: '100%', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                {conv.otherUser?.name?.[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{conv.otherUser?.name}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {conv.lastMessage?.content || 'No messages yet'}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
