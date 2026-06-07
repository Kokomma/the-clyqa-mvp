import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { User } from '@/types';

function toUser(id: string, data: Record<string, unknown>): User {
  return {
    ...data,
    uid: id,
    createdAt: data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : data.createdAt,
  } as User;
}

export async function getAllUsers(): Promise<User[]> {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toUser(d.id, d.data()));
}

export async function approveUser(uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { approved: true });
}

export async function suspendUser(uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { suspended: true, approved: false });
}

export async function unsuspendUser(uid: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { suspended: false, approved: true });
}
