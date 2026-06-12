import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export type WaitlistRole = 'creator' | 'brand';

export interface WaitlistEntry {
  name: string;
  email: string;
  role: WaitlistRole;
}

export type SubmitResult =
  | { ok: true }
  | { ok: false; duplicate: true }
  | { ok: false; duplicate: false; error: string };

export async function submitWaitlist(entry: WaitlistEntry): Promise<SubmitResult> {
  try {
    const q = query(
      collection(db, 'waitlist'),
      where('email', '==', entry.email.toLowerCase().trim())
    );
    const snap = await getDocs(q);
    if (!snap.empty) return { ok: false, duplicate: true };
    await addDoc(collection(db, 'waitlist'), {
      name: entry.name.trim(),
      email: entry.email.toLowerCase().trim(),
      role: entry.role,
      createdAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, duplicate: false, error: String(err) };
  }
}
