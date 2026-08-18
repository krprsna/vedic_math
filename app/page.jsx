'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileLandingPage() {
  const router = useRouter();
  
  // State for profiles
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🌟');

  const avatarOptions = ['🌟', '🚀', '🦄', '🦁', '🦉', '🎨', '⚽', '👑'];

  // Fetch profiles on load
  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      // In production, fetches from your DB (/api/profiles)
      // Falling back to LocalStorage if DB is empty/initial setup
      const localData = localStorage.getItem('vedic_profiles');
      if (localData) {
        setProfiles(JSON.parse(localData));
      } else {
        const defaultProfiles = [
          { id: 1, name: 'Ananya', avatar: '🌟', streak: 5, accuracy: '88%' },
          { id: 2, name: 'Diya', avatar: '🚀', streak: 3, accuracy: '74%' }
        ];
        setProfiles(defaultProfiles);
        localStorage.setItem('vedic_profiles', JSON.stringify(defaultProfiles));
      }
    } catch (err) {
      console.error('Failed to fetch profiles', err);
    } finally {
      setLoading(false);
    }
  };

  // Select profile and navigate to Practice Page
  const handleSelectProfile = (profile) => {
    localStorage.setItem('active_profile_id', profile.id);
    localStorage.setItem('active_profile_name', profile.name);
    router.push(`/practice?profileId=${profile.id}`);
  };

  // Create a new learning profile
  const handleCreateProfile = (e) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    const newProfile = {
      id: Date.now(),
      name: newProfileName.trim(),
      avatar: selectedAvatar,
      streak: 1,
      accuracy: '100%'
    };

    const updated = [...profiles, newProfile];
    setProfiles(updated);
    localStorage.setItem('vedic_profiles', JSON.stringify(updated));

    setNewProfileName('');
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4">
      {/* App Branding */}
      <div className="text-center mb-10">
        <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          Vedic Mind Mastery
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mt-3 tracking-tight">
          Who is learning today?
        </h1>
        <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
          Select your profile to continue your step-by-step Vedic Math journey and eliminate silly mistakes.
        </p>
      </div>

      {/* Profiles Grid */}
      {loading ? (
        <div className="text-slate-400 text-sm animate-pulse">Loading profiles...</div>
      ) : (
        <div className="flex flex-wrap justify-center items-center gap-6 max-w-4xl w-full">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              onClick={() => handleSelectProfile(profile)}
              className="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500 rounded-2xl p-6 w-48 flex flex-col items-center cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-indigo-500/10"
            >
              {/* Avatar Icon */}
              <div className="w-20 h-20 rounded-full bg-slate-700/50 group-hover:bg-indigo-600/20 border-2 border-slate-600 group-hover:border-indigo-500 flex items-center justify-center text-4xl mb-4 transition">
                {profile.avatar}
              </div>

              {/* Profile Name */}
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">
                {profile.name}
              </h3>

              {/* Quick Stats Badge */}
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <span className="text-amber-400 font-semibold">🔥 {profile.streak}d</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{profile.accuracy}</span>
              </div>
            </div>
          ))}

          {/* Add Profile Card */}
          <button
            onClick={() => setShowAddModal(true)}
            className="border-2 border-dashed border-slate-700 hover:border-slate-500 bg-slate-800/30 hover:bg-slate-800/50 rounded-2xl p-6 w-48 h-[218px] flex flex-col items-center justify-center text-slate-400 hover:text-white transition"
          >
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-2xl mb-2">
              +
            </div>
            <span className="text-sm font-semibold">Add Profile</span>
          </button>
        </div>
      )}

      {/* CREATE PROFILE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 max-w-sm w-full rounded-2xl p-6 border border-slate-700 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Create New Profile</h3>
            
            <form onSubmit={handleCreateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Learner's Name
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Choose Avatar
                </label>
                <div className="flex flex-wrap gap-2">
                  {avatarOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedAvatar(emoji)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition ${
                        selectedAvatar === emoji
                          ? 'bg-indigo-600 border-2 border-white'
                          : 'bg-slate-900 border border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
