import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { WAITLIST_COLLECTION } from '@/lib/waitlist';
import { sendEmailBatch, earlyAccessEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Admin-only: email the early-access invitation to everyone not yet invited.
// Each person is invited once: earlyAccessSentAt is recorded after sending.
export async function POST(request: Request) {
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let uid: string;
  try {
    uid = (await adminAuth().verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = adminDb();
  const userSnap = await db.collection('users').doc(uid).get();
  if (!userSnap.exists || userSnap.data()?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const signupUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/register`;
  // Read everyone and filter in code: Firestore's == null misses documents that lack the field.
  const snap = await db.collection(WAITLIST_COLLECTION).limit(5000).get();
  const pending = snap.docs.filter((d) => d.data().email && !d.data().earlyAccessSentAt);
  if (!pending.length) return NextResponse.json({ sent: 0 });

  try {
    await sendEmailBatch(
      pending.map((d) => ({ ...earlyAccessEmail(d.data().name ?? '', signupUrl), to: d.data().email })),
    );
  } catch (err) {
    console.error('early access send failed', err);
    return NextResponse.json({ error: 'Sending failed. Check the Resend settings and try again.' }, { status: 500 });
  }

  for (let i = 0; i < pending.length; i += 400) {
    const batch = db.batch();
    pending.slice(i, i + 400).forEach((d) => batch.update(d.ref, { earlyAccessSentAt: FieldValue.serverTimestamp() }));
    await batch.commit();
  }

  return NextResponse.json({ sent: pending.length });
}
