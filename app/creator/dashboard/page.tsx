'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/shared/DashboardLayout';
import StatCard from '@/components/shared/StatCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { statusBadge } from '@/components/shared/Badge';
import { getSubmissionsByCreator } from '@/lib/submissions';
import { getWallet } from '@/lib/wallet';
import { Submission, Wallet } from '@/types';
import { formatCurrency, formatDate, formatNumber } from '@/utils/formatting';
import { DollarSign, Clock, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CreatorDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user && user.role !== 'creator') router.push('/login');
    if (!loading && user && user.role === 'creator' && !user.approved) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.uid) {
      Promise.all([
        getSubmissionsByCreator(user.uid),
        getWallet(user.uid),
      ]).then(([subs, w]) => {
        setSubmissions(subs);
        setWallet(w);
      }).finally(() => setDataLoading(false));
    }
  }, [user]);

  if (loading || dataLoading) return <DashboardLayout><LoadingSpinner size="lg" /></DashboardLayout>;

  const approvedSubs = submissions.filter((s) => s.status === 'approved');

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Welcome back,{' '}
          <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            {user?.displayName?.split(' ')[0]}
          </span>
        </h1>
        <p className="text-zinc-400 mt-1">Here&apos;s your performance overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Earned"
          value={formatCurrency(wallet?.totalEarned ?? 0)}
          icon={DollarSign}
          iconColor="text-green-400"
        />
        <StatCard
          title="Available Balance"
          value={formatCurrency(wallet?.availableBalance ?? 0)}
          icon={DollarSign}
          iconColor="text-cyan-400"
        />
        <StatCard
          title="Pending Balance"
          value={formatCurrency(wallet?.pendingBalance ?? 0)}
          icon={Clock}
          iconColor="text-yellow-400"
        />
        <StatCard
          title="Total Submissions"
          value={submissions.length}
          icon={FileText}
          iconColor="text-blue-400"
          subtitle={`${approvedSubs.length} approved`}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { href: '/creator/campaigns', label: 'Browse Campaigns', desc: 'Find campaigns to join', primary: true },
          { href: '/creator/submissions', label: 'My Submissions', desc: 'Track your content', primary: false },
          { href: '/creator/wallet', label: 'Wallet & Earnings', desc: 'Withdraw your earnings', primary: false },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`rounded-2xl p-5 transition-colors flex items-center justify-between ${
              action.primary
                ? 'bg-green-500 hover:bg-green-400 text-black'
                : 'bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800'
            }`}
          >
            <div>
              <p className="font-semibold">{action.label}</p>
              <p className={`text-sm mt-0.5 ${action.primary ? 'text-green-900' : 'text-zinc-400'}`}>{action.desc}</p>
            </div>
            <ArrowRight size={20} />
          </Link>
        ))}
      </div>

      {/* Recent Submissions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="font-semibold text-white">Recent Submissions</h2>
          <Link href="/creator/submissions" className="text-sm text-green-400 hover:text-green-300 transition-colors">View all</Link>
        </div>
        {submissions.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p>No submissions yet. Browse campaigns to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {submissions.slice(0, 5).map((sub) => (
              <div key={sub.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white text-sm">{sub.campaignTitle ?? sub.campaignId}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                    <span>{sub.platform}</span>
                    <span>•</span>
                    <span>{formatDate(sub.createdAt)}</span>
                    {sub.metrics.views > 0 && (
                      <>
                        <span>•</span>
                        <span>{formatNumber(sub.metrics.views)} views</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-green-400 text-sm">{formatCurrency(sub.earnings)}</span>
                  {statusBadge(sub.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
