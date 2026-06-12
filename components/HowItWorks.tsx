'use client';
import { useState } from 'react';
import { Search, Video, DollarSign, BarChart2, Users, CheckCircle } from 'lucide-react';

const creatorSteps = [
  {
    number: '01',
    icon: Search,
    title: 'Browse campaigns',
    desc: 'Find campaigns that match your content style and audience niche.',
  },
  {
    number: '02',
    icon: Video,
    title: 'Post content on YOUR page',
    desc: 'Create and publish content directly on your own social media page.',
  },
  {
    number: '03',
    icon: DollarSign,
    title: 'Earn per view, like & sale',
    desc: 'Get paid based on the real engagement your content drives.',
  },
];

const brandSteps = [
  {
    number: '01',
    icon: BarChart2,
    title: 'Post a campaign with your budget & rates',
    desc: 'Set your campaign goals, define your performance rates, and publish.',
  },
  {
    number: '02',
    icon: Users,
    title: 'Dozens of creators post about you',
    desc: 'Multiple creators amplify your brand simultaneously across their pages.',
  },
  {
    number: '03',
    icon: CheckCircle,
    title: 'Pay only for real engagement',
    desc: 'Every naira you spend maps to a verified view, like, or sale.',
  },
];

export function HowItWorks() {
  const [tab, setTab] = useState<'creator' | 'brand'>('creator');
  const steps = tab === 'creator' ? creatorSteps : brandSteps;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 w-fit mx-auto flex p-1 mb-12">
        <button
          onClick={() => setTab('creator')}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
            tab === 'creator'
              ? 'bg-[#00E676] text-black'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Creators
        </button>
        <button
          onClick={() => setTab('brand')}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
            tab === 'brand'
              ? 'bg-[#00E676] text-black'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Brands
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {steps.map(({ number, icon: Icon, title, desc }) => (
          <div
            key={number}
            className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8"
          >
            <span className="text-[80px] font-black text-[#00E676]/10 absolute top-2 right-4 leading-none select-none">
              {number}
            </span>
            <div className="relative">
              <div className="bg-[#00E676]/10 text-[#00E676] p-3 rounded-xl w-fit mb-5">
                <Icon size={22} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
