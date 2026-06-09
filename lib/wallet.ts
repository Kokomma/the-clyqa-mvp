import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  serverTimestamp,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Wallet, Transaction, WithdrawalRequest, MIN_WITHDRAWAL } from '@/types';

function toTransaction(id: string, data: Record<string, unknown>): Transaction {
  return {
    ...data,
    id,
    createdAt: data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : data.createdAt,
  } as Transaction;
}

function toWithdrawal(id: string, data: Record<string, unknown>): WithdrawalRequest {
  return {
    ...data,
    id,
    createdAt: data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : data.createdAt,
    processedAt: data.processedAt instanceof Timestamp
      ? data.processedAt.toDate().toISOString()
      : data.processedAt,
  } as WithdrawalRequest;
}

export async function getWallet(userId: string): Promise<Wallet | null> {
  const snap = await getDoc(doc(db, 'wallets', userId));
  if (!snap.exists()) return null;
  return snap.data() as Wallet;
}

export async function ensureWallet(userId: string): Promise<Wallet> {
  const existing = await getWallet(userId);
  if (existing) return existing;
  const wallet: Wallet = {
    userId,
    availableBalance: 0,
    pendingBalance: 0,
    totalEarned: 0,
    totalWithdrawn: 0,
  };
  await setDoc(doc(db, 'wallets', userId), wallet);
  return wallet;
}

export async function topUpWallet(userId: string, amount: number): Promise<void> {
  await ensureWallet(userId);
  await updateDoc(doc(db, 'wallets', userId), {
    availableBalance: increment(amount),
    totalEarned: increment(amount),
  });
  await addDoc(collection(db, 'transactions'), {
    userId,
    type: 'topup',
    amount,
    status: 'completed',
    description: `Wallet top-up of ₦${amount.toLocaleString()}`,
    createdAt: serverTimestamp(),
  });
}

export async function creditEarnings(userId: string, amount: number, description: string): Promise<void> {
  await ensureWallet(userId);
  await updateDoc(doc(db, 'wallets', userId), {
    pendingBalance: increment(amount),
    totalEarned: increment(amount),
  });
  await addDoc(collection(db, 'transactions'), {
    userId,
    type: 'earning',
    amount,
    status: 'completed',
    description,
    createdAt: serverTimestamp(),
  });
}

export async function releaseToAvailable(userId: string, amount: number): Promise<void> {
  await updateDoc(doc(db, 'wallets', userId), {
    pendingBalance: increment(-amount),
    availableBalance: increment(amount),
  });
}

export async function requestWithdrawal(
  userId: string,
  amount: number,
  bankDetails: { bankName: string; accountNumber: string; accountName: string }
): Promise<string> {
  const wallet = await getWallet(userId);
  if (!wallet) throw new Error('Wallet not found');
  if (wallet.availableBalance < amount) throw new Error('Insufficient balance');
  if (amount < MIN_WITHDRAWAL) throw new Error(`Minimum withdrawal is ₦${MIN_WITHDRAWAL.toLocaleString()}`);

  await updateDoc(doc(db, 'wallets', userId), {
    availableBalance: increment(-amount),
  });

  const ref = await addDoc(collection(db, 'withdrawals'), {
    userId,
    amount,
    status: 'pending',
    bankDetails,
    createdAt: serverTimestamp(),
  });

  await addDoc(collection(db, 'transactions'), {
    userId,
    type: 'withdrawal',
    amount,
    status: 'pending',
    description: `Withdrawal request to ${bankDetails.bankName}`,
    createdAt: serverTimestamp(),
  });

  return ref.id;
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  const q = query(collection(db, 'transactions'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => toTransaction(d.id, d.data()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getPendingWithdrawals(): Promise<WithdrawalRequest[]> {
  const q = query(collection(db, 'withdrawals'), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => toWithdrawal(d.id, d.data()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAllWithdrawals(): Promise<WithdrawalRequest[]> {
  const snap = await getDocs(collection(db, 'withdrawals'));
  return snap.docs
    .map((d) => toWithdrawal(d.id, d.data()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function approveWithdrawal(withdrawalId: string, userId: string): Promise<void> {
  const withdrawalSnap = await getDoc(doc(db, 'withdrawals', withdrawalId));
  if (!withdrawalSnap.exists()) return;
  const amount = withdrawalSnap.data().amount as number;

  await updateDoc(doc(db, 'withdrawals', withdrawalId), {
    status: 'completed',
    processedAt: serverTimestamp(),
  });

  const txQ = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    where('type', '==', 'withdrawal'),
    where('status', '==', 'pending')
  );
  const txSnap = await getDocs(txQ);
  for (const txDoc of txSnap.docs) {
    await updateDoc(doc(db, 'transactions', txDoc.id), { status: 'completed' });
  }

  await updateDoc(doc(db, 'wallets', userId), {
    totalWithdrawn: increment(amount),
  });
}

export async function rejectWithdrawal(withdrawalId: string, userId: string, amount: number): Promise<void> {
  await updateDoc(doc(db, 'withdrawals', withdrawalId), {
    status: 'failed',
    processedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'wallets', userId), {
    availableBalance: increment(amount),
  });
}
