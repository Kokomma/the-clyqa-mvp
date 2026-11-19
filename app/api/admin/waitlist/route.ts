import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { WAITLIST_COLLECTION, WaitlistEntry } from '@/lib/waitlist';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Admin-only: the full waitlist with names and emails. The caller must send a
// Firebase ID token, and the matching users/{uid} document must have role 'admin'.
export async function GET(request: Request) {
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let uid: string;
  try {
    uid = (await adminAuth().verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userSnap = await adminDb().collection('users').doc(uid).get();
    if (!userSnap.exists || userSnap.data()?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const snap = await adminDb()
      .collection(WAITLIST_COLLECTION)
      .orderBy('createdAt', 'desc')
      .limit(5000)
      .get();

    const entries: WaitlistEntry[] = snap.docs.map((d) => {
      const data = d.data();
      const created = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null;
      return {
        id: d.id,
        name: data.name ?? '',
        email: data.email ?? '',
        role: data.role === 'brand' ? 'brand' : 'creator',
        handle: data.handle ?? '',
        category: data.category ?? '',
        createdAt: created,
      };
    });

    return NextResponse.json({
      total: entries.length,
      creators: entries.filter((e) => e.role === 'creator').length,
      brands: entries.filter((e) => e.role === 'brand').length,
      entries,
    });
  } catch (err) {
    console.error('admin waitlist failed', err);
    return NextResponse.json({ error: 'Could not load the waitlist' }, { status: 500 });
  }
}
