'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/shared/DashboardLayout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { statusBadge } from '@/components/shared/Badge';
import { getCampaignsByBrand } from '@/lib/campaigns';
import { Campaign } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatting';
import { Plus, Megaphone } from 'lucide-react';
import Link from 'next/link';

export default function BrandCampaignsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'brand')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.uid) {
      getCampaignsByBrand(user.uid).then(setCampaigns).finally(() => setDataLoading(false));
    }
  }, [user]);

  const filtered = filter === 'all' ? campaigns : campaigns.filter((c) => c.status === filter);

  if (loading || dataLoading) return <DashboardLayout><LoadingSpinner size="lg" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Campaigns</h1>
          <p className="text-zinc-500 mt-1">Manage and track your campaigns</p>
        </div>
        <Link
          href="/brand/campaigns/create"
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black text-sm"
        >
          <Plus size={18} />
          New Campaign
        </Link>
      </div>

      <div className="flex gap-2 mb-6 border-b border-zinc-800">
        {['all', 'pending', 'active', 'completed', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              filter === f
                ? 'border-green-500 text-green-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <Megaphone size={48} className="mx-auto mb-4 opacity-30" />
          <p>No campaigns found.</p>
          <Link href="/brand/campaigns/create" className="mt-4 inline-block bg-green-500 hover:bg-green-400 text-black">
            Create your first campaign
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <Link key={c.id} href={`/brand/campaigns/${c.id}`} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:shadow-md transition-shadow block">
              <div className="flex items-center justify-between mb-3">
                {statusBadge(c.status)}
                <span className="text-xs text-zinc-500 capitalize">{c.type}</span>
              </div>
              <h3 className="font-semibold text-white mb-1">{c.title}</h3>
              <p className="text-sm text-zinc-500 mb-4 line-clamp-2">{c.description}</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Budget</span>
                  <span className="font-medium text-white">{formatCurrency(c.budget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Submissions</span>
                  <span className="font-medium text-white">{c.submissionCount ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Created</span>
                  <span className="text-zinc-500">{formatDate(c.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
