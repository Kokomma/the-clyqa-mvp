import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { Submission, SubmissionStatus, SubmissionMetrics } from '@/types';
import { calculateEarnings } from '@/utils/earnings';
import { getCampaignById } from './campaigns';

function toSubmission(id: string, data: Record<string, unknown>): Submission {
  return {
    ...data,
    id,
    createdAt: data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : data.createdAt,
    reviewedAt: data.reviewedAt instanceof Timestamp
      ? data.reviewedAt.toDate().toISOString()
      : data.reviewedAt,
  } as Submission;
}

export async function createSubmission(
  data: Omit<Submission, 'id' | 'createdAt' | 'status' | 'earnings'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'submissions'), {
    ...data,
    status: 'pending',
    earnings: 0,
    createdAt: serverTimestamp(),
  });
  // increment campaign submission count
  await updateDoc(doc(db, 'campaigns', data.campaignId), {
    submissionCount: increment(1),
  });
  return ref.id;
}

export async function getSubmissionsByCreator(creatorId: string): Promise<Submission[]> {
  const q = query(
    collection(db, 'submissions'),
    where('creatorId', '==', creatorId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toSubmission(d.id, d.data()));
}

export async function getSubmissionsByCampaign(campaignId: string): Promise<Submission[]> {
  const q = query(
    collection(db, 'submissions'),
    where('campaignId', '==', campaignId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toSubmission(d.id, d.data()));
}

export async function getAllSubmissions(): Promise<Submission[]> {
  const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => toSubmission(d.id, d.data()));
}

export async function updateSubmissionMetrics(
  submissionId: string,
  metrics: SubmissionMetrics
): Promise<void> {
  await updateDoc(doc(db, 'submissions', submissionId), { metrics });
}

export async function approveSubmission(
  submissionId: string,
  campaignId: string,
  metrics: SubmissionMetrics
): Promise<number> {
  const campaign = await getCampaignById(campaignId);
  if (!campaign) throw new Error('Campaign not found');
  const earnings = calculateEarnings(metrics, campaign.rates);
  await updateDoc(doc(db, 'submissions', submissionId), {
    status: 'approved' as SubmissionStatus,
    metrics,
    earnings,
    reviewedAt: serverTimestamp(),
  });
  return earnings;
}

export async function rejectSubmission(submissionId: string): Promise<void> {
  await updateDoc(doc(db, 'submissions', submissionId), {
    status: 'rejected' as SubmissionStatus,
    reviewedAt: serverTimestamp(),
  });
}
