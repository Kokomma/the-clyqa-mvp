'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/shared/DashboardLayout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import Badge from '@/components/shared/Badge';
import { getActiveCampaigns } from '@/lib/campaigns';
import { createSubmission } from '@/lib/submissions';
import { Campaign, Platform } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatting';
import { Search, X, ExternalLink } from 'lucide-react';

export default function CreatorCampaignsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filtered, setFiltered] = useState<Campaign[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [link, setLink] = useState('');
  const [platform, setPlatform] = useState<Platform>('tiktok');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'creator' || !user.approved)) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    getActiveCampaigns().then((c) => {
      setCampaigns(c);
      setFiltered(c);
    }).finally(() => setDataLoading(false));
  }, []);

  useEffect(() => {
    let result = campaigns;
    if (search) result = result.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()));
    if (typeFilter !== 'all') result = result.filter((c) => c.type === typeFilter);
    setFiltered(result);
  }, [search, typeFilter, campaigns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign || !user) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await createSubmission({
        campaignId: selectedCampaign.id,
        campaignTitle: selectedCampaign.title,
        creatorId: user.uid,
        creatorName: user.displayName,
        link,
        platform,
        metrics: { views: 0, likes: 0, comments: 0 },
      });
      setSubmitSuccess(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || dataLoading) return <DashboardLayout><LoadingSpinner size="lg" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Active Campaigns</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Browse and join campaigns to start earning</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All types</option>
          <option value="performance">Performance</option>
          <option value="deliverable">Deliverable</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <p>No active campaigns found.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((campaign) => (
            <div key={campaign.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <Badge label={campaign.type} variant={campaign.type === 'performance' ? 'green' : campaign.type === 'deliverable' ? 'blue' : 'cyan'} />
                <Badge label={campaign.objective} variant="gray" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{campaign.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1 line-clamp-2">{campaign.description}</p>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Budget</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(campaign.budget)}</span>
                </div>
                {campaign.rates.perView && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Per 1K views</span>
                    <span className="font-medium text-green-600">₦{campaign.rates.perView}</span>
                  </div>
                )}
                {campaign.rates.perLike && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Per like</span>
                    <span className="font-medium text-green-600">₦{campaign.rates.perLike}</span>
                  </div>
                )}
                {campaign.rates.perComment && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Per comment</span>
                    <span className="font-medium text-green-600">₦{campaign.rates.perComment}</span>
                  </div>
                )}
                {campaign.rates.fixedRate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fixed rate</span>
                    <span className="font-medium text-green-600">{formatCurrency(campaign.rates.fixedRate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Platforms</span>
                  <span className="font-medium text-gray-900 dark:text-white">{campaign.platforms.join(', ')}</span>
                </div>
                {campaign.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ends</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatDate(campaign.endDate)}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => { setSelectedCampaign(campaign); setSubmitSuccess(false); setLink(''); setSubmitError(''); }}
                className="w-full bg-green-600 text-white font-medium py-2.5 rounded-xl hover:bg-green-700 transition-colors text-sm"
              >
                Submit Content
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Submit Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white">Submit Content</h2>
              <button onClick={() => setSelectedCampaign(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Campaign: <strong className="text-gray-900 dark:text-white">{selectedCampaign.title}</strong></p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 font-medium">Requirements:</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{selectedCampaign.requirements}</p>

            {submitSuccess ? (
              <div className="text-center py-4">
                <p className="text-green-600 font-semibold">Submission successful!</p>
                <p className="text-sm text-gray-500 mt-1">Your submission is pending review.</p>
                <button onClick={() => setSelectedCampaign(null)} className="mt-4 bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 text-sm">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && <p className="text-red-600 text-sm">{submitError}</p>}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as Platform)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {selectedCampaign.platforms.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content Link</label>
                  <div className="relative">
                    <ExternalLink size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      required
                      placeholder="https://tiktok.com/@you/video/..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setSelectedCampaign(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60">
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
