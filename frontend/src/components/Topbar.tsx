'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LogOut, Settings, User, Bell, ChevronDown, Kanban,
  LayoutDashboard, X
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { api, API_URL } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function Topbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const initials = user?.name?.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase() || '?';
  const profilePicUrl = user?.profilePic ? `${API_URL}${user.profilePic}` : null;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="border-b border-white/[0.05] backdrop-blur-md sticky top-0 z-30 bg-ink-950/85">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center shadow-lg shadow-accent/25 group-hover:scale-105 transition-transform">
              <Kanban className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">TaskFlow</span>
          </Link>
        </motion.div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname === href ? 'bg-white/8 text-white' : 'text-ink-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <button
            onClick={() => setNotifications(!notifications)}
            className="relative p-2 rounded-lg text-ink-400 hover:text-white hover:bg-white/5 transition-all"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full" />
          </button>

          {/* Settings shortcut */}
          <Link
            href="/settings"
            className={`p-2 rounded-lg text-ink-400 hover:text-white hover:bg-white/5 transition-all ${pathname === '/settings' ? 'text-white bg-white/8' : ''}`}
            title="Settings"
          >
            <Settings className="w-4.5 h-4.5" />
          </Link>

          {/* User dropdown */}
          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-all cursor-pointer group"
              >
                {profilePicUrl ? (
                  <img src={profilePicUrl} alt={user.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-white/10" />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-white/10"
                    style={{ background: user.avatarColor || '#6366f1' }}
                  >
                    {initials}
                  </div>
                )}
                <span className="text-ink-200 text-sm hidden sm:inline max-w-[120px] truncate">{user.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-ink-500 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -6 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 top-full mt-2 w-64 card border-white/10 shadow-2xl shadow-black/50 py-1 z-50"
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        {profilePicUrl ? (
                          <img src={profilePicUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: user.avatarColor || '#6366f1' }}
                          >
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{user.name}</p>
                          <p className="text-ink-400 text-xs truncate">{user.email}</p>
                          {user.username && <p className="text-ink-500 text-xs">@{user.username}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1">
                      <DropdownItem icon={LayoutDashboard} href="/dashboard" onClick={() => setOpen(false)}>
                        Dashboard
                      </DropdownItem>
                      <DropdownItem icon={User} href="/settings" onClick={() => setOpen(false)}>
                        Profile settings
                      </DropdownItem>
                      <DropdownItem icon={Settings} href="/settings?tab=security" onClick={() => setOpen(false)}>
                        Security
                      </DropdownItem>
                      <DropdownItem icon={Bell} href="/settings?tab=notifications" onClick={() => setOpen(false)}>
                        Notifications
                      </DropdownItem>
                    </div>

                    <div className="border-t border-white/[0.06] py-1">
                      <button
                        onClick={() => { setOpen(false); logout(); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Notifications panel */}
      <AnimatePresence>
        {notifications && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-4 w-80 card border-white/10 shadow-2xl shadow-black/50 z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <button onClick={() => setNotifications(false)} className="text-ink-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {[
                  { title: 'Task assigned to you', desc: '"Fix auth bug" was assigned by Alex', time: '2m ago', dot: 'bg-accent' },
                  { title: 'New comment', desc: 'Sarah commented on "Design review"', time: '15m ago', dot: 'bg-pink-400' },
                  { title: 'Workspace invite accepted', desc: 'Marcus joined your workspace', time: '1h ago', dot: 'bg-emerald-400' },
                ].map((n, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/4 transition-colors cursor-default">
                    <span className={`w-2 h-2 rounded-full ${n.dot} mt-1.5 flex-shrink-0`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="text-xs text-ink-400 mt-0.5 truncate">{n.desc}</p>
                      <p className="text-xs text-ink-600 mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full text-center text-xs text-accent hover:underline mt-3 py-1">View all notifications</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function DropdownItem({ icon: Icon, href, onClick, children }: { icon: any; href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 text-sm text-ink-200 hover:text-white hover:bg-white/5 transition-colors"
    >
      <Icon className="w-4 h-4 text-ink-400" />
      {children}
    </Link>
  );
}
