'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/shared/DashboardLayout';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { auth } from '@/lib/firebase';
import type { WaitlistEntry } from '@/lib/waitlist';

interface WaitlistResponse {
  total: number;
  creators: number;
  brands: number;
  entries: WaitlistEntry[];
}

type RoleFilter = 'all' | 'creator' | 'brand';

export default function AdminWaitlistPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<WaitlistResponse | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    const load = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error('Not signed in');
        const res = await fetch('/api/admin/waitlist', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Could not load the waitlist');
        setData(json);
        setError('');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Could not load the waitlist');
      }
    };
    load();
  }, [user]);

  const rows = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.entries.filter((e) => {
      if (roleFilter !== 'all' && e.role !== roleFilter) return false;
      if (!q) return true;
      return [e.name, e.email, e.handle, e.category].some((v) => v.toLowerCase().includes(q));
    });
  }, [data, query, roleFilter]);

  const exportCsv = () => {
    const header = ['name', 'email', 'role', 'handle', 'category', 'joined'];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = rows.map((e) => [e.name, e.email, e.role, e.handle, e.category, e.createdAt ?? ''].map((v) => esc(String(v))).join(','));
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clyqa-waitlist.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || (user?.role === 'admin' && !data && !error)) {
    return <DashboardLayout><LoadingSpinner size="lg" /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Waitlist</h1>
          <p className="text-zinc-400 mt-1">Everyone who has signed up on the landing page.</p>
        </div>
        <button type="button" onClick={exportCsv} disabled={!rows.length} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold">
          Export CSV
        </button>
      </div>

      {error && <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Stat label="Total waiting" value={data.total} />
            <Stat label="Creators" value={data.creators} />
            <Stat label="Brands" value={data.brands} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, handle…"
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm placeholder-zinc-500"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="creator">Creators</option>
              <option value="brand">Brands</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900">
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Handle / company</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id} className="border-b border-zinc-800 last:border-0">
                    <td className="px-4 py-3">{e.name}</td>
                    <td className="px-4 py-3">{e.email}</td>
                    <td className="px-4 py-3 capitalize">{e.role}</td>
                    <td className="px-4 py-3">{e.handle || '—'}</td>
                    <td className="px-4 py-3">{e.category || '—'}</td>
                    <td className="px-4 py-3">{e.createdAt ? new Date(e.createdAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No matching sign-ups.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}
