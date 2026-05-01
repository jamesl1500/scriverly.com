'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import page from '@/styles/pages/marketing.module.scss';

const SUBJECTS = [
  { value: '', label: 'Select a subject…' },
  { value: 'general', label: 'General inquiry' },
  { value: 'account', label: 'Account or billing' },
  { value: 'bug', label: 'Bug report' },
  { value: 'feature', label: 'Feature request' },
  { value: 'privacy', label: 'Privacy or data' },
  { value: 'other', label: 'Other' },
];

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !subject || !message.trim()) {
      setError('Please fill in all fields before submitting.');
      return;
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    try {
      // In production, wire this to a real API route or email service.
      // For now, simulate a short network delay.
      await new Promise(res => setTimeout(res, 800));
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={page.contactSuccess} role="status">
        <CheckCircle2 size={20} aria-hidden="true" />
        <span>
          Thanks for reaching out! We&apos;ve received your message and will get back to you within
          1–2 business days.
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={page.contactForm}>
      <div className={page.contactFormRow}>
        <div className={page.contactField}>
          <label htmlFor="contact-name" className={page.contactLabel}>Full name</label>
          <input
            id="contact-name"
            type="text"
            className={page.contactInput}
            placeholder="Jane Smith"
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>
        <div className={page.contactField}>
          <label htmlFor="contact-email" className={page.contactLabel}>Email address</label>
          <input
            id="contact-email"
            type="email"
            className={page.contactInput}
            placeholder="jane@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
      </div>

      <div className={page.contactField}>
        <label htmlFor="contact-subject" className={page.contactLabel}>Subject</label>
        <select
          id="contact-subject"
          className={page.contactInput}
          value={subject}
          onChange={e => setSubject(e.target.value)}
          required
        >
          {SUBJECTS.map(s => (
            <option key={s.value} value={s.value} disabled={s.value === ''}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className={page.contactField}>
        <label htmlFor="contact-message" className={page.contactLabel}>Message</label>
        <textarea
          id="contact-message"
          className={page.contactTextarea}
          placeholder="Tell us how we can help…"
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={6}
          required
        />
      </div>

      {error && <p className={page.contactError} role="alert">{error}</p>}

      <button
        type="submit"
        className={page.contactSubmit}
        disabled={submitting}
      >
        {submitting ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
