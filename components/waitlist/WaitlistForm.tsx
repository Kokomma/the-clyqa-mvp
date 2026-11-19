'use client';

import { FormEvent, useState } from 'react';

type Role = 'creator' | 'brand';

export default function WaitlistForm({ onJoined }: { onJoined?: () => void }) {
  const [role, setRole] = useState<Role>('creator');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          email: fd.get('email'),
          role,
          handle: fd.get('handle') ?? '',
          category: fd.get('category') ?? '',
          website: fd.get('website') ?? '',
          marketing: fd.get('marketing') === 'on',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ text: data.error ?? 'Something went wrong. Please try again.', ok: false });
        return;
      }
      setMessage({
        text: data.duplicate
          ? "You're already on the waitlist. We'll be in touch."
          : "You're on the list. Check your inbox for updates.",
        ok: true,
      });
      form.reset();
      onJoined?.();
    } catch {
      setMessage({ text: 'Network error. Please try again.', ok: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="role-switch" role="group" aria-label="I am a">
        <button
          type="button"
          aria-pressed={role === 'creator'}
          className={role === 'creator' ? 'selected' : ''}
          onClick={() => setRole('creator')}
        >
          I’m a creator
        </button>
        <button
          type="button"
          aria-pressed={role === 'brand'}
          className={role === 'brand' ? 'selected' : ''}
          onClick={() => setRole('brand')}
        >
          I’m a brand
        </button>
      </div>

      <label>
        Your name
        <input name="name" maxLength={80} autoComplete="name" required placeholder="What should we call you?" />
      </label>
      <label>
        Email address
        <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </label>
      <div className="form-grid">
        <label>
          {role === 'creator' ? 'Social handle' : 'Brand or company'} <span>(optional)</span>
          <input name="handle" maxLength={100} />
        </label>
        <label>
          Category <span>(optional)</span>
          <input name="category" maxLength={100} />
        </label>
      </div>

      {/* Honeypot: hidden from people, bots tend to fill it in. */}
      <input className="honeypot" tabIndex={-1} aria-hidden="true" autoComplete="off" name="website" />

      <button type="submit" className="button full" disabled={busy}>
        {busy ? 'Joining…' : 'Get early access'}
      </button>
      <p className="form-message" role="status" aria-live="polite">
        {message && <span style={{ color: message.ok ? 'var(--teal)' : '#e11d48' }}>{message.text}</span>}
      </p>
      <label className="checkbox">
        <input type="checkbox" name="marketing" />
        <span>Also send me launch news and marketing updates (optional).</span>
      </label>
      <p className="fine">
        We&apos;ll email you to confirm your place and to invite you when early access opens. <a href="/privacy">Privacy notice</a>
      </p>
    </form>
  );
}
