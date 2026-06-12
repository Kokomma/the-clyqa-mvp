import { ExternalLink, Mail } from 'lucide-react';
import { WaitlistForm } from '@/components/WaitlistForm';
import { HowItWorks } from '@/components/HowItWorks';
import { FadeIn } from '@/components/FadeIn';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
          <span className="font-[family-name:var(--font-pacifico)] text-white text-2xl tracking-tight">
            Clyqa<sup className="text-[#00E676] text-xs ml-0.5">▲</sup>
          </span>
          <a
            href="#waitlist"
            className="text-sm font-semibold text-[#00E676] hover:text-white transition"
          >
            Join Waitlist →
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section
        id="waitlist"
        className="relative overflow-hidden py-32 px-4 text-center"
      >
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#00E676]/5 blur-[120px] rounded-full" />

        <div className="relative max-w-4xl mx-auto">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-[#00E676]/10 border border-[#00E676]/20 text-[#00E676] text-sm font-medium px-4 py-2 rounded-full mb-8">
              <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
              Now accepting early access
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <h1 className="text-5xl sm:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6">
              Get paid for every{' '}
              <span className="text-[#00E676]">view, like</span>
              {' '}& sale.
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-0">
              Brands post campaigns. Creators post content. Everyone earns on performance — no more one-off fees.
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="max-w-md mx-auto mt-10">
              <WaitlistForm />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-4 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <FadeIn>
              <p className="text-[#00E676] text-xs font-bold uppercase tracking-widest mb-3">
                How it works
              </p>
            </FadeIn>
            <FadeIn delay={100}>
              <h2 className="text-4xl font-extrabold text-white">Simple by design.</h2>
            </FadeIn>
          </div>
          <HowItWorks />
        </div>
      </section>

      {/* WHY CLYQA */}
      <section className="py-24 px-4 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <FadeIn>
              <p className="text-[#00E676] text-xs font-bold uppercase tracking-widest mb-3">
                Why Clyqa
              </p>
            </FadeIn>
            <FadeIn delay={100}>
              <h2 className="text-4xl font-extrabold text-white">Built different.</h2>
            </FadeIn>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <FadeIn delay={0}>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 h-full">
                <p className="text-3xl mb-4">💸</p>
                <h3 className="text-white font-bold text-lg mb-2">Performance-based payouts</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  No flat fees or guesswork. Every naira paid maps to a real view, like, or sale.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 h-full">
                <p className="text-3xl mb-4">🚀</p>
                <h3 className="text-white font-bold text-lg mb-2">Many creators, one campaign</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Dozens of creators amplify your brand simultaneously — not just one influencer bet.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 h-full">
                <p className="text-3xl mb-4">🇳🇬</p>
                <h3 className="text-white font-bold text-lg mb-2">Built for Africa, starting with Nigeria</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Designed for the Nigerian creator economy first, with local payment rails and support.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-28 px-4 border-t border-zinc-900">
        <div className="max-w-xl mx-auto text-center">
          <FadeIn>
            <span className="font-[family-name:var(--font-pacifico)] text-white text-2xl tracking-tight">
              Clyqa<sup className="text-[#00E676] text-xs ml-0.5">▲</sup>
            </span>
          </FadeIn>
          <FadeIn delay={100}>
            <h2 className="text-4xl sm:text-5xl font-extrabold mt-6 mb-4">
              Ready to earn on every post?
            </h2>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="text-zinc-400 text-lg mb-10">
              Join the waitlist. Be first when we launch in Nigeria.
            </p>
          </FadeIn>
          <FadeIn delay={300}>
            <div className="max-w-md mx-auto">
              <WaitlistForm />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 py-10 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-sm max-w-5xl mx-auto">
          <span className="font-[family-name:var(--font-pacifico)] text-white text-xl tracking-tight">
            Clyqa<sup className="text-[#00E676] text-xs ml-0.5">▲</sup>
          </span>

          <p>© 2026 Clyqa. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/clyqaa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition"
            >
              <ExternalLink size={15} />
              @clyqaa
            </a>
            <a
              href="mailto:hello@clyqa.com"
              className="flex items-center gap-1.5 hover:text-white transition"
            >
              <Mail size={15} />
              hello@clyqa.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
