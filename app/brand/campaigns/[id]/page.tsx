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
  if (!campaign) return <DashboardLayout><p className="text-zinc-500">Campaign not found.</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/brand/campaigns" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mb-4">
          <ArrowLeft size={16} />
          Back to campaigns
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{campaign.title}</h1>
            <p className="text-zinc-500 mt-1 capitalize">{campaign.type} • {campaign.objective} • Created {formatDate(campaign.createdAt)}</p>
          </div>
          {statusBadge(campaign.status)}
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-sm text-zinc-500">Budget</p>
          <p className="text-xl font-bold text-white mt-1">{formatCurrency(campaign.budget)}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-sm text-zinc-500">Platforms</p>
          <p className="text-xl font-bold text-white mt-1 capitalize">{campaign.platforms.join(', ')}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-sm text-zinc-500">Submissions</p>
          <p className="text-xl font-bold text-white mt-1">{submissions.length}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p className="text-sm text-zinc-500">Approved</p>
          <p className="text-xl font-bold text-green-400 mt-1">{submissions.filter((s) => s.status === 'approved').length}</p>
        </div>
      </div>

      {/* Campaign Info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
        <h2 className="font-semibold text-white mb-3">Campaign Details</h2>
        <p className="text-zinc-300 text-sm mb-4">{campaign.description}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-zinc-300 mb-1">Requirements</p>
            <p className="text-sm text-zinc-500">{campaign.requirements}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-300 mb-1">Rates</p>
            <div className="space-y-1 text-sm text-zinc-500">
              {campaign.rates.perView && <p>₦{campaign.rates.perView} per 1K views</p>}
              {campaign.rates.perLike && <p>₦{campaign.rates.perLike} per like</p>}
              {campaign.rates.perComment && <p>₦{campaign.rates.perComment} per comment</p>}
              {campaign.rates.fixedRate && <p>{formatCurrency(campaign.rates.fixedRate)} fixed</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Submissions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="font-semibold text-white">Submissions</h2>
        </div>
        {submissions.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No submissions yet.</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {submissions.map((sub) => (
              <div key={sub.id} className="px-6 py-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-white">{sub.creatorName ?? sub.creatorId}</p>
                    <a href={sub.link} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-600 hover:underline">
                      {sub.link.length > 50 ? sub.link.slice(0, 50) + '...' : sub.link}
                    </a>
                    <p className="text-xs text-zinc-500 mt-0.5 capitalize">{sub.platform} • {formatDate(sub.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-green-400">{formatCurrency(sub.earnings)}</span>
                    {statusBadge(sub.status)}
                  </div>
                </div>

                <div className="flex gap-4 text-sm text-zinc-500 mb-3">
                  <span className="flex items-center gap-1"><Eye size={14} /> {formatNumber(sub.metrics.views)}</span>
                  <span className="flex items-center gap-1"><Heart size={14} /> {formatNumber(sub.metrics.likes)}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={14} /> {formatNumber(sub.metrics.comments)}</span>
                </div>

                {sub.status === 'pending' && (
                  reviewingId === sub.id ? (
                    <div className="bg-zinc-800 rounded-xl p-4 mt-3">
                      <p className="text-sm font-medium text-zinc-300 mb-3">Enter actual metrics to calculate earnings:</p>
                      {actionError && <p className="text-red-600 text-sm mb-2">{actionError}</p>}
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Views</label>
                          <input
                            type="number"
                            value={metrics.views}
                            onChange={(e) => setMetrics((m) => ({ ...m, views: Number(e.target.value) }))}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Likes</label>
                          <input
                            type="number"
                            value={metrics.likes}
                            onChange={(e) => setMetrics((m) => ({ ...m, likes: Number(e.target.value) }))}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Comments</label>
                          <input
                            type="number"
                            value={metrics.comments}
                            onChange={(e) => setMetrics((m) => ({ ...m, comments: Number(e.target.value) }))}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(sub)}
                          disabled={actionLoading}
                          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-black disabled:opacity-60"
                        >
                          <Check size={14} /> Approve & Pay
                        </button>
                        <button
                          onClick={() => setReviewingId(null)}
                          className="px-4 py-2 rounded-lg text-sm border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setReviewingId(sub.id); setMetrics({ views: 0, likes: 0, comments: 0 }); setActionError(''); }}
                        className="flex items-center gap-1.5 bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-500/20"
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button
                        onClick={() => handleReject(sub.id)}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/20"
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
