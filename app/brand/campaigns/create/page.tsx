'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/shared/DashboardLayout';
import { createCampaign } from '@/lib/campaigns';
import { CampaignType, CampaignObjective, MIN_BUDGETS } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const PLATFORMS = ['tiktok', 'instagram', 'youtube', 'twitter'];

export default function CreateCampaignPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CampaignType>('performance');
  const [objective, setObjective] = useState<CampaignObjective>('awareness');
  const [budget, setBudget] = useState('');
  const [perView, setPerView] = useState('');
  const [perLike, setPerLike] = useState('');
  const [perComment, setPerComment] = useState('');
  const [fixedRate, setFixedRate] = useState('');
  const [requirements, setRequirements] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['tiktok']);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'brand')) router.push('/login');
  }, [user, loading, router]);

  const togglePlatform = (p: string) => {
    setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const minBudget = MIN_BUDGETS[objective];
    if (Number(budget) < minBudget) {
      setError(`Minimum budget for ${objective} campaigns is ₦${minBudget.toLocaleString()}`);
      return;
    }
    if (platforms.length === 0) {
      setError('Select at least one platform');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createCampaign({
        brandId: user.uid,
        brandName: user.displayName,
        title,
        description,
        type,
        objective,
        budget: Number(budget),
        rates: {
          perView: perView ? Number(perView) : undefined,
          perLike: perLike ? Number(perLike) : undefined,
          perComment: perComment ? Number(perComment) : undefined,
          fixedRate: fixedRate ? Number(fixedRate) : undefined,
        },
        requirements,
        platforms,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      router.push('/brand/campaigns');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link href="/brand/campaigns" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} />
          Back to campaigns
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Campaign</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Fill in the details to launch a new campaign</p>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8">
          {error && (
            <div className="mb-5 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Title *</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Summer Product Launch"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                placeholder="Describe your campaign goals and brand..."
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CampaignType)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="performance">Performance (pay per engagement)</option>
                  <option value="deliverable">Deliverable (fixed per piece)</option>
                  <option value="hybrid">Hybrid (performance + fixed)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Objective *</label>
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value as CampaignObjective)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="awareness">Awareness (min ₦50K)</option>
                  <option value="engagement">Engagement (min ₦75K)</option>
                  <option value="traffic">Traffic (min ₦100K)</option>
                  <option value="sales">Sales (min ₦150K)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Budget (₦) *</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
                min={MIN_BUDGETS[objective]}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={`Min ₦${MIN_BUDGETS[objective].toLocaleString()}`}
              />
              <p className="text-xs text-gray-400 mt-1">Minimum: ₦{MIN_BUDGETS[objective].toLocaleString()}</p>
            </div>

            {/* Rates */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Payment Rates</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(type === 'performance' || type === 'hybrid') && (
                  <>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Per 1K views (₦)</label>
                      <input
                        type="number"
                        value={perView}
                        onChange={(e) => setPerView(e.target.value)}
                        min={0}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Per like (₦)</label>
                      <input
                        type="number"
                        value={perLike}
                        onChange={(e) => setPerLike(e.target.value)}
                        min={0}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Per comment (₦)</label>
                      <input
                        type="number"
                        value={perComment}
                        onChange={(e) => setPerComment(e.target.value)}
                        min={0}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="5"
                      />
                    </div>
                  </>
                )}
                {(type === 'deliverable' || type === 'hybrid') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Fixed rate (₦)</label>
                    <input
                      type="number"
                      value={fixedRate}
                      onChange={(e) => setFixedRate(e.target.value)}
                      min={0}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="5000"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Platforms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allowed Platforms *</label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 capitalize transition-colors ${
                      platforms.includes(p)
                        ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-green-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requirements *</label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                placeholder="What should creators do? e.g. Create a 60s review video, include our product, use hashtag #ClyqaCampaign"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
                Your campaign will be submitted for admin review before going live.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 text-white font-semibold py-3 rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Creating...' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
