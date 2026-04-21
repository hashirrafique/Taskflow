'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Topbar() {
  const { user, logout } = useAuth();
  const initials = user?.name?.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase() || '?';
  return (
    <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-20 bg-ink-950/80">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center font-bold text-white text-sm">T</div>
          <span className="font-display text-xl">TaskFlow</span>
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white"
                style={{ background: user.avatarColor || '#6366f1' }}
              >
                {initials}
              </div>
              <span className="text-ink-200 hidden sm:inline">{user.name}</span>
            </div>
          )}
          <button onClick={logout} className="btn btn-ghost !py-1.5 !px-2.5" title="Sign out">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
