'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/shared/DashboardLayout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { getWallet, topUpWallet, getTransactions, ensureWallet } from '@/lib/wallet';
import { Wallet, Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatting';
import { Wallet as WalletIcon, Plus, ArrowDownLeft, TrendingUp, RefreshCw } from 'lucide-react';

const TOP_UP_AMOUNTS = [10000, 25000, 50000, 100000, 250000, 500000];

export default function BrandWalletPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'brand')) router.push('/login');
  }, [user, loading, router]);

  const loadData = async () => {
    if (!user?.uid) return;
    setDataLoading(true);
    const [w, tx] = await Promise.all([
      ensureWallet(user.uid),
      getTransactions(user.uid),
    ]);
    setWallet(w);
    setTransactions(tx);
    setDataLoading(false);
  };

  useEffect(() => {
    if (user?.uid) loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleTopUp = async () => {
    const amount = customAmount ? Number(customAmount) : selectedAmount;
    if (!amount || amount < 1000) {
      setError('Minimum top-up amount is ₦1,000');
      return;
    }
    if (!user) return;
    setProcessing(true);
    setError('');
    try {
      await topUpWallet(user.uid, amount);
      setSuccess(`₦${amount.toLocaleString()} added to your wallet successfully!`);
      setShowTopUp(false);
      setCustomAmount('');
      setSelectedAmount(null);
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Top-up failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || dataLoading) return <DashboardLayout><LoadingSpinner size="lg" /></DashboardLayout>;

  const txIcon = (type: string) => {
    if (type === 'topup') return <ArrowDownLeft size={16} className="text-green-400" />;
    if (type === 'withdrawal') return <TrendingUp size={16} className="text-red-400" />;
    return <RefreshCw size={16} className="text-blue-400" />;
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Brand Wallet</h1>
          <p className="text-zinc-400 mt-1">Fund your account to pay creators</p>
        </div>
        <button
          onClick={() => { setShowTopUp(true); setSuccess(''); setError(''); }}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-4 py-2 rounded-xl transition-colors text-sm"
        >
          <Plus size={18} />
          Add Funds
        </button>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
          {success}
        </div>
      )}

      {/* Balance Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/10 rounded-xl">
              <WalletIcon size={20} className="text-green-400" />
            </div>
            <span className="text-sm text-zinc-400">Available Balance</span>
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(wallet?.availableBalance ?? 0)}</p>
          <p className="text-xs text-zinc-500 mt-2">Ready to fund campaigns</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500/10 rounded-xl">
              <RefreshCw size={20} className="text-yellow-400" />
            </div>
            <span className="text-sm text-zinc-400">Locked in Campaigns</span>
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(wallet?.pendingBalance ?? 0)}</p>
          <p className="text-xs text-zinc-500 mt-2">Allocated to active campaigns</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyan-500/10 rounded-xl">
              <TrendingUp size={20} className="text-cyan-400" />
            </div>
            <span className="text-sm text-zinc-400">Total Spent</span>
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(wallet?.totalWithdrawn ?? 0)}</p>
          <p className="text-xs text-zinc-500 mt-2">Paid out to creators</p>
        </div>
      </div>

      {/* Top-Up Modal */}
      {showTopUp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-2">Add Funds</h2>
            <p className="text-zinc-400 text-sm mb-6">Select an amount or enter a custom value to top up your wallet.</p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
            )}

            <div className="grid grid-cols-3 gap-3 mb-4">
              {TOP_UP_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                  className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                    selectedAmount === amt
                      ? 'border-green-500 bg-green-500/10 text-green-400'
                      : 'border-zinc-700 text-zinc-300 hover:border-zinc-500'
                  }`}
                >
                  ₦{(amt / 1000).toFixed(0)}K
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm text-zinc-400 mb-1">Or enter custom amount (₦)</label>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. 75000"
                min={1000}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowTopUp(false); setError(''); setCustomAmount(''); setSelectedAmount(null); }}
                className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleTopUp}
                disabled={processing || (!selectedAmount && !customAmount)}
                className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold text-sm disabled:opacity-50 transition-colors"
              >
                {processing ? 'Processing...' : `Add ${selectedAmount ? formatCurrency(selectedAmount) : customAmount ? formatCurrency(Number(customAmount)) : 'Funds'}`}
              </button>
            </div>

            <p className="text-xs text-zinc-500 mt-4 text-center">
              In production this connects to Paystack/Flutterwave for real payments.
            </p>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="font-semibold text-white">Transaction History</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="p-10 text-center text-zinc-500">
            <WalletIcon size={40} className="mx-auto mb-3 opacity-30" />
            <p>No transactions yet. Add funds to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {transactions.map((tx) => (
              <div key={tx.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-800 rounded-lg">
                    {txIcon(tx.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white capitalize">{tx.type === 'topup' ? 'Wallet Top-up' : tx.type}</p>
                    <p className="text-xs text-zinc-500">{tx.description} • {formatDate(tx.createdAt)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${tx.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'}`}>
                    {tx.type === 'withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
                  </p>
                  <p className={`text-xs capitalize ${tx.status === 'completed' ? 'text-zinc-500' : 'text-yellow-400'}`}>
                    {tx.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
