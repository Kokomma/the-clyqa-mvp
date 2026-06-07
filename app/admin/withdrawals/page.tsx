'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/shared/DashboardLayout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { statusBadge } from '@/components/shared/Badge';
import { getAllWithdrawals, approveWithdrawal, rejectWithdrawal } from '@/lib/wallet';
import { WithdrawalRequest } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatting';
import { Check, X } from 'lucide-react';

export default function AdminWithdrawalsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
  }, [user, loading, router]);

  const load = () => {
    getAllWithdrawals().then(setWithdrawals).finally(() => setDataLoading(false));
  };

  useEffect(() => { if (user?.role === 'admin') load(); }, [user]);

  const handleApprove = async (w: WithdrawalRequest) => {
    setActionLoading(w.id);
    try { await approveWithdrawal(w.id, w.userId); load(); } finally { setActionLoading(null); }
  };

  const handleReject = async (w: WithdrawalRequest) => {
    setActionLoading(w.id);
    try { await rejectWithdrawal(w.id, w.userId, w.amount); load(); } finally { setActionLoading(null); }
  };

  const filtered = filter === 'all' ? withdrawals : withdrawals.filter((w) => w.status === filter);

  const totalPending = withdrawals.filter((w) => w.status === 'pending').reduce((s, w) => s + w.amount, 0);

  if (loading || dataLoading) return <DashboardLayout><LoadingSpinner size="lg" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Withdrawal Management</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Process creator withdrawal requests</p>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">Pending Amount</p>
          <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mt-1">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5">
          <p className="text-sm text-gray-500">Total Requests</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{withdrawals.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5">
          <p className="text-sm text-gray-500">Pending Requests</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{withdrawals.filter((w) => w.status === 'pending').length}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
        {['pending', 'completed', 'failed', 'all'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${
              filter === f ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No withdrawal requests found.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map((w) => (
              <div key={w.id} className="px-6 py-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(w.amount)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">User: {w.userId}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Requested: {formatDate(w.createdAt)}</p>
                    {w.processedAt && <p className="text-xs text-gray-400">Processed: {formatDate(w.processedAt)}</p>}
                  </div>
                  {statusBadge(w.status)}
                </div>

                {w.bankDetails && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-300 mb-3">
                    <p><span className="font-medium">Bank:</span> {w.bankDetails.bankName}</p>
                    <p><span className="font-medium">Account:</span> {w.bankDetails.accountNumber}</p>
                    <p><span className="font-medium">Name:</span> {w.bankDetails.accountName}</p>
                  </div>
                )}

                {w.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(w)}
                      disabled={actionLoading === w.id}
                      className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60"
                    >
                      <Check size={14} /> Approve & Pay
                    </button>
                    <button
                      onClick={() => handleReject(w)}
                      disabled={actionLoading === w.id}
                      className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-60"
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
