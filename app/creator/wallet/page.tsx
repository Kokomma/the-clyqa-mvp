'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/shared/DashboardLayout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { statusBadge } from '@/components/shared/Badge';
import { getWallet, getTransactions, requestWithdrawal } from '@/lib/wallet';
import { Wallet, Transaction, MIN_WITHDRAWAL } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatting';
import { DollarSign, Clock, TrendingUp, ArrowDownToLine, X } from 'lucide-react';

export default function CreatorWalletPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'creator' || !user.approved)) router.push('/login');
  }, [user, loading, router]);

  const loadData = () => {
    if (user?.uid) {
      Promise.all([getWallet(user.uid), getTransactions(user.uid)])
        .then(([w, tx]) => { setWallet(w); setTransactions(tx); })
        .finally(() => setDataLoading(false));
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setWithdrawing(true);
    setWithdrawError('');
    try {
      await requestWithdrawal(user.uid, Number(amount), { bankName, accountNumber, accountName });
      setWithdrawSuccess(true);
      loadData();
    } catch (err: unknown) {
      setWithdrawError(err instanceof Error ? err.message : 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading || dataLoading) return <DashboardLayout><LoadingSpinner size="lg" /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Wallet & Earnings</h1>
        <p className="text-zinc-500 mt-1">Manage your balance and withdrawals</p>
      </div>

      {/* Balance Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-500 rounded-xl p-6 text-white col-span-full sm:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-green-100 text-sm">Available Balance</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(wallet?.availableBalance ?? 0)}</p>
            </div>
            <DollarSign size={32} className="text-green-200" />
          </div>
          <button
            onClick={() => { setShowWithdrawModal(true); setWithdrawSuccess(false); setWithdrawError(''); setAmount(''); }}
            disabled={(wallet?.availableBalance ?? 0) < MIN_WITHDRAWAL}
            className="bg-white text-green-700 font-bold px-5 py-2 rounded-lg text-sm hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowDownToLine size={16} className="inline mr-1.5 -mt-0.5" />
            Withdraw
          </button>
          {(wallet?.availableBalance ?? 0) < MIN_WITHDRAWAL && (
            <p className="text-green-200 text-xs mt-2">Minimum withdrawal: {formatCurrency(MIN_WITHDRAWAL)}</p>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <Clock size={18} />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(wallet?.pendingBalance ?? 0)}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <TrendingUp size={18} />
            <span className="text-sm font-medium">Total Earned</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(wallet?.totalEarned ?? 0)}</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="font-semibold text-white">Transaction History</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No transactions yet.</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {transactions.map((tx) => (
              <div key={tx.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{tx.description}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{formatDate(tx.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold ${tx.type === 'earning' ? 'text-green-400' : 'text-red-600'}`}>
                    {tx.type === 'earning' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  {statusBadge(tx.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-white">Request Withdrawal</h2>
              <button onClick={() => setShowWithdrawModal(false)} className="text-zinc-500 hover:text-zinc-300"><X size={20} /></button>
            </div>

            {withdrawSuccess ? (
              <div className="text-center py-4">
                <p className="text-green-400 font-semibold text-lg">Withdrawal requested!</p>
                <p className="text-sm text-zinc-500 mt-2">Your withdrawal is pending admin approval.</p>
                <button onClick={() => setShowWithdrawModal(false)} className="mt-4 bg-green-500 hover:bg-green-400 text-black text-sm">Close</button>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4">
                {withdrawError && <p className="text-red-600 text-sm">{withdrawError}</p>}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Amount (₦)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min={MIN_WITHDRAWAL}
                    max={wallet?.availableBalance}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={`Min. ₦${MIN_WITHDRAWAL.toLocaleString()}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Bank Name</label>
                  <input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Access Bank"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Account Number</label>
                  <input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="10-digit account number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Account Name</label>
                  <input
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Full name on account"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowWithdrawModal(false)} className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-sm font-medium text-zinc-300 hover:bg-zinc-800">
                    Cancel
                  </button>
                  <button type="submit" disabled={withdrawing} className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-black disabled:opacity-60">
                    {withdrawing ? 'Processing...' : 'Request Withdrawal'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
