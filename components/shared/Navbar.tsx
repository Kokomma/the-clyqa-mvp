'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from '@/components/shared/ThemeToggle';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navLinks = user?.role === 'creator'
    ? [
        { href: '/creator/dashboard', label: 'Dashboard' },
        { href: '/creator/campaigns', label: 'Campaigns' },
        { href: '/creator/submissions', label: 'Submissions' },
        { href: '/creator/wallet', label: 'Wallet' },
      ]
    : user?.role === 'brand'
    ? [
        { href: '/brand/dashboard', label: 'Dashboard' },
        { href: '/brand/campaigns', label: 'Campaigns' },
        { href: '/brand/wallet', label: 'Wallet' },
      ]
    : user?.role === 'admin'
    ? [
        { href: '/admin/dashboard', label: 'Dashboard' },
        { href: '/admin/campaigns', label: 'Campaigns' },
        { href: '/admin/users', label: 'Users' },
        { href: '/admin/withdrawals', label: 'Withdrawals' },
        { href: '/admin/waitlist', label: 'Waitlist' },
      ]
    : [];

  return (
    <nav className="bg-black/80 backdrop-blur border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Clyqa</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {loading ? null : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-400">{user.displayName}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Login</Link>
                <Link href="/register" className="bg-green-500 hover:bg-green-400 text-black text-sm font-bold px-4 py-2 rounded-lg transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 rounded-md text-zinc-400 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Open menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-zinc-950 border-t border-zinc-800 px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm font-medium text-zinc-300 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button onClick={handleLogout} className="block w-full text-left py-2 text-sm text-red-400">
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-sm text-zinc-400" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link href="/register" className="block py-2 text-sm text-green-400 font-medium" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
