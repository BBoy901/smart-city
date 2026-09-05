import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Search, Store } from 'lucide-react';

export default function Welcome() {
  return (
    <div className="welcome-page">
      <nav className="welcome-nav">
        <Link to="/welcome" className="welcome-brand"><span className="header-brand-mark" />Smart City</Link>
        <div className="welcome-nav-links">
          <Link to="/explore">Explore</Link>
          <Link to="/login">Log in</Link>
          <Link to="/register" className="welcome-nav-cta">Get started <ArrowRight size={15} /></Link>
        </div>
      </nav>

      <main>
        <section className="welcome-hero welcome-hero-compact">
          <div className="welcome-hero-copy">
            <span className="welcome-kicker">KARIOAKOO PRODUCT DISCOVERY</span>
            <h1 className="welcome-title">Find what you need.<br /><em>Find who sells it.</em></h1>
            <p className="welcome-subtitle">Discover products around you, find the sellers behind them, see where they are, and connect directly.</p>
            <div className="welcome-actions">
              <Link to="/explore" className="btn btn-primary">Explore products</Link>
              <Link to="/register" className="welcome-text-cta">Join Smart City <ArrowRight size={16} /></Link>
            </div>
            <div className="welcome-proof"><span className="proof-dot" /> Products around you. Sellers you can actually find.</div>
          </div>
          <div className="welcome-hero-visual" aria-label="Product discovery preview">
            <div className="visual-label"><span className="visual-pulse" /> Live discovery</div>
            <div className="discovery-stack">
              <div className="discovery-card discovery-card-back"><span>📍</span><strong>Find nearby sellers</strong><small>Kariakoo & beyond</small></div>
              <div className="discovery-card discovery-card-front"><div className="discovery-card-image"><img src="/src/assets/hero.png" alt="" /></div><div><span className="discovery-card-tag">DISCOVER</span><strong>Things worth finding</strong><small>Products from local shops</small></div></div>
            </div>
            <div className="visual-route"><span><Search size={15} /> Discover</span><ArrowRight size={14} /><span><Store size={15} /> Find</span><ArrowRight size={14} /><span><MessageCircle size={15} /> Connect</span></div>
          </div>
        </section>

        <section className="welcome-final-cta"><span className="welcome-kicker">YOUR NEXT FIND IS OUT THERE</span><h2>See what's around you.</h2><Link to="/explore" className="btn btn-primary">Explore products</Link></section>
      </main>

      <footer className="welcome-footer"><Link to="/welcome" className="welcome-brand"><span className="header-brand-mark" />Smart City</Link><span>Discover locally. Connect directly.</span></footer>
    </div>
  );
}
