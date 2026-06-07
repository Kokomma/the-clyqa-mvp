import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, UserRole } from '@/types';

export async function registerUser(
  email: string,
  password: string,
  displayName: string,
  role: UserRole
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });

  const userData: Omit<User, 'createdAt'> & { createdAt: ReturnType<typeof serverTimestamp> } = {
    uid: credential.user.uid,
    email,
    displayName,
    role,
    approved: role === 'brand' || role === 'admin',
  };

  await setDoc(doc(db, 'users', credential.user.uid), {
    ...userData,
    createdAt: serverTimestamp(),
  });

  // Create wallet for creator or brand
  if (role === 'creator' || role === 'brand') {
    await setDoc(doc(db, 'wallets', credential.user.uid), {
      userId: credential.user.uid,
      availableBalance: 0,
      pendingBalance: 0,
      totalEarned: 0,
      totalWithdrawn: 0,
    });
  }

  return { ...userData, createdAt: new Date().toISOString() };
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export async function getUserData(uid: string): Promise<User | null> {
  const docSnap = await getDoc(doc(db, 'users', uid));
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt,
  } as User;
}
