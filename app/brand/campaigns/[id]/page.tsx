'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/shared/DashboardLayout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { statusBadge } from '@/components/shared/Badge';
import { getCampaignById } from '@/lib/campaigns';
import { getSubmissionsByCampaign, approveSubmission, rejectSubmission } from '@/lib/submissions';
import { creditEarnings } from '@/lib/wallet';
import { Campaign, Submission, SubmissionMetrics } from '@/types';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatting';
import { ArrowLeft, Eye, Heart, MessageCircle, Check, X } from 'lucide-react';
import Link from 'next/link';

export default function BrandCampaignDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<SubmissionMetrics>({ views: 0, likes: 0, comments: 0 });
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'brand')) router.push('/login');
  }, [user, loading, router]);

  const loadData = () => {
    Promise.all([getCampaignById(id), getSubmissionsByCampaign(id)])
      .then(([c, subs]) => {
        setCampaign(c);
        setSubmissions(subs);
      })
      .finally(() => setDataLoading(false));
  };

  useEffect(() => { if (id) loadData(); }, [id]);

  const handleApprove = async (sub: Submission) => {
    setActionLoading(true);
    setActionError('');
    try {
      const earnings = await approveSubmission(sub.id, id, metrics);
      await creditEarnings(sub.creatorId, earnings, `Earnings from "${campaign?.title}"`);
      setReviewingId(null);
      loadData();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (subId: string) => {
    setActionLoading(true);
    try {
      await rejectSubmission(subId);
      loadData();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || dataLoading) return <DashboardLayout><LoadingSpinner size="lg" /></DashboardLayout>;
  if (!campaign) return <DashboardLayout><p className="text-gray-500">Campaign not found.</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/brand/campaigns" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} />
          Back to campaigns
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{campaign.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 capitalize">{campaign.type} • {campaign.objective} • Created {formatDate(campaign.createdAt)}</p>
          </div>
          {statusBadge(campaign.status)}
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500">Budget</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(campaign.budget)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500">Platforms</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 capitalize">{campaign.platforms.join(', ')}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500">Submissions</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{submissions.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500">Approved</p>
          <p className="text-xl font-bold text-green-600 mt-1">{submissions.filter((s) => s.status === 'approved').length}</p>
        </div>
      </div>

      {/* Campaign Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Campaign Details</h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{campaign.description}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requirements</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{campaign.requirements}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rates</p>
            <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
              {campaign.rates.perView && <p>₦{campaign.rates.perView} per 1K views</p>}
              {campaign.rates.perLike && <p>₦{campaign.rates.perLike} per like</p>}
              {campaign.rates.perComment && <p>₦{campaign.rates.perComment} per comment</p>}
              {campaign.rates.fixedRate && <p>{formatCurrency(campaign.rates.fixedRate)} fixed</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Submissions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Submissions</h2>
        </div>
        {submissions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No submissions yet.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {submissions.map((sub) => (
              <div key={sub.id} className="px-6 py-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{sub.creatorName ?? sub.creatorId}</p>
                    <a href={sub.link} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-600 hover:underline">
                      {sub.link.length > 50 ? sub.link.slice(0, 50) + '...' : sub.link}
                    </a>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{sub.platform} • {formatDate(sub.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-green-600">{formatCurrency(sub.earnings)}</span>
                    {statusBadge(sub.status)}
                  </div>
                </div>

                <div className="flex gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Eye size={14} /> {formatNumber(sub.metrics.views)}</span>
                  <span className="flex items-center gap-1"><Heart size={14} /> {formatNumber(sub.metrics.likes)}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={14} /> {formatNumber(sub.metrics.comments)}</span>
                </div>

                {sub.status === 'pending' && (
                  reviewingId === sub.id ? (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mt-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Enter actual metrics to calculate earnings:</p>
                      {actionError && <p className="text-red-600 text-sm mb-2">{actionError}</p>}
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Views</label>
                          <input
                            type="number"
                            value={metrics.views}
                            onChange={(e) => setMetrics((m) => ({ ...m, views: Number(e.target.value) }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Likes</label>
                          <input
                            type="number"
                            value={metrics.likes}
                            onChange={(e) => setMetrics((m) => ({ ...m, likes: Number(e.target.value) }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Comments</label>
                          <input
                            type="number"
                            value={metrics.comments}
                            onChange={(e) => setMetrics((m) => ({ ...m, comments: Number(e.target.value) }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(sub)}
                          disabled={actionLoading}
                          className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60"
                        >
                          <Check size={14} /> Approve & Pay
                        </button>
                        <button
                          onClick={() => setReviewingId(null)}
                          className="px-4 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setReviewingId(sub.id); setMetrics({ views: 0, likes: 0, comments: 0 }); setActionError(''); }}
                        className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-100"
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(sub.id)}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-100"
                      >
                        <X size={12} /> Reject
                      </button>
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
