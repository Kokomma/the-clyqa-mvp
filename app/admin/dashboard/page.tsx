'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/shared/DashboardLayout';
import StatCard from '@/components/shared/StatCard';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { getAllUsers } from '@/lib/users';
import { getAllCampaigns } from '@/lib/campaigns';
import { getAllWithdrawals } from '@/lib/wallet';
import { Users, Megaphone, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/utils/formatting';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingCreators: 0,
    totalCampaigns: 0,
    pendingCampaigns: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
  });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      Promise.all([getAllUsers(), getAllCampaigns(), getAllWithdrawals()])
        .then(([users, campaigns, withdrawals]) => {
          setStats({
            totalUsers: users.length,
            pendingCreators: users.filter((u) => u.role === 'creator' && !u.approved).length,
            totalCampaigns: campaigns.length,
            pendingCampaigns: campaigns.filter((c) => c.status === 'pending').length,
            totalWithdrawals: withdrawals.reduce((s, w) => s + w.amount, 0),
            pendingWithdrawals: withdrawals.filter((w) => w.status === 'pending').length,
          });
        })
        .finally(() => setDataLoading(false));
    }
  }, [user]);

  if (loading || dataLoading) return <DashboardLayout><LoadingSpinner size="lg" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Platform overview and management</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          iconColor="text-blue-600"
          subtitle={`${stats.pendingCreators} pending approval`}
        />
        <StatCard
          title="Total Campaigns"
          value={stats.totalCampaigns}
          icon={Megaphone}
          iconColor="text-green-600"
          subtitle={`${stats.pendingCampaigns} pending review`}
        />
        <StatCard
          title="Total Withdrawals"
          value={formatCurrency(stats.totalWithdrawals)}
          icon={DollarSign}
          iconColor="text-yellow-600"
          subtitle={`${stats.pendingWithdrawals} pending`}
        />
      </div>

      {/* Pending Alerts */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending Creator Approvals', count: stats.pendingCreators, href: '/admin/users', color: 'border-blue-300 bg-blue-50 dark:bg-blue-900/10' },
          { label: 'Campaigns Awaiting Review', count: stats.pendingCampaigns, href: '/admin/campaigns', color: 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10' },
          { label: 'Pending Withdrawals', count: stats.pendingWithdrawals, href: '/admin/withdrawals', color: 'border-green-300 bg-green-50 dark:bg-green-900/10' },
        ].map((alert) => (
          <Link
            key={alert.href}
            href={alert.href}
            className={`border-2 rounded-xl p-5 flex items-center justify-between transition-opacity hover:opacity-80 ${alert.color}`}
          >
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{alert.label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{alert.count}</p>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} className="text-gray-400" />
              <ArrowRight size={16} className="text-gray-400" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: '/admin/users', label: 'Manage Users', icon: Users },
          { href: '/admin/campaigns', label: 'Manage Campaigns', icon: Megaphone },
          { href: '/admin/withdrawals', label: 'Process Withdrawals', icon: DollarSign },
        ].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition-shadow flex items-center gap-3"
          >
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-green-600">
              <Icon size={20} />
            </div>
            <span className="font-medium text-gray-900 dark:text-white text-sm">{label}</span>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
