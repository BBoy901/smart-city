import { ArrowRight, MapPin, MessageCircle, Search, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const steps = [
  { icon: Search, title: 'Discover a product', text: 'Browse products from shops around your city.' },
  { icon: Store, title: 'Find the seller', text: 'See who sells it and explore their shop.' },
  { icon: MapPin, title: 'Know the location', text: 'Find useful location details for the shop.' },
  { icon: MessageCircle, title: 'Connect directly', text: 'Message or call the seller when ready.' },
];

export default function About() {
  return (
    <div className="page about-page">
      <Header title="About Smart City" showBack />
      <section className="about-intro">
        <span className="welcome-kicker">SMART CITY</span>
        <h1>Discover locally. Connect directly.</h1>
        <p>Smart City helps you discover products, find the sellers behind them, know where they are, and contact them directly.</p>
      </section>
      <section className="about-steps">
        <h2>How Smart City works</h2>
        {steps.map(({ icon: Icon, title, text }, index) => (
          <div className="about-step" key={title}>
            <span className="about-step-number">0{index + 1}</span>
            <Icon size={21} />
            <div><h3>{title}</h3><p>{text}</p></div>
          </div>
        ))}
      </section>
      <section className="about-audience">
        <div><h2>For customers</h2><p>Find interesting products, save what you like, and spend less time asking where to go.</p></div>
        <div><h2>For sellers</h2><p>Showcase your products, help customers find your shop, and connect with people looking for what you sell.</p></div>
      </section>
      <Link to="/explore" className="about-cta">Explore products <ArrowRight size={17} /></Link>
    </div>
  );
}
