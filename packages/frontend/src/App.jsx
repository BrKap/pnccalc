import React, { useEffect, useMemo, useState } from 'react';
import BuildingCalculator from './features/building/BuildingCalculator.jsx';
import HomePage from './pages/HomePage.jsx';
import ResearchCalculator from './features/research/ResearchCalculator.jsx';
import ThemeControl from './features/calculator/components/ThemeControl.jsx';

const ROUTES = {
  home: 'home',
  research: 'research',
  building: 'building',
};

function getInitialRoute() {
  if (window.location.hash === '#/research') return ROUTES.research;
  if (window.location.hash === '#/building') return ROUTES.building;
  return ROUTES.home;
}

export default function App() {
  const [route, setRoute] = useState(getInitialRoute);

  useEffect(() => {
    const syncRoute = () => setRoute(getInitialRoute());
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  const navigate = (nextRoute) => {
    const hashes = {
      [ROUTES.research]: '#/research',
      [ROUTES.building]: '#/building',
      [ROUTES.home]: '#/',
    };
    window.location.hash = hashes[nextRoute] ?? hashes[ROUTES.home];
    setRoute(nextRoute);
  };

  const page = useMemo(() => {
    if (route === ROUTES.research) {
      return <ResearchCalculator onNavigateHome={() => navigate(ROUTES.home)} />;
    }

    if (route === ROUTES.building) {
      return <BuildingCalculator onNavigateHome={() => navigate(ROUTES.home)} />;
    }

    return <HomePage onNavigate={navigate} />;
  }, [route]);

  return (
    <>
      <ThemeControl />
      {page}
    </>
  );
}
