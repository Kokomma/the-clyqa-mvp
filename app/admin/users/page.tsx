'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/shared/DashboardLayout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import Badge, { statusBadge } from '@/components/shared/Badge';
import { getAllUsers, approveUser, suspendUser, unsuspendUser } from '@/lib/users';
import { User } from '@/types';
import { formatDate } from '@/utils/formatting';
import { Check, Ban, RotateCcw, Search } from 'lucide-react';

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
  }, [user, loading, router]);

  const load = () => {
    getAllUsers().then(setUsers).finally(() => setDataLoading(false));
  };

  useEffect(() => { if (user?.role === 'admin') load(); }, [user]);

  const handleApprove = async (uid: string) => {
    setActionLoading(uid);
    try { await approveUser(uid); load(); } finally { setActionLoading(null); }
  };

  const handleSuspend = async (uid: string) => {
    setActionLoading(uid);
    try { await suspendUser(uid); load(); } finally { setActionLoading(null); }
  };

  const handleUnsuspend = async (uid: string) => {
    setActionLoading(uid);
    try { await unsuspendUser(uid); load(); } finally { setActionLoading(null); }
  };

  const filtered = users
    .filter((u) => roleFilter === 'all' || u.role === roleFilter)
    .filter((u) => !search || u.displayName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  if (loading || dataLoading) return <DashboardLayout><LoadingSpinner size="lg" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-zinc-500 mt-1">Approve, suspend, and manage users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All roles</option>
          <option value="creator">Creators</option>
          <option value="brand">Brands</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No users found.</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {filtered.map((u) => (
              <div key={u.uid} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{u.displayName}</p>
                    <Badge label={u.role} variant={u.role === 'creator' ? 'green' : u.role === 'brand' ? 'blue' : 'cyan'} />
                    {u.suspended && <Badge label="suspended" variant="red" />}
                    {!u.approved && !u.suspended && u.role === 'creator' && <Badge label="pending" variant="yellow" />}
                  </div>
                  <p className="text-sm text-zinc-500 mt-0.5">{u.email}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Joined {formatDate(u.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {u.role === 'creator' && !u.approved && !u.suspended && (
                    <button
                      onClick={() => handleApprove(u.uid)}
                      disabled={actionLoading === u.uid}
                      className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-black disabled:opacity-60"
                    >
                      <Check size={12} /> Approve
                    </button>
                  )}
                  {u.suspended ? (
                    <button
                      onClick={() => handleUnsuspend(u.uid)}
                      disabled={actionLoading === u.uid}
                      className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-500/20 disabled:opacity-60"
                    >
                      <RotateCcw size={12} /> Reinstate
                    </button>
                  ) : u.role !== 'admin' && (
                    <button
                      onClick={() => handleSuspend(u.uid)}
                      disabled={actionLoading === u.uid}
                      className="flex items-center gap-1.5 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-500/20 disabled:opacity-60"
                    >
                      <Ban size={12} /> Suspend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
