import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Onboarding() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  const toggle = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (selected.length > 0) await api.setPreferences(selected);
      navigate('/');
    } catch (err) {
      console.error(err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-no-nav" style={{ padding: '32px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>What are you interested in?</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Select categories to personalize your feed</p>
      </div>

      <div className="chips-row" style={{ justifyContent: 'center', marginBottom: 32 }}>
        {categories.map((c) => (
          <button key={c.id} className={`chip ${selected.includes(c.id) ? 'active' : ''}`} onClick={() => toggle(c.id)}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <button className="btn btn-primary btn-block" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Saving...' : selected.length > 0 ? 'Continue' : 'Skip for now'}
      </button>
    </div>
  );
}
