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
    description: 'Plan building upgrade costs, construction time, andpower.',
    icon: Hammer,
  },
  {
    id: 'training',
    title: 'Troop Calculator',
    status: 'Not implemented',
    description: 'Plan training costs, promotion costs, healing costs, time, and power',
    icon: Dumbbell,
    disabled: true,
  },
];

export default function HomePage({ onNavigate }) {
  return (
    <main className="home-page">
      <header className="home-header">
        <p className="eyebrow">Puzzles & Chaos</p>
        <h1>PNC Calculators</h1>
      </header>

      <section className="calculator-grid" aria-label="Calculator links">
        {calculators.map((calculator) => {
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
        })}
      </section>
    </main>
  );
}
