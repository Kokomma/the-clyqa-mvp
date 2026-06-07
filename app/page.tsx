import Link from 'next/link';
import { ArrowRight, TrendingUp, Users, DollarSign, BarChart2, CheckCircle, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <span className="text-2xl font-bold text-green-600">Clyqa</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-green-600 dark:text-gray-300">Login</Link>
            <Link href="/register" className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Zap size={14} />
            Performance-based creator marketplace
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            Brands fund campaigns.<br />
            <span className="text-green-600">Creators earn from results.</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
            Clyqa connects brands with creators on a performance basis. Pay for real views, likes, and comments — not just promises.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-green-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-green-700 transition-colors text-lg"
            >
              Start as a Creator <ArrowRight size={20} />
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 border-2 border-green-600 text-green-600 font-semibold px-8 py-4 rounded-xl hover:bg-green-50 transition-colors text-lg"
            >
              Launch a Campaign
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-900 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Active Creators', value: '10,000+' },
            { label: 'Campaigns Funded', value: '₦50M+' },
            { label: 'Brands', value: '500+' },
            { label: 'Avg. Creator Earnings', value: '₦120K' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">How Clyqa Works</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-14 max-w-xl mx-auto">
            A transparent, performance-driven process from campaign creation to payout.
          </p>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', icon: DollarSign, title: 'Brand Creates Campaign', desc: 'Set budget, rates per view/like/comment, requirements, and platforms.' },
              { step: '02', icon: Users, title: 'Creators Submit Content', desc: 'Approved creators post content and submit their TikTok/Instagram links.' },
              { step: '03', icon: TrendingUp, title: 'Earn Based on Performance', desc: 'Earnings are calculated from real engagement metrics. Withdraw anytime.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
                <span className="text-5xl font-black text-green-100 dark:text-green-900 absolute top-4 right-4">{step}</span>
                <div className="bg-green-600 text-white p-3 rounded-xl w-fit mb-4">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Creators */}
      <section className="py-20 px-4 bg-green-50 dark:bg-green-900/10">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-green-600 font-semibold text-sm mb-3">FOR CREATORS</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Monetize your audience with real earnings</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              No flat fees. No guesswork. You earn based on the actual engagement your content drives.
            </p>
            <ul className="space-y-3">
              {[
                'Browse campaigns that match your niche',
                'Submit your TikTok or Instagram content',
                'Track views, likes, and comment earnings',
                'Withdraw to your bank account instantly',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                  <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/register" className="mt-8 inline-flex items-center gap-2 bg-green-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-700 transition-colors">
              Join as Creator <ArrowRight size={18} />
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-4">Earnings Formula</h3>
            <div className="bg-gray-900 rounded-xl p-5 font-mono text-sm text-green-400">
              <p>earnings =</p>
              <p className="ml-4">(views / 1000 * ratePerView)</p>
              <p className="ml-4">+ (likes * ratePerLike)</p>
              <p className="ml-4">+ (comments * ratePerComment)</p>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">100K views @ ₦50/1K</span>
                <span className="font-semibold text-green-600">₦5,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">2,000 likes @ ₦2</span>
                <span className="font-semibold text-green-600">₦4,000</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">500 comments @ ₦5</span>
                <span className="font-semibold text-green-600">₦2,500</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-green-600">₦11,500</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Brands */}
      <section className="py-20 px-4 bg-white dark:bg-gray-950">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 space-y-4">
            {[
              { type: 'Performance', desc: 'Pay per view, like, comment', color: 'bg-green-100 text-green-700' },
              { type: 'Deliverable', desc: 'Fixed pay per content piece', color: 'bg-cyan-100 text-cyan-700' },
              { type: 'Hybrid', desc: 'Mix of performance + fixed', color: 'bg-purple-100 text-purple-700' },
            ].map((t) => (
              <div key={t.type} className="flex items-center gap-4 bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.color}`}>{t.type}</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">{t.desc}</span>
              </div>
            ))}
          </div>
          <div className="order-1 md:order-2">
            <div className="text-cyan-600 font-semibold text-sm mb-3">FOR BRANDS</div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Only pay for content that performs</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Set your budget, define performance metrics, and let creators compete to deliver results.
            </p>
            <ul className="space-y-3">
              {[
                'Performance, deliverable, or hybrid campaigns',
                'Real-time submission tracking',
                'Admin-verified creators only',
                'Full transparency on spending',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-700 dark:text-gray-200">
                  <BarChart2 size={18} className="text-cyan-600 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/register" className="mt-8 inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold px-6 py-3 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              Launch a Campaign <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-green-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to grow with Clyqa?</h2>
          <p className="text-green-100 text-lg mb-8">Join thousands of creators and brands on the performance creator platform.</p>
          <Link href="/register" className="inline-flex items-center gap-2 bg-white text-green-700 font-bold px-8 py-4 rounded-xl hover:bg-green-50 transition-colors text-lg">
            Get Started Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <p>© {new Date().getFullYear()} Clyqa. All rights reserved.</p>
      </footer>
    </div>
  );
}
