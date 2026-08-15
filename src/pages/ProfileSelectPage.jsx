import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../contexts/ProfileContext';
import './ProfileSelectPage.css';

const NETFLIX_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg';

const PROFILE_COLORS = [
  '#e50914', '#0071eb', '#e5b012', '#2db836', '#8a2be2',
  '#ff6b35', '#00bcd4', '#ff4081', '#795548', '#607d8b',
];

const AVATAR_ICONS = [
  { emoji: '🎬', label: 'Movie Fan' },
  { emoji: '🦁', label: 'Lion' },
  { emoji: '🌙', label: 'Moon' },
  { emoji: '🎮', label: 'Gamer' },
  { emoji: '🌸', label: 'Flower' },
  { emoji: '⚡', label: 'Lightning' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🌊', label: 'Wave' },
];

function ProfileAvatar({ profile, size = 'lg' }) {
  return (
    <div
      className={`profile-avatar profile-avatar-${size}`}
      style={{ background: profile.color || '#e50914' }}
    >
      {profile.avatar ? (
        <img src={profile.avatar} alt={profile.name} />
      ) : (
        <span className="profile-avatar-letter">
          {profile.name?.[0]?.toUpperCase() || 'U'}
        </span>
      )}
      {profile.isKids && <div className="kids-badge">KIDS</div>}
    </div>
  );
}

export default function ProfileSelectPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileColor, setNewProfileColor] = useState('#0071eb');
  const [newIsKids, setNewIsKids] = useState(false);
  const { profiles, selectProfile, addProfile, deleteProfile } = useProfile();
  const navigate = useNavigate();

  const handleSelect = (profile) => {
    if (isEditing) return;
    selectProfile(profile);
    navigate('/browse');
  };

  const handleAddProfile = () => {
    if (!newProfileName.trim()) return;
    addProfile({
      name: newProfileName.trim(),
      color: newProfileColor,
      isKids: newIsKids,
      maturityLevel: newIsKids ? 'kids' : 'all',
      myList: [],
    });
    setNewProfileName('');
    setNewProfileColor('#0071eb');
    setNewIsKids(false);
    setAddingNew(false);
  };

  return (
    <div className="profile-select-page">
      {/* Header Logo */}
      <header className="profile-select-header">
        <img src={NETFLIX_LOGO} alt="Netflix" height="31" />
      </header>

      <main className="profile-select-main">
        <h1 className="profile-select-title">Who's watching?</h1>

        <div className="profiles-grid">
          {profiles.map(profile => (
            <div
              key={profile.id}
              className={`profile-item ${isEditing ? 'profile-item-editing' : ''}`}
              onClick={() => handleSelect(profile)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleSelect(profile)}
              aria-label={`Select profile: ${profile.name}`}
            >
              <div className="profile-avatar-wrap">
                <ProfileAvatar profile={profile} size="lg" />
                {isEditing && (
                  <div className="profile-edit-overlay">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </div>
                )}
              </div>
              <p className="profile-name">{profile.name}</p>
              {isEditing && profiles.length > 1 && (
                <button
                  className="profile-delete-btn"
                  onClick={e => { e.stopPropagation(); deleteProfile(profile.id); }}
                  aria-label={`Delete ${profile.name}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {/* Add Profile Button */}
          {profiles.length < 5 && !isEditing && (
            <div
              className="profile-item profile-add-item"
              onClick={() => setAddingNew(true)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setAddingNew(true)}
              aria-label="Add profile"
            >
              <div className="profile-add-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </div>
              <p className="profile-name">Add Profile</p>
            </div>
          )}
        </div>

        {/* Add Profile Form */}
        {addingNew && (
          <div className="add-profile-modal">
            <div className="add-profile-card">
              <h2 className="add-profile-title">Add Profile</h2>
              <p className="add-profile-sub">Add a profile for another person watching Netflix.</p>

              <div className="add-profile-preview">
                <div
                  className="profile-avatar profile-avatar-lg"
                  style={{ background: newProfileColor }}
                >
                  <span className="profile-avatar-letter">
                    {newProfileName?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
              </div>

              <input
                type="text"
                className="add-profile-input"
                placeholder="Name"
                value={newProfileName}
                onChange={e => setNewProfileName(e.target.value)}
                maxLength={50}
                autoFocus
                id="add-profile-name-input"
              />

              <div className="color-picker">
                <p className="color-picker-label">Choose color</p>
                <div className="color-picker-swatches">
                  {PROFILE_COLORS.map(color => (
                    <button
                      key={color}
                      className={`color-swatch ${newProfileColor === color ? 'swatch-active' : ''}`}
                      style={{ background: color }}
                      onClick={() => setNewProfileColor(color)}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>

              <label className="kids-toggle-label">
                <input
                  type="checkbox"
                  checked={newIsKids}
                  onChange={e => setNewIsKids(e.target.checked)}
                  className="kids-checkbox"
                />
                <span>Kid?</span>
              </label>

              <div className="add-profile-actions">
                <button
                  className="btn btn-red add-profile-save"
                  onClick={handleAddProfile}
                  disabled={!newProfileName.trim()}
                  id="add-profile-save-btn"
                >
                  Continue
                </button>
                <button
                  className="add-profile-cancel"
                  onClick={() => { setAddingNew(false); setNewProfileName(''); }}
                  id="add-profile-cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manage Button */}
        <button
          className="manage-profiles-btn"
          onClick={() => setIsEditing(e => !e)}
          id="manage-profiles-btn"
        >
          {isEditing ? 'Done' : 'Manage Profiles'}
        </button>
      </main>
    </div>
  );
}
