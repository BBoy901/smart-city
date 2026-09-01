import { Link } from 'react-router-dom';

export default function Welcome() {
  return (
    <div className="welcome-hero">
      <div className="welcome-logo">🏙️</div>
      <h1 className="welcome-title">Smart City</h1>
      <p className="welcome-subtitle">Find what you need. Know where to find it.</p>
      <div className="welcome-actions">
        <Link to="/explore" className="btn btn-primary">Explore</Link>
        <Link to="/login" className="btn btn-secondary">Login</Link>
        <Link to="/register" className="btn btn-secondary">Create Account</Link>
      </div>
    </div>
  );
}
