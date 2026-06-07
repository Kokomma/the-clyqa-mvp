import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
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

export async function creditEarnings(userId: string, amount: number, description: string): Promise<void> {
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
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toTransaction(d.id, d.data()));
}

export async function getPendingWithdrawals(): Promise<WithdrawalRequest[]> {
  const q = query(
    collection(db, 'withdrawals'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toWithdrawal(d.id, d.data()));
}

export async function getAllWithdrawals(): Promise<WithdrawalRequest[]> {
  const q = query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toWithdrawal(d.id, d.data()));
}

export async function approveWithdrawal(withdrawalId: string, userId: string): Promise<void> {
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
  const withdrawalSnap = await getDoc(doc(db, 'withdrawals', withdrawalId));
  if (withdrawalSnap.exists()) {
    const amount = withdrawalSnap.data().amount as number;
    await updateDoc(doc(db, 'wallets', userId), {
      totalWithdrawn: increment(amount),
    });
  }
}

export async function rejectWithdrawal(withdrawalId: string, userId: string, amount: number): Promise<void> {
  await updateDoc(doc(db, 'withdrawals', withdrawalId), {
    status: 'failed',
    processedAt: serverTimestamp(),
  });
  // refund the amount back to available balance
  await updateDoc(doc(db, 'wallets', userId), {
    availableBalance: increment(amount),
  });
}
