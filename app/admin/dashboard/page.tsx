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
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-zinc-400 mt-1">Platform overview and management</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          iconColor="text-blue-400"
          subtitle={`${stats.pendingCreators} pending approval`}
        />
        <StatCard
          title="Total Campaigns"
          value={stats.totalCampaigns}
          icon={Megaphone}
          iconColor="text-green-400"
          subtitle={`${stats.pendingCampaigns} pending review`}
        />
        <StatCard
          title="Total Withdrawals"
          value={formatCurrency(stats.totalWithdrawals)}
          icon={DollarSign}
          iconColor="text-yellow-400"
          subtitle={`${stats.pendingWithdrawals} pending`}
        />
      </div>

      {/* Pending Alerts */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending Creator Approvals', count: stats.pendingCreators, href: '/admin/users', color: 'border-blue-500/30 bg-blue-500/5 text-blue-400' },
          { label: 'Campaigns Awaiting Review', count: stats.pendingCampaigns, href: '/admin/campaigns', color: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400' },
          { label: 'Pending Withdrawals', count: stats.pendingWithdrawals, href: '/admin/withdrawals', color: 'border-green-500/30 bg-green-500/5 text-green-400' },
        ].map((alert) => (
          <Link
            key={alert.href}
            href={alert.href}
            className={`border rounded-2xl p-5 flex items-center justify-between transition-opacity hover:opacity-80 ${alert.color}`}
          >
            <div>
              <p className="text-sm font-medium text-zinc-300">{alert.label}</p>
              <p className="text-3xl font-bold text-white mt-1">{alert.count}</p>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} className="text-zinc-500" />
              <ArrowRight size={16} className="text-zinc-500" />
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
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-800 transition-colors flex items-center gap-3"
          >
            <div className="p-2 bg-zinc-800 rounded-xl text-green-400">
              <Icon size={20} />
            </div>
            <span className="font-medium text-white text-sm">{label}</span>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
