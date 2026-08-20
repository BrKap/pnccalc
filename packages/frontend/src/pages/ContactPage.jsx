import React from 'react';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import '../styles/contact.css';

export default function ContactPage() {
  return (
    <main className="contact-page">
      <a className="contact-back" href="#/">
        <ArrowLeft size={16} aria-hidden="true" />
        Back to calculators
      </a>

      <section className="contact-card" aria-labelledby="contact-title">
        <span className="contact-icon"><MessageCircle size={26} aria-hidden="true" /></span>
        <p className="eyebrow">Get in touch</p>
        <h1 id="contact-title">Contact</h1>
        <p>
          Want to help verify upgrade data, provide a suggestion, or report an error?
          You can reach me on Discord.
        </p>
        <div className="discord-contact">
          <span>Discord</span>
          <strong>primeprismatic</strong>
        </div>
      </section>
    </main>
  );
}
