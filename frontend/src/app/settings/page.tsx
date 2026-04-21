'use client';

import { useState, useRef, FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/lib/useRequireAuth';
import { api, API_URL } from '@/lib/api';
import Topbar from '@/components/Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Lock, Bell, Palette, Trash2, Camera, Loader2, Check,
  Globe, MapPin, Link2, AtSign, ChevronRight, Shield, Eye, EyeOff,
  AlertTriangle
} from 'lucide-react';
import Image from 'next/image';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'account', label: 'Account', icon: Shield },
];

const AVATAR_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4',
  '#8b5cf6', '#ef4444', '#f97316', '#14b8a6', '#84cc16',
];

export default function SettingsPage() {
  const { loading: authLoading, user } = useRequireAuth();
  const [activeTab, setActiveTab] = useState('profile');

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-ink-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Topbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-1">Settings</h1>
          <p className="text-ink-400 text-sm">Manage your account, profile, and preferences</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-56 flex-shrink-0">
            <nav className="card p-2 space-y-0.5">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-accent/15 text-accent'
                        : 'text-ink-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {tab.label}
                    {activeTab === tab.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab === 'profile' && <ProfileTab />}
                {activeTab === 'security' && <SecurityTab />}
                {activeTab === 'appearance' && <AppearanceTab />}
                {activeTab === 'notifications' && <NotificationsTab />}
                {activeTab === 'account' && <AccountTab />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

/* ── Profile Tab ── */
function ProfileTab() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [location, setLocation] = useState(user?.location || '');
  const [loading, setLoading] = useState(false);
  const [picLoading, setPicLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const profilePicUrl = user?.profilePic ? `${API_URL}${user.profilePic}` : null;
  const initials = user?.name?.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase() || '?';

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setErr(''); setSuccess(false); setLoading(true);
    try {
      const res = await api.updateProfile({ name, username, bio, website, location });
      updateUser(res.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (e: any) {
      setErr(e.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPicLoading(true); setErr('');
    try {
      const formData = new FormData();
      formData.append('profilePic', file);
      const res = await api.uploadProfilePic(formData);
      updateUser({ profilePic: res.profilePic });
    } catch (error: any) {
      setErr(error.message || 'Failed to upload image.');
    } finally {
      setPicLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar section */}
      <div className="card p-6">
        <h2 className="font-display text-2xl font-bold mb-1">Profile Picture</h2>
        <p className="text-ink-400 text-sm mb-6">Upload a photo or use your initials avatar</p>
        <div className="flex items-center gap-6">
          <div className="relative flex-shrink-0">
            {profilePicUrl ? (
              <img src={profilePicUrl} alt={user?.name} className="w-20 h-20 rounded-full object-cover ring-4 ring-ink-800" />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white ring-4 ring-ink-800"
                style={{ background: user?.avatarColor || '#6366f1' }}
              >
                {initials}
              </div>
            )}
            <button
              onClick={() => fileInput.current?.click()}
              disabled={picLoading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-lg hover:bg-accent/80 transition-colors"
            >
              {picLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : <Camera className="w-3.5 h-3.5 text-white" />}
            </button>
          </div>
          <div>
            <p className="font-semibold text-sm mb-1">{user?.name}</p>
            <p className="text-ink-400 text-xs mb-3">{user?.email}</p>
            <button
              onClick={() => fileInput.current?.click()}
              disabled={picLoading}
              className="btn btn-ghost text-xs border-white/10 py-1.5 px-3"
            >
              <Camera className="w-3.5 h-3.5" /> Change photo
            </button>
          </div>
        </div>
        <input type="file" accept="image/*" className="hidden" ref={fileInput} onChange={handleFileChange} />
      </div>

      {/* Profile form */}
      <div className="card p-6">
        <h2 className="font-display text-2xl font-bold mb-1">Personal Information</h2>
        <p className="text-ink-400 text-sm mb-6">Update your name, username and public profile details</p>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                <input className="input pl-9" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" minLength={2} />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Username</label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                <input className="input pl-9" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="yourhandle" maxLength={30} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Email</label>
            <input className="input opacity-60 cursor-not-allowed" value={user?.email || ''} disabled />
            <p className="text-xs text-ink-500 mt-1">Contact support to change your email address</p>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Bio</label>
            <textarea
              className="input resize-none"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the world a little about yourself…"
              maxLength={200}
            />
            <p className="text-xs text-ink-500 mt-1 text-right">{bio.length}/200</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Website</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                <input className="input pl-9" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yoursite.com" />
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                <input className="input pl-9" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" />
              </div>
            </div>
          </div>

          {err && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{err}</div>}

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn btn-primary px-6">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? <Check className="w-4 h-4" /> : null}
              {success ? 'Saved!' : loading ? 'Saving…' : 'Save changes'}
            </button>
            {success && <p className="text-emerald-400 text-sm flex items-center gap-1.5"><Check className="w-4 h-4" /> Profile updated</p>}
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Security Tab ── */
function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [err, setErr] = useState('');

  const strength = (() => {
    if (!newPassword) return 0;
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-500'][strength];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(''); setSuccess(false);
    if (newPassword !== confirmPassword) { setErr('Passwords do not match'); return; }
    if (newPassword.length < 6) { setErr('New password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setErr(e.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="font-display text-2xl font-bold mb-1">Change Password</h2>
        <p className="text-ink-400 text-sm mb-6">Use a strong, unique password to keep your account secure</p>

        <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                className="input pr-10"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-white">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                className="input pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-white">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword && (
              <div className="mt-2 space-y-1.5">
                <div className="flex gap-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i < strength ? strengthColor : 'bg-white/10'}`} />
                  ))}
                </div>
                <p className={`text-xs ${['', 'text-red-400', 'text-amber-400', 'text-yellow-400', 'text-emerald-400'][strength]}`}>{strengthLabel}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              className={`input ${confirmPassword && confirmPassword !== newPassword ? 'border-red-500/50' : ''}`}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
            )}
          </div>

          {err && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">{err}</div>}
          {success && <div className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2.5 flex items-center gap-2"><Check className="w-4 h-4" /> Password changed successfully!</div>}

          <button type="submit" disabled={loading} className="btn btn-primary px-6">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-2xl font-bold mb-1">Security Tips</h2>
        <p className="text-ink-400 text-sm mb-5">Keep your account secure with these practices</p>
        <ul className="space-y-3">
          {[
            'Use a unique password not used on other sites',
            'Enable 2FA whenever possible for added security',
            'Never share your password with anyone',
            'Log out from shared or public devices',
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2.5 text-sm text-ink-300">
              <Shield className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── Appearance Tab ── */
function AppearanceTab() {
  const { user, updateUser } = useAuth();
  const [selectedColor, setSelectedColor] = useState(user?.avatarColor || '#6366f1');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.updateProfile({ avatarColor: selectedColor });
      updateUser(res.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {}
    finally { setLoading(false); }
  };

  const initials = user?.name?.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="font-display text-2xl font-bold mb-1">Avatar Color</h2>
        <p className="text-ink-400 text-sm mb-6">Choose a color for your initials avatar (used when no profile picture is set)</p>

        <div className="flex items-center gap-8 mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white ring-4 ring-white/10 transition-all"
            style={{ background: selectedColor }}
          >
            {initials}
          </div>
          <div>
            <p className="font-semibold mb-1">{user?.name}</p>
            <p className="text-sm text-ink-400">Preview of your avatar</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-3">Color Palette</label>
          <div className="flex flex-wrap gap-3">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-10 h-10 rounded-xl transition-all hover:scale-110 ${selectedColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-ink-950 scale-110' : ''}`}
                style={{ background: color }}
              />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs uppercase tracking-wider text-ink-400 mb-1.5">Custom Color</label>
          <div className="flex items-center gap-3">
            <input type="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0" />
            <input
              type="text"
              className="input w-36 font-mono text-sm"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              placeholder="#6366f1"
            />
          </div>
        </div>

        <button onClick={handleSave} disabled={loading} className="btn btn-primary px-6">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? <Check className="w-4 h-4" /> : null}
          {success ? 'Saved!' : loading ? 'Saving…' : 'Save avatar color'}
        </button>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-2xl font-bold mb-1">Theme</h2>
        <p className="text-ink-400 text-sm mb-5">Choose your preferred interface theme</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'dark', label: 'Dark', preview: 'bg-ink-950', active: true },
            { id: 'light', label: 'Light', preview: 'bg-white', active: false },
            { id: 'system', label: 'System', preview: 'bg-gradient-to-br from-ink-950 to-white', active: false },
          ].map((t) => (
            <button
              key={t.id}
              className={`p-4 rounded-xl border text-sm font-medium transition-all ${t.active ? 'border-accent/60 bg-accent/10 text-accent' : 'border-white/8 text-ink-400 hover:border-white/20 hover:text-white'}`}
            >
              <div className={`w-full h-10 rounded-lg mb-2.5 ${t.preview} border border-white/10`} />
              {t.label}
              {t.active && <span className="ml-1.5 text-xs">(Active)</span>}
            </button>
          ))}
        </div>
        <p className="text-xs text-ink-500 mt-3">Dark theme is currently active. Light mode coming soon.</p>
      </div>
    </div>
  );
}

/* ── Notifications Tab ── */
function NotificationsTab() {
  const [prefs, setPrefs] = useState({
    taskAssigned: true,
    taskCommented: true,
    taskDue: true,
    workspaceInvite: true,
    memberJoined: false,
    weeklyDigest: true,
    emailUpdates: false,
  });

  const toggle = (key: keyof typeof prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const sections = [
    {
      title: 'Task Notifications',
      items: [
        { key: 'taskAssigned', label: 'Task assigned to you', desc: 'Get notified when someone assigns a task to you' },
        { key: 'taskCommented', label: 'New comment on your task', desc: 'Receive alerts when someone comments on your tasks' },
        { key: 'taskDue', label: 'Task due date reminder', desc: '24-hour reminder before a task is due' },
      ],
    },
    {
      title: 'Workspace Notifications',
      items: [
        { key: 'workspaceInvite', label: 'Workspace invite accepted', desc: 'Know when someone joins your workspace via invite code' },
        { key: 'memberJoined', label: 'New member joined', desc: 'Alert when any new member joins a workspace you own' },
      ],
    },
    {
      title: 'Email Preferences',
      items: [
        { key: 'weeklyDigest', label: 'Weekly digest', desc: 'A summary of your workspace activity every Monday' },
        { key: 'emailUpdates', label: 'Product updates', desc: 'New feature announcements and tips from the team' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.title} className="card p-6">
          <h2 className="font-display text-2xl font-bold mb-5">{section.title}</h2>
          <div className="space-y-5">
            {section.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() => toggle(item.key as keyof typeof prefs)}
                  className={`relative w-11 h-6 rounded-full transition-all flex-shrink-0 ${prefs[item.key as keyof typeof prefs] ? 'bg-accent' : 'bg-white/10'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${prefs[item.key as keyof typeof prefs] ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="card p-4 border-ink-700/50">
        <p className="text-xs text-ink-400 text-center">Notification delivery is simulated in this version. Real email delivery coming in v2.</p>
      </div>
    </div>
  );
}

/* ── Account Tab ── */
function AccountTab() {
  const { user, logout } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    const data = {
      name: user?.name,
      email: user?.email,
      username: user?.username,
      bio: user?.bio,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'taskflow-data.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="font-display text-2xl font-bold mb-1">Account Information</h2>
        <p className="text-ink-400 text-sm mb-5">Your account details and status</p>
        <div className="space-y-3">
          {[
            { label: 'Email', value: user?.email },
            { label: 'Display Name', value: user?.name },
            { label: 'Username', value: user?.username ? `@${user.username}` : 'Not set' },
            { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
              <span className="text-sm text-ink-400">{item.label}</span>
              <span className="text-sm font-medium text-white">{item.value || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display text-2xl font-bold mb-1">Data & Privacy</h2>
        <p className="text-ink-400 text-sm mb-5">Manage your data and privacy settings</p>
        <div className="space-y-3">
          <button onClick={handleExport} className="btn btn-ghost border-white/10 w-full justify-start text-sm gap-3">
            <Link2 className="w-4 h-4" />
            Export account data (JSON)
          </button>
          <button onClick={logout} className="btn btn-ghost border-white/10 w-full justify-start text-sm gap-3">
            <Shield className="w-4 h-4" />
            Sign out of all sessions
          </button>
        </div>
      </div>

      <div className="card p-6 border-red-500/20 bg-red-500/5">
        <div className="flex items-start gap-3 mb-5">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-display text-2xl font-bold text-red-400 mb-1">Danger Zone</h2>
            <p className="text-ink-400 text-sm">These actions are permanent and cannot be undone</p>
          </div>
        </div>

        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger text-sm">
            <Trash2 className="w-4 h-4" />
            Delete my account
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-300 mb-3">
                This will permanently delete your account, all your workspaces (if you're the only member), and all associated data. <strong>This cannot be undone.</strong>
              </p>
              <p className="text-sm text-ink-300 mb-3">
                Type <span className="font-mono font-bold text-red-300">delete my account</span> to confirm:
              </p>
              <input
                className="input border-red-500/30 focus:border-red-500 mb-3"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                placeholder="delete my account"
              />
              <div className="flex gap-3">
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }} className="btn btn-ghost flex-1">
                  Cancel
                </button>
                <button
                  disabled={deleteInput !== 'delete my account' || loading}
                  className="btn btn-danger flex-1 disabled:opacity-40"
                  onClick={() => alert('Account deletion requires backend implementation — coming soon.')}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
