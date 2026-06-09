'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/shared/DashboardLayout';
import StatCard from '@/components/shared/StatCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { statusBadge } from '@/components/shared/Badge';
import { getCampaignsByBrand } from '@/lib/campaigns';
import { getAllSubmissions } from '@/lib/submissions';
import { Campaign, Submission } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatting';
import { Megaphone, DollarSign, FileText, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BrandDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'brand')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.uid) {
      getCampaignsByBrand(user.uid).then((c) => {
        setCampaigns(c);
        // Get submissions for all brand campaigns
        return getAllSubmissions().then((subs) => {
          const campaignIds = new Set(c.map((camp) => camp.id));
          setSubmissions(subs.filter((s) => campaignIds.has(s.campaignId)));
        });
      }).finally(() => setDataLoading(false));
    }
  }, [user]);

  if (loading || dataLoading) return <DashboardLayout><LoadingSpinner size="lg" /></DashboardLayout>;

  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;
  const totalSpent = campaigns.reduce((sum, c) => sum + (c.spent ?? 0), 0);
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Brand Dashboard</h1>
          <p className="text-zinc-400 mt-1">Track your campaigns and performance</p>
        </div>
        <Link
          href="/brand/campaigns/create"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-xl transition-colors text-sm"
        >
          <Plus size={18} />
          New Campaign
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Active Campaigns" value={activeCampaigns} icon={Megaphone} iconColor="text-green-400" />
        <StatCard title="Total Budget" value={formatCurrency(totalBudget)} icon={DollarSign} iconColor="text-cyan-400" />
        <StatCard title="Total Spent" value={formatCurrency(totalSpent)} icon={DollarSign} iconColor="text-yellow-400" />
        <StatCard title="Total Submissions" value={submissions.length} icon={FileText} iconColor="text-blue-400" />
      </div>

      {/* Campaigns List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="font-semibold text-white">Your Campaigns</h2>
          <Link href="/brand/campaigns" className="text-sm text-green-400 hover:text-green-300 transition-colors flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {campaigns.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            <Megaphone size={40} className="mx-auto mb-3 opacity-30" />
            <p>No campaigns yet. Create your first campaign!</p>
            <Link href="/brand/campaigns/create" className="mt-4 inline-block bg-green-500 hover:bg-green-400 text-black px-5 py-2 rounded-xl text-sm font-bold">
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {campaigns.slice(0, 5).map((c) => (
              <Link key={c.id} href={`/brand/campaigns/${c.id}`} className="px-6 py-4 flex items-center justify-between hover:bg-zinc-800/50 transition-colors">
                <div>
                  <p className="font-medium text-white">{c.title}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 capitalize">{c.type} • {formatDate(c.createdAt)} • {c.submissionCount ?? 0} submissions</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-zinc-300 text-sm">{formatCurrency(c.budget)}</span>
                  {statusBadge(c.status)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Submissions */}
      {submissions.length > 0 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="font-semibold text-white">Recent Submissions</h2>
          </div>
          <div className="divide-y divide-zinc-800">
            {submissions.slice(0, 5).map((sub) => (
              <div key={sub.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{sub.creatorName ?? sub.creatorId}</p>
                  <p className="text-xs text-zinc-500">{sub.campaignTitle ?? sub.campaignId} • {sub.platform}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-green-400 text-sm">{formatCurrency(sub.earnings)}</span>
                  {statusBadge(sub.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
