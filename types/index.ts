export type UserRole = 'creator' | 'brand' | 'admin';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  approved: boolean;
  createdAt: Date | string;
  suspended?: boolean;
}

export type CampaignType = 'performance' | 'deliverable' | 'hybrid';
export type CampaignStatus = 'draft' | 'pending' | 'active' | 'paused' | 'completed' | 'rejected';
export type CampaignObjective = 'awareness' | 'engagement' | 'traffic' | 'sales';

export interface CampaignRates {
  perView?: number;
  perLike?: number;
  perComment?: number;
  fixedRate?: number;
}

export interface Campaign {
  id: string;
  brandId: string;
  brandName?: string;
  title: string;
  description: string;
  type: CampaignType;
  objective: CampaignObjective;
  budget: number;
  spent?: number;
  status: CampaignStatus;
  rates: CampaignRates;
  requirements: string;
  platforms: string[];
  startDate?: string;
  endDate?: string;
  createdAt: Date | string;
  submissionCount?: number;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';
export type Platform = 'tiktok' | 'instagram' | 'youtube' | 'twitter';

export interface SubmissionMetrics {
  views: number;
  likes: number;
  comments: number;
  shares?: number;
}

export interface Submission {
  id: string;
  campaignId: string;
  campaignTitle?: string;
  creatorId: string;
  creatorName?: string;
  link: string;
  platform: Platform;
  metrics: SubmissionMetrics;
  status: SubmissionStatus;
  earnings: number;
  createdAt: Date | string;
  reviewedAt?: Date | string;
}

export interface Wallet {
  userId: string;
  availableBalance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
}

export type TransactionType = 'earning' | 'withdrawal' | 'refund' | 'topup';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  createdAt: Date | string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  amount: number;
  status: TransactionStatus;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  createdAt: Date | string;
  processedAt?: Date | string;
}

export const MIN_BUDGETS: Record<CampaignObjective, number> = {
  awareness: 50000,
  engagement: 75000,
  traffic: 100000,
  sales: 150000,
};

export const MIN_WITHDRAWAL = 30000;
