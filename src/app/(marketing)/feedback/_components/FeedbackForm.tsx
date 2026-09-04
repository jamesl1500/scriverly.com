'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import page from '@/styles/pages/marketing.module.scss';

const TYPES = [
  { value: '', label: 'Select a type…' },
  { value: 'bug', label: 'Bug report' },
  { value: 'feature', label: 'Feature request' },
  { value: 'ux', label: 'UX or design suggestion' },
  { value: 'content', label: 'Content or AI feedback quality' },
  { value: 'other', label: 'Other' },
];

export default function FeedbackForm() {
  const [email, setEmail] = useState('');
  const [type, setType] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!type || !message.trim()) {
      setError('Please select a feedback type and enter a message.');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address or leave the field blank.');
      return;
    }

    setSubmitting(true);
    try {
      // Wire to a real API route when ready.
      await new Promise(res => setTimeout(res, 700));
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={page.contactSuccess} role="status">
        <CheckCircle2 size={20} aria-hidden="true" />
        <span>Thanks for the feedback! We review every submission and use it to improve Scriverly.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={page.contactForm}>

      <div className={page.contactField}>
        <label htmlFor="feedback-type" className={page.contactLabel}>Feedback type</label>
        <select
          id="feedback-type"
          className={page.contactInput}
          value={type}
          onChange={e => setType(e.target.value)}
          required
        >
          {TYPES.map(t => (
            <option key={t.value} value={t.value} disabled={t.value === ''}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className={page.contactField}>
        <label htmlFor="feedback-message" className={page.contactLabel}>Your feedback</label>
        <textarea
          id="feedback-message"
          className={page.contactTextarea}
          placeholder="Describe what you noticed, what you expected, or what you would change…"
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={6}
          required
        />
      </div>

      <div className={page.contactField}>
        <label htmlFor="feedback-email" className={page.contactLabel}>
          Email address <span className={page.contactLabelOptional}>(optional — only if you want a reply)</span>
        </label>
        <input
          id="feedback-email"
          type="email"
          className={page.contactInput}
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      {error && (
        <p className={page.contactError} role="alert">{error}</p>
      )}

      <button type="submit" className={page.heroPrimary} disabled={submitting}>
        {submitting ? 'Sending…' : 'Send feedback'}
      </button>

    </form>
  );
}
