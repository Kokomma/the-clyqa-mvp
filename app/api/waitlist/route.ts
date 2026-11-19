import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { validateWaitlistInput, waitlistDocId, WAITLIST_COLLECTION } from '@/lib/waitlist';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Public live counts shown on the landing page.
export async function GET() {
  try {
    const col = adminDb().collection(WAITLIST_COLLECTION);
    const [total, creators, brands] = await Promise.all([
      col.count().get(),
      col.where('role', '==', 'creator').count().get(),
      col.where('role', '==', 'brand').count().get(),
    ]);
    return NextResponse.json(
      {
        total: total.data().count,
        creators: creators.data().count,
        brands: brands.data().count,
        updatedAt: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } },
    );
  } catch (err) {
    console.error('waitlist count failed', err);
    return NextResponse.json({ error: 'Count unavailable' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = validateWaitlistInput(body);
  if (!parsed.ok) {
    if (parsed.honeypot) return NextResponse.json({ ok: true, duplicate: false });
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data } = parsed;
  try {
    const ref = adminDb().collection(WAITLIST_COLLECTION).doc(waitlistDocId(data.email));
    const existing = await ref.get();
    if (existing.exists) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
    await ref.set({
      name: data.name,
      email: data.email,
      role: data.role,
      handle: data.handle,
      category: data.category,
      marketingOptIn: data.marketing,
      source: 'landing',
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true, duplicate: false }, { status: 201 });
  } catch (err) {
    console.error('waitlist signup failed', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
