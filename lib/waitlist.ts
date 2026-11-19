import { createHash } from 'crypto';

export type WaitlistRole = 'creator' | 'brand';

export interface WaitlistInput {
  name: string;
  email: string;
  role: WaitlistRole;
  handle: string;
  category: string;
  consent: true;
}

export interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  role: WaitlistRole;
  handle: string;
  category: string;
  createdAt: string | null;
}

export const WAITLIST_COLLECTION = 'waitlist';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateWaitlistInput(
  body: unknown,
): { ok: true; data: WaitlistInput } | { ok: false; error: string; honeypot?: boolean } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid request' };
  const b = body as Record<string, unknown>;

  // Honeypot field filled in: a bot. Caller answers with success and stores nothing.
  if (typeof b.website === 'string' && b.website.trim() !== '') {
    return { ok: false, error: 'honeypot', honeypot: true };
  }

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  const email = typeof b.email === 'string' ? b.email.trim().toLowerCase() : '';
  const role: WaitlistRole | null = b.role === 'brand' ? 'brand' : b.role === 'creator' ? 'creator' : null;
  const handle = typeof b.handle === 'string' ? b.handle.trim().slice(0, 100) : '';
  const category = typeof b.category === 'string' ? b.category.trim().slice(0, 100) : '';

  if (!name || name.length > 80) return { ok: false, error: 'Please enter your name (80 characters max).' };
  if (!EMAIL_RE.test(email) || email.length > 254) return { ok: false, error: 'Please enter a valid email address.' };
  if (!role) return { ok: false, error: 'Choose whether you are a creator or a brand.' };

  return { ok: true, data: { name, email, role, handle, category, consent: true } };
}

// One document per email, so signing up twice never double-counts.
export function waitlistDocId(email: string): string {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}
