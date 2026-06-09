import Link from 'next/link';
import { ArrowRight, TrendingUp, Users, DollarSign, BarChart2, CheckCircle, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navbar */}
      <nav className="bg-black/80 backdrop-blur border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <span className="text-2xl font-extrabold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Clyqa</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Login</Link>
            <Link href="/register" className="bg-green-500 hover:bg-green-400 text-black text-sm font-bold px-4 py-2 rounded-lg transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-32 px-4">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-br from-green-500/10 via-transparent to-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <Zap size={14} />
            Performance-based creator marketplace
          </div>
          <h1 className="text-[64px] sm:text-[80px] font-extrabold leading-[1.05] tracking-tight mb-6">
            Brands fund campaigns.{' '}
            <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Creators earn from results.
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Clyqa connects brands with creators on a performance basis. Pay for real views, likes, and comments — not just promises.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              Start as a Creator <ArrowRight size={20} />
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 border border-zinc-700 text-white font-semibold px-8 py-4 rounded-xl hover:border-zinc-500 hover:bg-zinc-900 transition-colors text-lg"
            >
              Launch a Campaign
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Active Creators', value: '10,000+' },
            { label: 'Campaigns Funded', value: '₦50M+' },
            { label: 'Brands', value: '500+' },
            { label: 'Avg. Creator Earnings', value: '₦120K' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-extrabold text-white">{stat.value}</p>
              <p className="text-zinc-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-white mb-4">How Clyqa Works</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              A transparent, performance-driven process from campaign creation to payout.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '01', icon: DollarSign, title: 'Brand Creates Campaign', desc: 'Set budget, rates per view/like/comment, requirements, and platforms.' },
              { step: '02', icon: Users, title: 'Creators Submit Content', desc: 'Approved creators post content and submit their TikTok/Instagram links.' },
              { step: '03', icon: TrendingUp, title: 'Earn Based on Performance', desc: 'Earnings are calculated from real engagement metrics. Withdraw anytime.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                <span className="text-6xl font-black text-green-500/10 absolute top-4 right-4 select-none">{step}</span>
                <div className="text-4xl font-black text-green-500 mb-4">{step}</div>
                <div className="bg-green-500/10 text-green-400 p-3 rounded-xl w-fit mb-4">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Creators */}
      <section className="py-24 px-4 bg-gradient-to-br from-green-500/5 via-transparent to-transparent border-y border-zinc-800">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">For Creators</div>
            <h2 className="text-4xl font-extrabold text-white mb-4">Monetize your audience with real earnings</h2>
            <p className="text-zinc-400 mb-6">
              No flat fees. No guesswork. You earn based on the actual engagement your content drives.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Browse campaigns that match your niche',
                'Submit your TikTok or Instagram content',
                'Track views, likes, and comment earnings',
                'Withdraw to your bank account instantly',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/register" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-xl transition-colors">
              Join as Creator <ArrowRight size={18} />
            </Link>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
            <h3 className="font-semibold text-zinc-300 mb-4">Earnings Formula</h3>
            <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-5 font-mono text-sm text-green-400">
              <p className="text-zinc-500">// earnings calculation</p>
              <p className="mt-2">earnings =</p>
              <p className="ml-4 text-cyan-400">(views / 1000 * ratePerView)</p>
              <p className="ml-4">+ <span className="text-cyan-400">(likes * ratePerLike)</span></p>
              <p className="ml-4">+ <span className="text-cyan-400">(comments * ratePerComment)</span></p>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">100K views @ ₦50/1K</span>
                <span className="font-semibold text-green-400">₦5,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">2,000 likes @ ₦2</span>
                <span className="font-semibold text-green-400">₦4,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">500 comments @ ₦5</span>
                <span className="font-semibold text-green-400">₦2,500</span>
              </div>
              <div className="border-t border-zinc-800 pt-3 flex justify-between font-bold">
                <span className="text-white">Total</span>
                <span className="text-green-400">₦11,500</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Brands */}
      <section className="py-24 px-4 bg-gradient-to-br from-transparent via-transparent to-cyan-500/5">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-4">
            {[
              { type: 'Performance', desc: 'Pay per view, like, comment', color: 'bg-green-500/10 text-green-400 border border-green-500/20' },
              { type: 'Deliverable', desc: 'Fixed pay per content piece', color: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' },
              { type: 'Hybrid', desc: 'Mix of performance + fixed', color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
            ].map((t) => (
              <div key={t.type} className="flex items-center gap-4 bg-zinc-800/50 rounded-xl p-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.color}`}>{t.type}</span>
                <span className="text-sm text-zinc-400">{t.desc}</span>
              </div>
            ))}
          </div>
          <div className="order-1 md:order-2">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wider">For Brands</div>
            <h2 className="text-4xl font-extrabold text-white mb-4">Only pay for content that performs</h2>
            <p className="text-zinc-400 mb-6">
              Set your budget, define performance metrics, and let creators compete to deliver results.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Performance, deliverable, or hybrid campaigns',
                'Real-time submission tracking',
                'Admin-verified creators only',
                'Full transparency on spending',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-zinc-300">
                  <BarChart2 size={18} className="text-cyan-400 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/register" className="inline-flex items-center gap-2 border border-zinc-700 text-white font-bold px-6 py-3 rounded-xl hover:border-zinc-500 hover:bg-zinc-900 transition-colors">
              Launch a Campaign <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-gradient-to-br from-green-500/10 via-transparent to-cyan-500/10 border-y border-zinc-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-extrabold text-white mb-4">
            Ready to grow with{' '}
            <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Clyqa?</span>
          </h2>
          <p className="text-zinc-400 text-lg mb-8">Join thousands of creators and brands on the performance creator platform.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold px-8 py-4 rounded-xl transition-colors text-lg">
            Get Started Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800 text-zinc-500 py-8 px-4 text-center text-sm">
        <p className="font-extrabold text-lg bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-2">Clyqa</p>
        <p>© {new Date().getFullYear()} Clyqa. All rights reserved.</p>
      </footer>
    </div>
  );
}
