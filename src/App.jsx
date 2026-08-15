import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProfileProvider, useProfile } from './contexts/ProfileContext';
import { ToastProvider } from './contexts/ToastContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ProfileSelectPage from './pages/ProfileSelectPage';
import BrowsePage from './pages/BrowsePage';
import SearchPage from './pages/SearchPage';
import WatchPage from './pages/WatchPage';
import MyListPage from './pages/MyListPage';

import './index.css';

// ============================
// ROUTE GUARDS
// ============================

/** Redirect to / if not authenticated */
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

/** Redirect to profile-select if no profile chosen */
function RequireProfile({ children }) {
  const { user, loading } = useAuth();
  const { activeProfile } = useProfile();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  if (!activeProfile) return <Navigate to="/profile-select" replace />;
  return children;
}

/** Redirect authenticated users away from public pages */
function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/browse" replace />;
  return children;
}

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="netflix-spinner" />
    </div>
  );
}

// ============================
// APP ROUTES
// ============================

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Authenticated — profile select */}
      <Route
        path="/profile-select"
        element={
          <RequireAuth>
            <ProfileSelectPage />
          </RequireAuth>
        }
      />

      {/* Authenticated + profile required */}
      <Route
        path="/browse"
        element={
          <RequireProfile>
            <BrowsePage />
          </RequireProfile>
        }
      />
      <Route
        path="/browse/tv"
        element={
          <RequireProfile>
            <BrowsePage category="tv" />
          </RequireProfile>
        }
      />
      <Route
        path="/browse/movies"
        element={
          <RequireProfile>
            <BrowsePage category="movies" />
          </RequireProfile>
        }
      />
      <Route
        path="/browse/new"
        element={
          <RequireProfile>
            <BrowsePage category="new" />
          </RequireProfile>
        }
      />
      <Route
        path="/browse/my-list"
        element={
          <RequireProfile>
            <MyListPage />
          </RequireProfile>
        }
      />
      <Route
        path="/search"
        element={
          <RequireProfile>
            <SearchPage />
          </RequireProfile>
        }
      />
      <Route
        path="/watch/:type/:id"
        element={
          <RequireProfile>
            <WatchPage />
          </RequireProfile>
        }
      />
      <Route
        path="/title/:type/:id"
        element={
          <RequireProfile>
            <BrowsePage />
          </RequireProfile>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ============================
// ROOT APP
// ============================

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
