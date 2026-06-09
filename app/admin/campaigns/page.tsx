'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/shared/DashboardLayout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { statusBadge } from '@/components/shared/Badge';
import { getAllCampaigns, updateCampaignStatus } from '@/lib/campaigns';
import { Campaign } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatting';
import { Check, X, Search } from 'lucide-react';

export default function AdminCampaignsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
  }, [user, loading, router]);

  const load = () => {
    getAllCampaigns().then(setCampaigns).finally(() => setDataLoading(false));
  };
  useEffect(() => { if (user?.role === 'admin') load(); }, [user]);

  const handleAction = async (id: string, status: 'active' | 'rejected') => {
    setActionLoading(id);
    try {
      await updateCampaignStatus(id, status);
      load();
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = campaigns
    .filter((c) => filter === 'all' || c.status === filter)
    .filter((c) => !search || c.title.toLowerCase().includes(search.toLowerCase()));

  if (loading || dataLoading) return <DashboardLayout><LoadingSpinner size="lg" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Campaign Management</h1>
        <p className="text-zinc-500 mt-1">Review and approve campaigns</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {['all', 'pending', 'active', 'rejected', 'completed'].map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No campaigns found.</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {filtered.map((c) => (
              <div key={c.id} className="px-6 py-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-white">{c.title}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5 capitalize">
                      {c.type} • {c.objective} • {formatCurrency(c.budget)} • {formatDate(c.createdAt)}
                    </p>
                    <p className="text-sm text-zinc-500 mt-1 line-clamp-1">{c.description}</p>
                  </div>
                  {statusBadge(c.status)}
                </div>

                {c.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleAction(c.id, 'active')}
                      disabled={actionLoading === c.id}
                      className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-black disabled:opacity-60"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handleAction(c.id, 'rejected')}
                      disabled={actionLoading === c.id}
                      className="flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-500/20 disabled:opacity-60"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
