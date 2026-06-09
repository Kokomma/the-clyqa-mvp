'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/shared/DashboardLayout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { statusBadge } from '@/components/shared/Badge';
import { getSubmissionsByCreator } from '@/lib/submissions';
import { Submission } from '@/types';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatting';
import { FileText, Eye, Heart, MessageCircle } from 'lucide-react';

export default function CreatorSubmissionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'creator' || !user.approved)) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.uid) {
      getSubmissionsByCreator(user.uid)
        .then(setSubmissions)
        .finally(() => setDataLoading(false));
    }
  }, [user]);

  const filtered = filter === 'all' ? submissions : submissions.filter((s) => s.status === filter);

  if (loading || dataLoading) return <DashboardLayout><LoadingSpinner size="lg" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Submissions</h1>
        <p className="text-zinc-500 mt-1">Track your content performance and earnings</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 border-b border-zinc-800">
        {['all', 'pending', 'approved', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              filter === f
                ? 'border-green-500 text-green-400'
                : 'border-transparent text-zinc-500 hover:text-white'
            }`}
          >
            {f} {f === 'all' ? `(${submissions.length})` : `(${submissions.filter((s) => s.status === f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <FileText size={48} className="mx-auto mb-4 opacity-30" />
          <p>No submissions found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((sub) => (
            <div key={sub.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{sub.campaignTitle ?? sub.campaignId}</h3>
                  <p className="text-sm text-zinc-500 mt-0.5 capitalize">{sub.platform} • Submitted {formatDate(sub.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-green-400">{formatCurrency(sub.earnings)}</span>
                  {statusBadge(sub.status)}
                </div>
              </div>

              <a
                href={sub.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-cyan-600 hover:underline break-all"
              >
                {sub.link}
              </a>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="bg-zinc-800 rounded-lg p-3 text-center">
                  <Eye size={16} className="mx-auto mb-1 text-zinc-500" />
                  <p className="text-lg font-bold text-white">{formatNumber(sub.metrics.views)}</p>
                  <p className="text-xs text-zinc-500">Views</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-3 text-center">
                  <Heart size={16} className="mx-auto mb-1 text-red-400" />
                  <p className="text-lg font-bold text-white">{formatNumber(sub.metrics.likes)}</p>
                  <p className="text-xs text-zinc-500">Likes</p>
                </div>
                <div className="bg-zinc-800 rounded-lg p-3 text-center">
                  <MessageCircle size={16} className="mx-auto mb-1 text-blue-400" />
                  <p className="text-lg font-bold text-white">{formatNumber(sub.metrics.comments)}</p>
                  <p className="text-xs text-zinc-500">Comments</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
