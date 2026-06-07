'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

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
      ]
    : user?.role === 'admin'
    ? [
        { href: '/admin/dashboard', label: 'Dashboard' },
        { href: '/admin/campaigns', label: 'Campaigns' },
        { href: '/admin/users', label: 'Users' },
        { href: '/admin/withdrawals', label: 'Withdrawals' },
      ]
    : [];

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-600">Clyqa</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {loading ? null : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">{user.displayName}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-green-600">Login</Link>
                <Link href="/register" className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-green-600"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button onClick={handleLogout} className="block w-full text-left py-2 text-sm text-red-600">
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className="block py-2 text-sm text-gray-700" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link href="/register" className="block py-2 text-sm text-green-600 font-medium" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
