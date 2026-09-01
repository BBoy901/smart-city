import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header({ title, showBack = false, right }) {
  const navigate = useNavigate();

  return (
    <header className="header">
      {showBack && (
        <button className="header-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
      )}
      <h1 className="header-title">{title}</h1>
      {right}
    </header>
  );
}
