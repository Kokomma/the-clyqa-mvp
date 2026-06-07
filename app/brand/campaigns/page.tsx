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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Campaigns</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track your campaigns</p>
        </div>
        <Link
          href="/brand/campaigns/create"
          className="flex items-center gap-2 bg-green-600 text-white font-semibold px-4 py-2 rounded-xl hover:bg-green-700 text-sm"
        >
          <Plus size={18} />
          New Campaign
        </Link>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {['all', 'pending', 'active', 'completed', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              filter === f
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <Megaphone size={48} className="mx-auto mb-4 opacity-30" />
          <p>No campaigns found.</p>
          <Link href="/brand/campaigns/create" className="mt-4 inline-block bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-green-700">
            Create your first campaign
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => (
            <Link key={c.id} href={`/brand/campaigns/${c.id}`} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow block">
              <div className="flex items-center justify-between mb-3">
                {statusBadge(c.status)}
                <span className="text-xs text-gray-400 capitalize">{c.type}</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{c.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{c.description}</p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Budget</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(c.budget)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Submissions</span>
                  <span className="font-medium text-gray-900 dark:text-white">{c.submissionCount ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-500">{formatDate(c.createdAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
