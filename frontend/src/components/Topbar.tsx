'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Upload, X, Loader2 } from 'lucide-react';
import { useState, useRef, FormEvent } from 'react';
import { api, API_URL } from '@/lib/api';

export default function Topbar() {
  const { user, logout, updateUser } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const initials = user?.name?.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase() || '?';
  const profilePicUrl = user?.profilePic ? `${API_URL}${user.profilePic}` : null;

  return (
    <>
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-20 bg-ink-950/80">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center font-bold text-white text-sm">T</div>
            <span className="font-display text-xl">TaskFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            {user && (
              <button 
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-2 text-sm hover:bg-white/5 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
                title="Edit Profile"
              >
                {profilePicUrl ? (
                  <img src={profilePicUrl} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white"
                    style={{ background: user.avatarColor || '#6366f1' }}
                  >
                    {initials}
                  </div>
                )}
                <span className="text-ink-200 hidden sm:inline">{user.name}</span>
              </button>
            )}
            <button onClick={logout} className="btn btn-ghost !py-1.5 !px-2.5" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {showProfile && user && (
        <ProfileModal 
          onClose={() => setShowProfile(false)} 
          initials={initials} 
          user={user} 
          updateUser={updateUser} 
        />
      )}
    </>
  );
}

function ProfileModal({ onClose, initials, user, updateUser }: any) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErr('');

    try {
      const formData = new FormData();
      formData.append('profilePic', file);
      const res = await api.uploadProfilePic(formData);
      updateUser({ profilePic: res.profilePic });
      onClose();
    } catch (error: any) {
      setErr(error.message || 'Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  const profilePicUrl = user?.profilePic ? `${API_URL}${user.profilePic}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="card p-6 w-full max-w-sm animate-slide-up text-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl">Profile Settings</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="flex flex-col items-center justify-center gap-4 mb-6">
          {profilePicUrl ? (
            <img src={profilePicUrl} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-ink-800" />
          ) : (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-medium text-white border-4 border-ink-800"
              style={{ background: user.avatarColor || '#6366f1' }}
            >
              {initials}
            </div>
          )}
          
          <p className="text-ink-300 font-medium text-lg">{user.name}</p>
          <p className="text-ink-400 text-sm">{user.email}</p>
        </div>

        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInput} 
          onChange={handleFileChange} 
        />

        {err && <div className="text-sm text-red-400 mt-2 mb-4 bg-red-400/10 p-2 rounded">{err}</div>}

        <button 
          className="btn btn-primary w-full flex items-center justify-center gap-2"
          onClick={() => fileInput.current?.click()}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {loading ? 'Uploading...' : 'Change Profile Picture'}
        </button>
      </div>
    </div>
  );
}
