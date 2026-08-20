import React from 'react';
import { ArrowLeft } from 'lucide-react';
import '../styles/changelog.css';

const releases = [
  {
    version: '1.2',
    title: 'Added Presets. Export/Import to share across devices or with friends. Added a UI change to show the current and target levels for each upgrade. Created a prerequisites planner.',
    description: 'Rearranged the main page. Fixed construction/research speed UI.',
  },
  {
    version: '1.1.1',
    title: 'Minor UI Fixes',
    description: 'Rearranged the main page. Fixed construction/research speed UI.',
  },
  {
    version: '1.1',
    title: 'Gear, Heroes & Details',
    description: 'Added Gear and Heroes for Cost Reductions along with hover/click information for them and the upgrades.',
  },
  {
    version: '1.0.1',
    title: 'Mobile UI Fixes',
    description: 'Fixed Mobile UI.',
  },
  {
    version: '1.0',
    title: 'Release',
    description: 'Research and Gear Calculator functional.',
  },
];

export default function ChangelogPage() {
  return (
    <main className="changelog-page">
      <header className="changelog-header">
        <a className="changelog-back" href="#/">
          <ArrowLeft size={17} />
          Home
        </a>
        <p className="eyebrow">PNC Calculators</p>
        <h1>Changelog</h1>
        <p>Updates and improvements to the calculators.</p>
      </header>

      <section className="release-list" aria-label="Release history">
        {releases.map((release, index) => (
          <article className="release-entry" key={release.version}>
            <div className="release-marker" aria-hidden="true">
              <span />
              {index < releases.length - 1 && <i />}
            </div>
            <div className="release-card">
              <div className="release-heading">
                <span className="version-pill">Version {release.version}</span>
                <h2>{release.title}</h2>
              </div>
              <p>{release.description}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
