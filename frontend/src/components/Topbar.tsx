'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LogOut, Settings, User, Bell, ChevronDown, Kanban,
  LayoutDashboard, X, ListChecks, Calendar, BarChart3,
  Command as CommandIcon, CheckCheck, Trash2, Loader2
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { api, API_URL } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { relativeTime } from '@/lib/time';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/my-tasks', label: 'My Tasks', icon: ListChecks },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Topbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const initials = user?.name?.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase() || '?';
  const profilePicUrl = user?.profilePic ? `${API_URL}${user.profilePic}` : null;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await api.listNotifications();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {}
    finally { setNotifLoading(false); }
  }, []);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user, loadNotifications]);

  // Refresh unread count every 60s
  useEffect(() => {
    if (!user) return;
    const t = setInterval(loadNotifications, 60_000);
    return () => clearInterval(t);
  }, [user, loadNotifications]);

  const markRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((ns) => ns.map((n) => n._id === id ? { ...n, read: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const clearAll = async () => {
    try {
      await api.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch {}
  };

  const TYPE_COLORS: Record<string, string> = {
    task_assigned: 'bg-accent',
    task_commented: 'bg-pink-400',
    task_mention: 'bg-purple-400',
    task_due_soon: 'bg-amber-400',
    task_status_changed: 'bg-emerald-400',
    workspace_invite_accepted: 'bg-emerald-400',
    member_joined: 'bg-blue-400',
    workspace_role_changed: 'bg-orange-400',
  };

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
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                  ? 'bg-white/8 text-white'
                  : 'text-ink-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          {/* Cmd+K button */}
          <button
            onClick={() => {
              const e = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
              window.dispatchEvent(e);
            }}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.07] text-ink-500 hover:text-ink-300 hover:border-white/15 transition-all text-xs"
            title="Open command palette"
          >
            <CommandIcon className="w-3 h-3" />
            <span>Search</span>
            <kbd className="kbd">⌘K</kbd>
          </button>

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) loadNotifications(); }}
              className="relative p-2 rounded-lg text-ink-400 hover:text-white hover:bg-white/5 transition-all"
              title="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-accent rounded-full text-[10px] text-white font-bold flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications panel */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{ duration: 0.14 }}
                  className="absolute right-0 top-full mt-2 w-80 card border-white/10 shadow-2xl shadow-black/50 z-50"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full font-semibold">{unreadCount}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} title="Mark all read" className="p-1 rounded text-ink-400 hover:text-white hover:bg-white/5 transition-all">
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button onClick={clearAll} title="Clear all" className="p-1 rounded text-ink-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => setNotifOpen(false)} className="p-1 rounded text-ink-400 hover:text-white hover:bg-white/5 transition-all">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-4 h-4 animate-spin text-ink-400" />
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-8 text-center text-ink-500 text-sm">
                        <Bell className="w-6 h-6 mx-auto mb-2 opacity-30" />
                        No notifications
                      </div>
                    ) : (
                      <div className="py-1">
                        {notifications.slice(0, 15).map((n: any) => (
                          <button
                            key={n._id}
                            onClick={() => { if (!n.read) markRead(n._id); if (n.link) { setNotifOpen(false); } }}
                            className={`w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-white/4 transition-colors ${!n.read ? 'bg-accent/5' : ''}`}
                          >
                            <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${TYPE_COLORS[n.type] || 'bg-ink-500'}`} />
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm truncate ${!n.read ? 'font-semibold text-white' : 'text-ink-200'}`}>{n.title}</p>
                              <p className="text-xs text-ink-400 mt-0.5 truncate">{n.body}</p>
                              <p className="text-xs text-ink-600 mt-1">{relativeTime(n.createdAt)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
                      <DropdownItem icon={LayoutDashboard} href="/dashboard" onClick={() => setOpen(false)}>Dashboard</DropdownItem>
                      <DropdownItem icon={ListChecks} href="/my-tasks" onClick={() => setOpen(false)}>My Tasks</DropdownItem>
                      <DropdownItem icon={BarChart3} href="/analytics" onClick={() => setOpen(false)}>Analytics</DropdownItem>
                      <DropdownItem icon={User} href="/settings" onClick={() => setOpen(false)}>Profile settings</DropdownItem>
                      <DropdownItem icon={Settings} href="/settings?tab=security" onClick={() => setOpen(false)}>Security</DropdownItem>
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
