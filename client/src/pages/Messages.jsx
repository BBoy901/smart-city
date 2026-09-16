import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Loading from '../components/Loading';
import { Plus, Search as SearchIcon, Send } from 'lucide-react';
import ChatHeader from '../components/ChatHeader';

function formatConversationTime(dateValue) {
  if (!dateValue) return '';

  const date = new Date(dateValue);
  const now = new Date();

  const diffMs = now - date;
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffHours < 24) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (diffDays < 7) {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    return date.toLocaleDateString([], {
      weekday: 'long',
    });
  }

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getConversationStatus(conv, user) {
  if (conv.unreadCount > 0) {
    return {
      label: 'Unread',
      unread: true,
    };
  }

  if (conv.lastMessage?.senderId === user?.id) {
    return {
      label: 'Sent',
      unread: false,
    };
  }

  return {
    label: 'Seen',
    unread: false,
  };
}

export default function Messages() {
  const { user, refreshUnreadMessages, setChatOpen } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const toUserId = searchParams.get('to');

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const messagesEnd = useRef(null);

  /* Keep BottomNav hidden while a conversation is open */
  useEffect(() => {
    setChatOpen(!!activeConv);

    return () => setChatOpen(false);
  }, [activeConv, setChatOpen]);

  /* Load conversations */
  useEffect(() => {
    if (!user) return;

    api
      .getConversations()
      .then(setConversations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  /*
   * Restore conversation from browser history state.
   * This makes device/browser Back return to the Messages list.
   */
  useEffect(() => {
    const chatFromHistory = location.state?.chat;

    if (chatFromHistory) {
      setActiveConv(chatFromHistory);
      loadMessages(chatFromHistory.id);
    } else if (!toUserId) {
      setActiveConv(null);
      setMessages([]);
    }
  }, [location.state, toUserId]);

  /* Start a conversation when arriving with ?to= */
  useEffect(() => {
    if (!user || !toUserId) return;

    api
      .startConversation(toUserId)
      .then((conv) => {
        /*
         * Create a Messages-list history entry first.
         * Then open the conversation as the next history entry.
         * Device Back therefore returns to Messages list.
         */
        navigate('/messages', {
          replace: true,
        });

        navigate('/messages', {
          state: { chat: conv },
        });

        setActiveConv(conv);
        loadMessages(conv.id);
      })
      .catch(console.error);
  }, [user, toUserId]);

  const loadMessages = async (convId) => {
    try {
      const msgs = await api.getMessages(convId);
      setMessages(msgs);
      refreshUnreadMessages();

      setTimeout(() => {
        messagesEnd.current?.scrollIntoView({
          behavior: 'smooth',
        });
      }, 100);
    } catch (err) {
      console.error(err);
    }
  };

  const openConversation = (conv) => {
    navigate('/messages', {
      state: { chat: conv },
    });

    setActiveConv(conv);
    loadMessages(conv.id);
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !activeConv) return;

    try {
      const msg = await api.sendMessage(
        activeConv.id,
        newMessage
      );

      setMessages((prev) => [...prev, msg]);
      setNewMessage('');

      setTimeout(() => {
        messagesEnd.current?.scrollIntoView({
          behavior: 'smooth',
        });
      }, 100);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const search = messageSearch.trim().toLowerCase();

    if (!search) return true;

    const name =
      conv.otherUser?.name?.toLowerCase() || '';

    const preview =
      conv.lastMessage?.content?.toLowerCase() || '';

    return (
      name.includes(search) ||
      preview.includes(search)
    );
  });

  if (!user) {
    return (
      <div className="page">
        <Header title="Messages" />

        <div className="empty-state">
          <h3>Login to view messages</h3>

          <Link
            to="/login"
            className="btn btn-primary"
            style={{ marginTop: 16 }}
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  /* =========================
     CHAT VIEW
     ========================= */

  if (activeConv) {
    const other =
      activeConv.otherUser ||
      activeConv.participants?.find(
        (p) => p.userId !== user.id
      )?.user;

    return (
      <div
        className="page-no-nav chat-page"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
        }}
      >

        <ChatHeader
  name={other?.name || 'Chat'}
  avatar={other?.name?.[0]?.toUpperCase() || '?'}
/>

        <div className="chat-thread">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`message-bubble ${
                m.senderId === user.id
                  ? 'sent'
                  : 'received'
              }`}
            >
              {m.content}

              <div className="message-time">
                {new Date(
                  m.createdAt
                ).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}

          <div ref={messagesEnd} />
        </div>

        <form
          className="chat-composer"
          onSubmit={handleSend}
        >
          <button
            type="button"
            className="chat-add"
            title="Add"
            aria-label="Add"
          >
            <Plus size={19} />
          </button>

          <input
            className="form-input"
            value={newMessage}
            onChange={(e) =>
              setNewMessage(e.target.value)
            }
            placeholder="Andika ujumbe..."
          />

          <button
            type="submit"
            className="chat-send"
            title="Send"
            aria-label="Send"
          >
            <Send size={17} />
          </button>
        </form>
      </div>
    );
  }

  /* =========================
     MESSAGES LIST
     ========================= */

  return (
    <div className="page">
      <Header
        title="Messages"
        titleRight={
          <div className="messages-inline-search">
            <SearchIcon size={15} />

            <input
              type="search"
              value={messageSearch}
              onChange={(e) =>
                setMessageSearch(e.target.value)
              }
              placeholder="Search..."
              aria-label="Search messages"
            />
          </div>
        }
      />

      {loading ? (
        <Loading />
      ) : filteredConversations.length === 0 ? (
        <div className="messages-empty-state">
          <div
            className="messages-empty-illustration"
            aria-hidden="true"
          >
            <div className="messages-empty-spark spark-one" />
            <div className="messages-empty-spark spark-two" />
            <div className="messages-empty-spark spark-three" />

            <div className="messages-empty-bubble bubble-main">
              <span />
              <span />
              <span />
            </div>

            <div className="messages-empty-bubble bubble-small">
              <span />
              <span />
              <span />
            </div>
          </div>

          <h3>
            {messageSearch
              ? 'No messages found'
              : 'No messages yet'}
          </h3>

          <p>
            {messageSearch
              ? 'Try a different name or message'
              : 'Start a conversation by messaging a seller'}
          </p>
        </div>
      ) : (
        <div className="conversation-list">
          {filteredConversations.map((conv) => {
            const status =
              getConversationStatus(conv, user);

            return (
              <button
                key={conv.id}
                className={`conversation-item ${
                  status.unread
                    ? 'conversation-unread'
                    : ''
                }`}
                onClick={() =>
                  openConversation(conv)
                }
              >
                <div className="conversation-avatar">
                  {conv.otherUser?.name?.[0]?.toUpperCase() ||
                    '?'}
                </div>

                <div className="conversation-content">
                  <div className="conversation-heading">
                    <strong>
                      {conv.otherUser?.name ||
                        'Unknown user'}
                    </strong>
                  </div>

                  <div className="conversation-preview">
                    {conv.lastMessage?.content ||
                      'No messages yet'}
                  </div>
                </div>

                <div className="conversation-side">
                  <time>
                    {formatConversationTime(
                      conv.lastMessageAt
                    )}
                  </time>

                  <div
                    className={`conversation-status ${
                      status.unread
                        ? 'is-unread'
                        : ''
                    }`}
                  >
                    {status.unread && (
                      <span
                        className="conversation-unread-dot"
                        aria-hidden="true"
                      />
                    )}

                    <span>
                      {status.label}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}