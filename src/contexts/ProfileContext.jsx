import React, { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext(null);

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
};

const DEFAULT_PROFILES = [
  {
    id: '1',
    name: 'User',
    avatar: null,
    color: '#e50914',
    isKids: false,
    maturityLevel: 'all',
    myList: [],
    language: 'en',
  },
  {
    id: '2',
    name: 'Kids',
    avatar: null,
    color: '#0080ff',
    isKids: true,
    maturityLevel: 'kids',
    myList: [],
    language: 'en',
  },
];

const PROFILE_AVATARS = [
  'https://occ-0-8407-90.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABfNXUMpgczPOQFTth9jlBagYdHCc21hJjdGQGJoBHBvWcMT7V2RVLkBm7-pVWJIUwfH5MoKNJpYEYoqeqhM1lS4D.png?r=b6e',
  'https://occ-0-8407-90.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABWMr6ZI94j5xP4VJHu7qSpO0Otr36hqb1DIqDcM8VpDjBGNcA9RFKQO2OIm_WE9hAhxY7qmCy8uqR76L2E_DcGU.png?r=b72',
  'https://occ-0-8407-90.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABbmes8w_RTdWiSWN9tLMBPjYAbcE8zEioA3BUt3VT6KQPF0OSGWCG5f9Xm1l_R9Pz8sYFPF8K1gHIHK0O5G1bOYLJk.png?r=e6c',
  'https://occ-0-8407-90.1.nflxso.net/dnm/api/v6/K6hjPJd6cR6FpVELC5Pd6ovHRSk/AAAABbRxm6PV2q6WQPJF8y3JApFuGdGHLBRfYJleSbH8PipbGR4OyERZECKxGMdWzYVnkujlZ7MlR5R5IG_Nc_K21Q.png?r=e14',
];

export const ProfileProvider = ({ children }) => {
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('netflix-profiles');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILES;
  });

  const [activeProfile, setActiveProfile] = useState(() => {
    const saved = localStorage.getItem('netflix-profile');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('netflix-profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    if (activeProfile) {
      localStorage.setItem('netflix-profile', JSON.stringify(activeProfile));
    } else {
      localStorage.removeItem('netflix-profile');
    }
  }, [activeProfile]);

  const selectProfile = (profile) => {
    setActiveProfile(profile);
  };

  const clearProfile = () => {
    setActiveProfile(null);
    localStorage.removeItem('netflix-profile');
  };

  const addToMyList = (item) => {
    if (!activeProfile) return;
    setProfiles(prev => prev.map(p => {
      if (p.id !== activeProfile.id) return p;
      const alreadyIn = p.myList.some(m => m.id === item.id);
      if (alreadyIn) return p;
      return { ...p, myList: [...p.myList, item] };
    }));
    setActiveProfile(prev => {
      const alreadyIn = prev.myList.some(m => m.id === item.id);
      if (alreadyIn) return prev;
      return { ...prev, myList: [...prev.myList, item] };
    });
  };

  const removeFromMyList = (itemId) => {
    if (!activeProfile) return;
    setProfiles(prev => prev.map(p => {
      if (p.id !== activeProfile.id) return p;
      return { ...p, myList: p.myList.filter(m => m.id !== itemId) };
    }));
    setActiveProfile(prev => ({
      ...prev,
      myList: prev.myList.filter(m => m.id !== itemId),
    }));
  };

  const isInMyList = (itemId) => {
    return activeProfile?.myList?.some(m => m.id === itemId) ?? false;
  };

  const addProfile = (profileData) => {
    const newProfile = {
      id: Date.now().toString(),
      myList: [],
      ...profileData,
    };
    setProfiles(prev => [...prev, newProfile]);
  };

  const updateProfile = (id, updates) => {
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    if (activeProfile?.id === id) {
      setActiveProfile(prev => ({ ...prev, ...updates }));
    }
  };

  const deleteProfile = (id) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (activeProfile?.id === id) clearProfile();
  };

  return (
    <ProfileContext.Provider value={{
      profiles,
      activeProfile,
      selectProfile,
      clearProfile,
      addToMyList,
      removeFromMyList,
      isInMyList,
      addProfile,
      updateProfile,
      deleteProfile,
      PROFILE_AVATARS,
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;
