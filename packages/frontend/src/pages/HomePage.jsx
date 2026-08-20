import React from 'react';
import { BookOpen, Dumbbell, Hammer } from 'lucide-react';
import '../styles/home.css';

const calculators = [
  {
    id: 'research',
    title: 'Research Calculator',
    status: 'Available',
    description: 'Plan research costs, research time, and power.',
    icon: BookOpen,
  },
  {
    id: 'building',
    title: 'Building Calculator',
    status: 'Available',
    description: 'Plan building upgrade costs, construction time, and power.',
    icon: Hammer,
  },
];

const upcomingFeatures = [
  {
    id: 'training',
    title: 'Training Calculator',
    status: 'Not implemented',
    description: 'Plan training costs, promotion costs, healing costs, time, and power',
    icon: Dumbbell,
    disabled: true,
  },
];

function CalculatorCards({ items, onNavigate }) {
  return items.map((calculator) => {
    const Icon = calculator.icon;

    return (
      <button
        type="button"
        className="calculator-link"
        key={calculator.id}
        disabled={calculator.disabled}
        onClick={() => onNavigate(calculator.id)}
      >
        <span className="calculator-icon">
          <Icon size={24} />
        </span>
        <span className="calculator-copy">
          <span className="calculator-title">{calculator.title}</span>
          <span className="calculator-description">{calculator.description}</span>
        </span>
        <span className={calculator.disabled ? 'status muted' : 'status'}>
          {calculator.status}
        </span>
      </button>
    );
  });
}

export default function HomePage({ onNavigate }) {
  return (
    <main className="home-page">
      <header className="home-header">
        <p className="eyebrow">Puzzles & Chaos</p>
        <h1>PNC Calculators</h1>
      </header>

      <section className="calculator-grid" aria-label="Calculator links">
        <CalculatorCards items={calculators} onNavigate={onNavigate} />
      </section>

      <section className="upcoming-section" aria-labelledby="upcoming-title">
        <div className="section-heading">
          <p className="eyebrow">Coming Soon</p>
          <h2 id="upcoming-title">Upcoming Features</h2>
        </div>
        <div className="calculator-grid upcoming-grid">
          <CalculatorCards items={upcomingFeatures} onNavigate={onNavigate} />
        </div>
      </section>

      <footer className="home-footer">
        <a href="#/changelog">Changelog</a>
        <a href="#/contact">Contact</a>
      </footer>
    </main>
  );
}
