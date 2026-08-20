import React, { useEffect, useMemo, useState } from 'react';
import BuildingCalculator from './features/building/BuildingCalculator.jsx';
import HomePage from './pages/HomePage.jsx';
import ResearchCalculator from './features/research/ResearchCalculator.jsx';
import ThemeControl from './features/calculator/components/ThemeControl.jsx';
import ChangelogPage from './pages/ChangelogPage.jsx';
import { PresetProvider } from './features/presets/PresetContext.jsx';
import PlannerPage from './features/planner/PlannerPage.jsx';

const ROUTES = {
  home: 'home',
  research: 'research',
  building: 'building',
  changelog: 'changelog',
  planner: 'planner',
};

function getRoute(hash) {
  if (/^#\/planner\/(research|building)\//.test(hash)) return ROUTES.planner;
  if (hash === '#/research') return ROUTES.research;
  if (hash === '#/building') return ROUTES.building;
  if (hash === '#/changelog') return ROUTES.changelog;
  return ROUTES.home;
}

function parsePlannerHash(hash) {
  const match = hash.match(/^#\/planner\/(research|building)\/([^?]+)(?:\?(.*))?$/);
  if (!match) return null;
  const params = new URLSearchParams(match[3] ?? '');
  return {
    type: match[1],
    goalId: decodeURIComponent(match[2]),
    level: Number(params.get('level')) || 0,
  };
}

export default function App() {
  const [locationHash, setLocationHash] = useState(() => window.location.hash);
  const route = getRoute(locationHash);

  useEffect(() => {
    const syncRoute = () => setLocationHash(window.location.hash);
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  const navigate = (nextRoute) => {
    const hashes = {
      [ROUTES.research]: '#/research',
      [ROUTES.building]: '#/building',
      [ROUTES.changelog]: '#/changelog',
      [ROUTES.home]: '#/',
    };
    window.location.hash = hashes[nextRoute] ?? hashes[ROUTES.home];
  };

  const page = useMemo(() => {
    if (route === ROUTES.research) {
      return <ResearchCalculator onNavigateHome={() => navigate(ROUTES.home)} />;
    }

    if (route === ROUTES.building) {
      return <BuildingCalculator onNavigateHome={() => navigate(ROUTES.home)} />;
    }

    if (route === ROUTES.changelog) {
      return <ChangelogPage />;
    }

    if (route === ROUTES.planner) {
      return <PlannerPage planner={parsePlannerHash(locationHash)} />;
    }

    return <HomePage onNavigate={navigate} />;
  }, [route, locationHash]);

  return (
    <PresetProvider>
      <ThemeControl />
      {page}
    </PresetProvider>
  );
}
