import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }) {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHide(true);

      setTimeout(() => {
        onFinish();
      }, 500);
    }, 3500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`splash-screen ${hide ? 'splash-hide' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo">🏙️</div>

        <h1>Smart City</h1>

        <div className="splash-loader">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}