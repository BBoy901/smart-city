import { useEffect, useState } from 'react';

const SPLASH_KEY = 'smart-city-splash-seen';

export default function SplashScreen({ onFinish }) {
  const alreadySeen = typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SPLASH_KEY) === '1';
  const [hide, setHide] = useState(alreadySeen);

  useEffect(() => {
    if (alreadySeen) {
      onFinish();
      return undefined;
    }

    const hideTimer = setTimeout(() => setHide(true), 1200);
    const finishTimer = setTimeout(() => {
      sessionStorage.setItem(SPLASH_KEY, '1');
      onFinish();
    }, 1600);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(finishTimer);
    };
  }, [alreadySeen, onFinish]);

  if (alreadySeen) return null;

  return (
    <div className={`splash-screen ${hide ? 'splash-hide' : ''}`}>
      <img
        src="/smart-city-splash.png"
        alt="Smart City"
        className="splash-image"
      />

      <div className="splash-loader" aria-label="Loading">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
