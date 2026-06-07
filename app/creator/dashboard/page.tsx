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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.displayName?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here&apos;s your performance overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Earned"
          value={formatCurrency(wallet?.totalEarned ?? 0)}
          icon={DollarSign}
          iconColor="text-green-600"
        />
        <StatCard
          title="Available Balance"
          value={formatCurrency(wallet?.availableBalance ?? 0)}
          icon={DollarSign}
          iconColor="text-cyan-600"
        />
        <StatCard
          title="Pending Balance"
          value={formatCurrency(wallet?.pendingBalance ?? 0)}
          icon={Clock}
          iconColor="text-yellow-600"
        />
        <StatCard
          title="Total Submissions"
          value={submissions.length}
          icon={FileText}
          iconColor="text-blue-600"
          subtitle={`${approvedSubs.length} approved`}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { href: '/creator/campaigns', label: 'Browse Campaigns', desc: 'Find campaigns to join', color: 'bg-green-600 text-white hover:bg-green-700' },
          { href: '/creator/submissions', label: 'My Submissions', desc: 'Track your content', color: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700' },
          { href: '/creator/wallet', label: 'Wallet & Earnings', desc: 'Withdraw your earnings', color: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700' },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`rounded-xl p-5 transition-colors flex items-center justify-between ${action.color}`}
          >
            <div>
              <p className="font-semibold">{action.label}</p>
              <p className={`text-sm mt-0.5 ${action.color.includes('bg-green') ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'}`}>{action.desc}</p>
            </div>
            <ArrowRight size={20} />
          </Link>
        ))}
      </div>

      {/* Recent Submissions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Submissions</h2>
          <Link href="/creator/submissions" className="text-sm text-green-600 hover:underline">View all</Link>
        </div>
        {submissions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p>No submissions yet. Browse campaigns to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {submissions.slice(0, 5).map((sub) => (
              <div key={sub.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{sub.campaignTitle ?? sub.campaignId}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
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
                  <span className="font-semibold text-green-600 text-sm">{formatCurrency(sub.earnings)}</span>
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
