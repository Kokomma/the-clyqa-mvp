'use client';

import { useEffect, useState } from 'react';

interface Counts {
  total: number;
  creators: number;
  brands: number;
}

// Shows how many people are waiting. Refreshes every 60 seconds.
export default function LiveCount({ refreshKey = 0 }: { refreshKey?: number }) {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/waitlist', { cache: 'no-store' });
        if (!res.ok) throw new Error('bad status');
        const data = (await res.json()) as Counts;
        if (!cancelled) {
          setCounts({ total: data.total, creators: data.creators, brands: data.brands });
          setFailed(false);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    load();
    const timer = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [refreshKey]);

  if (failed || !counts) {
    return <div className="count-line">{failed ? 'Live waitlist count unavailable' : 'Loading waitlist…'}</div>;
  }

  return (
    <div className="count-line live-count" aria-live="polite">
      <div className="live-count-total">
        <strong>{counts.total.toLocaleString()}</strong> people waiting
      </div>
      <div className="live-count-split">
        <span>
          <strong>{counts.creators.toLocaleString()}</strong> creators
        </span>
        <span>
          <strong>{counts.brands.toLocaleString()}</strong> brands
        </span>
      </div>
    </div>
  );
}
