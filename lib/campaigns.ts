import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Campaign, CampaignStatus } from '@/types';

function toCampaign(id: string, data: Record<string, unknown>): Campaign {
  return {
    ...data,
    id,
    createdAt: data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : data.createdAt,
  } as Campaign;
}

export async function createCampaign(
  data: Omit<Campaign, 'id' | 'createdAt' | 'status'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'campaigns'), {
    ...data,
    status: 'pending',
    spent: 0,
    submissionCount: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getCampaignsByBrand(brandId: string): Promise<Campaign[]> {
  const q = query(
    collection(db, 'campaigns'),
    where('brandId', '==', brandId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toCampaign(d.id, d.data()));
}

export async function getActiveCampaigns(): Promise<Campaign[]> {
  const q = query(
    collection(db, 'campaigns'),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toCampaign(d.id, d.data()));
}

export async function getAllCampaigns(): Promise<Campaign[]> {
  const q = query(collection(db, 'campaigns'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toCampaign(d.id, d.data()));
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  const snap = await getDoc(doc(db, 'campaigns', id));
  if (!snap.exists()) return null;
  return toCampaign(snap.id, snap.data());
}

export async function updateCampaignStatus(id: string, status: CampaignStatus): Promise<void> {
  await updateDoc(doc(db, 'campaigns', id), { status });
}
