import React from 'react';
import { BookOpen, Dumbbell, Hammer } from 'lucide-react';
import '../styles/home.css';

const calculators = [
  {
    id: 'research',
    title: 'Research Calculator',
    status: 'Available',
    description: 'Plan research costs, time, power, and reductions from local exported data.',
    icon: BookOpen,
  },
  {
    id: 'building',
    title: 'Building Calculator',
    status: 'Available',
    description: 'Plan building upgrade costs, construction time, power, and reductions.',
    icon: Hammer,
  },
  {
    id: 'training',
    title: 'Training Calculator',
    status: 'Not implemented',
    description: 'Reserved for troop training costs, speedups, and batch planning.',
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
