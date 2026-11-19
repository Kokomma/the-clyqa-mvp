'use client';

import Link from 'next/link';
import { useState } from 'react';
import ThemeToggle from '@/components/shared/ThemeToggle';
import WaitlistForm from '@/components/waitlist/WaitlistForm';
import LiveCount from '@/components/waitlist/LiveCount';

const features = [
  { icon: '∞', title: 'Evergreen Earnings', text: 'Eligible content can earn again within an agreed earning period, based on new approved performance.' },
  { icon: '◎', title: 'Second Life', text: 'Brands propose funded extensions. Creators choose whether to accept the new earning and usage terms.' },
  { icon: '◆', title: 'Your creator profile', text: 'Show your approved track record, creator level and brand feedback. Decide what you make public.' },
  { icon: '◷', title: 'Monthly Drops', text: 'Discover curated collections of live campaigns. Budgets and availability come from real platform records.' },
  { icon: '✳', title: 'Clyqa Lab', text: 'Suggest what should come next and vote on moderated ideas with the community.' },
  { icon: '01', title: 'Founding creators', text: 'The first 100 confirmed creator signups receive a founding number. Referrals count after email confirmation.' },
];

export default function Landing() {
  const [countKey, setCountKey] = useState(0);

  return (
    <>
      <header className="nav">
        <Link className="brand-logo" aria-label="Clyqa home" href="/">
          <img className="brand-light" src="/brand/option-4.jpeg" alt="Clyqa" />
          <img className="brand-dark" src="/brand/option-5.jpeg" alt="" />
        </Link>
        <nav>
          <a href="#how">How it works</a>
          <a href="#ecosystem">The platform</a>
          <Link href="/register">Join as a brand or creator</Link>
        </nav>
        <ThemeToggle />
        <Link href="/login">Sign in</Link>
      </header>

      <main>
        <section className="launch-hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <i /> THE CREATOR ECONOMY, ON YOUR TERMS
            </span>
            <h1>
              Great content.
              <br />
              Real results.
              <br />
              <em>Your payday.</em>
            </h1>
            <p className="lead">
              Brands fund the brief. Creators bring the ideas.
              <br />
              Performance decides what comes next.
            </p>
            <p>
              Earn from approved views, engagement and sales — with clear rates, funded campaigns and your earnings in one place.
            </p>
            <a className="button hero-cta" href="#join">
              Get early access
            </a>
            <div className="hero-tags">
              <span>Built for creators</span>
              <span>Made for brands</span>
              <span>Starting in Nigeria</span>
            </div>
            <div className="hero-photo">
              <img
                src="/images/creator-studio.png"
                alt="Illustrative scene of creators filming product content in their studio"
                width={1536}
                height={1024}
              />
              <span>Ideas worth making. Content worth paying for.</span>
            </div>
          </div>

          <aside className="waitlist-card" id="join">
            <span className="badge">EARLY ACCESS</span>
            <h2>
              Be here from
              <br />
              the beginning.
            </h2>
            <p>Join the Clyqa waitlist. See how many creators and brands are already waiting.</p>
            <WaitlistForm onJoined={() => setCountKey((k) => k + 1)} />
            <LiveCount refreshKey={countKey} />
          </aside>
        </section>

        <div className="statement">
          <span>PERFORMANCE OVER POPULARITY</span>
          <span>CREATE. SUBMIT. EARN. REPEAT.</span>
        </div>

        <section className="section" id="how">
          <span className="eyebrow">01 / HOW CLYQA WORKS</span>
          <h2>
            A clear brief.
            <br />
            <em>A better way to work.</em>
          </h2>
          <div className="steps">
            <article>
              <span>01</span>
              <h3>Find your fit</h3>
              <p>Creators apply to live campaigns. Brands set the brief, rates, budget and usage terms.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Make something that works</h3>
              <p>Brands select creators. Creators make content and submit TikTok or Instagram links.</p>
            </article>
            <article>
              <span>03</span>
              <h3>See what you earned</h3>
              <p>Moderated results become wallet earnings. Clear campaign caps and withdrawal rules apply.</p>
            </article>
          </div>
          <p className="fine">
            Manually reviewed metrics are labelled. API data requires a supported, connected account. Earnings are never guaranteed.
          </p>
        </section>

        <section className="section ecosystem" id="ecosystem">
          <span className="eyebrow">02 / MORE THAN A ONE-OFF POST</span>
          <h2>
            Build a track record.
            <br />
            <em>Keep good content working.</em>
          </h2>
          <div className="feature-grid">
            {features.map((f) => (
              <article className="panel" key={f.title}>
                <span className="feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
          <a className="button" href="#join">
            Join the waitlist
          </a>
        </section>

        <section className="closing section">
          <span className="eyebrow">YOUR CONTENT HAS VALUE</span>
          <h2>
            Make the next
            <br />
            <em>move yours.</em>
          </h2>
          <a className="button" href="#join">
            Get early access
          </a>
          <p>The public waitlist comes first. Pilot account access opens through admin approval.</p>
        </section>
      </main>

      <footer>
        <Link className="brand-logo" aria-label="Clyqa home" href="/">
          <img className="brand-light" src="/brand/option-4.jpeg" alt="Clyqa" />
          <img className="brand-dark" src="/brand/option-5.jpeg" alt="" />
        </Link>
        <p>Performance over popularity.</p>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/login">Pilot sign in</Link>
        </div>
        <span>© {new Date().getFullYear()} Clyqa</span>
      </footer>
    </>
  );
}
