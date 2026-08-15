import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import './Header.css';

const NETFLIX_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg';

const NAV_LINKS = [
  { label: 'Home', path: '/browse' },
  { label: 'TV Shows', path: '/browse/tv' },
  { label: 'Movies', path: '/browse/movies' },
  { label: 'New & Popular', path: '/browse/new' },
  { label: 'My List', path: '/browse/my-list' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const { activeProfile, profiles, selectProfile, clearProfile } = useProfile();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSignOut = () => {
    clearProfile();
    signOut();
    navigate('/');
  };

  return (
    <header className={`netflix-header ${scrolled ? 'header-scrolled' : ''}`} role="banner">
      <div className="header-inner">
        {/* Logo */}
        <Link to="/browse" className="header-logo" aria-label="Netflix Home">
          <img src={NETFLIX_LOGO} alt="Netflix" width="92" height="31" />
        </Link>

        {/* Desktop Nav */}
        <nav className="header-nav" aria-label="Primary Navigation">
          <ul className="header-nav-list">
            {NAV_LINKS.map(link => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`header-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Browse Dropdown */}
        <div className="mobile-nav-btn" onClick={() => setMobileMenuOpen(o => !o)}>
          <span>Browse</span>
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
            <path d="M1 1L5 5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {mobileMenuOpen && (
            <div className="mobile-nav-menu">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="mobile-nav-item"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="header-right">
          {/* Search */}
          <div className={`header-search ${searchOpen ? 'search-open' : ''}`}>
            <button
              className="search-icon-btn"
              onClick={() => setSearchOpen(o => !o)}
              aria-label="Toggle search"
              id="header-search-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            {searchOpen && (
              <form onSubmit={handleSearch} className="search-form">
                <input
                  ref={searchRef}
                  type="search"
                  className="search-input"
                  placeholder="Titles, people, genres"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  aria-label="Search Netflix"
                  id="header-search-input"
                />
              </form>
            )}
          </div>

          {/* Notifications Bell */}
          <button className="header-icon-btn" aria-label="Notifications" id="notifications-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
          </button>

          {/* Profile Menu */}
          <div className="profile-menu-wrap" ref={profileRef}>
            <button
              className="profile-menu-trigger"
              onClick={() => setProfileMenuOpen(o => !o)}
              aria-haspopup="true"
              aria-expanded={profileMenuOpen}
              id="profile-menu-btn"
            >
              <div
                className="profile-avatar-sm"
                style={{ background: activeProfile?.color || '#e50914' }}
              >
                {activeProfile?.avatar ? (
                  <img src={activeProfile.avatar} alt={activeProfile.name} />
                ) : (
                  <span>{activeProfile?.name?.[0]?.toUpperCase() || 'U'}</span>
                )}
              </div>
              <svg
                className={`caret ${profileMenuOpen ? 'caret-up' : ''}`}
                width="10" height="6" viewBox="0 0 10 6" fill="none"
              >
                <path d="M1 1L5 5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {profileMenuOpen && (
              <div className="profile-dropdown" role="menu" aria-label="Profile menu">
                <div className="profile-dropdown-profiles">
                  {profiles.map(profile => (
                    <button
                      key={profile.id}
                      className="profile-dropdown-item"
                      onClick={() => {
                        selectProfile(profile);
                        setProfileMenuOpen(false);
                      }}
                      role="menuitem"
                    >
                      <div
                        className="profile-avatar-sm"
                        style={{ background: profile.color }}
                      >
                        {profile.avatar ? (
                          <img src={profile.avatar} alt={profile.name} />
                        ) : (
                          <span>{profile.name?.[0]?.toUpperCase()}</span>
                        )}
                      </div>
                      <span>{profile.name}</span>
                    </button>
                  ))}
                </div>
                <div className="profile-dropdown-divider"/>
                <div className="profile-dropdown-menu">
                  <Link to="/profile" className="profile-dropdown-link" role="menuitem" onClick={() => setProfileMenuOpen(false)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    Manage Profiles
                  </Link>
                  <Link to="/account" className="profile-dropdown-link" role="menuitem" onClick={() => setProfileMenuOpen(false)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    Account
                  </Link>
                  <Link to="/help" className="profile-dropdown-link" role="menuitem" onClick={() => setProfileMenuOpen(false)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
                    Help Center
                  </Link>
                  <div className="profile-dropdown-divider"/>
                  <button className="profile-dropdown-signout" role="menuitem" onClick={handleSignOut}>
                    Sign out of Netflix
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
