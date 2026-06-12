'use client';
import { useState, useId } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { submitWaitlist, type WaitlistRole } from '@/lib/waitlist';

interface FormData {
  name: string;
  email: string;
  role: WaitlistRole;
}

type Status = 'idle' | 'loading' | 'success' | 'duplicate' | 'error';

function validateForm(data: FormData): string | null {
  if (!data.name.trim()) return 'Please enter your name.';
  if (!data.email.trim()) return 'Please enter your email.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Please enter a valid email address.';
  return null;
}

export function WaitlistForm() {
  const formId = useId();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: 'creator',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateForm(formData);
    if (validationError) {
      setStatus('error');
      setErrorMessage(validationError);
      return;
    }
    setStatus('loading');
    const result = await submitWaitlist(formData);
    if (result.ok) {
      setStatus('success');
    } else if (result.duplicate) {
      setStatus('duplicate');
    } else {
      setStatus('error');
      setErrorMessage(result.error ?? 'Something went wrong. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-10">
        <p className="text-6xl mb-4">🎉</p>
        <h3 className="text-2xl font-extrabold text-white mb-2">You&apos;re on the list!</h3>
        <p className="text-zinc-400">We&apos;ll email you when Clyqa goes live.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor={`${formId}-name`} className="sr-only">Full name</label>
        <input
          id={`${formId}-name`}
          type="text"
          placeholder="Your name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#00E676]/60 transition"
          disabled={status === 'loading'}
          autoComplete="name"
        />
      </div>

      <div>
        <label htmlFor={`${formId}-email`} className="sr-only">Email address</label>
        <input
          id={`${formId}-email`}
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#00E676]/60 transition"
          disabled={status === 'loading'}
          autoComplete="email"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setFormData((prev) => ({ ...prev, role: 'creator' }))}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition ${
            formData.role === 'creator'
              ? 'bg-[#00E676] text-black border-[#00E676]'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
          }`}
        >
          I&apos;m a Creator
        </button>
        <button
          type="button"
          onClick={() => setFormData((prev) => ({ ...prev, role: 'brand' }))}
          className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition ${
            formData.role === 'brand'
              ? 'bg-[#00E676] text-black border-[#00E676]'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
          }`}
        >
          I&apos;m a Brand
        </button>
      </div>

      {status === 'duplicate' && (
        <p className="text-amber-400 text-sm bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3">
          This email is already on the list!
        </p>
      )}

      {status === 'error' && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="flex items-center justify-center gap-2 bg-[#00E676] hover:bg-[#00E676]/90 text-black font-bold px-6 py-3.5 rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Joining…
          </>
        ) : (
          <>
            Join the Waitlist
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </form>
  );
}
