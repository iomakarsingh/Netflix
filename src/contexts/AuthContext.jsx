import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const DEMO_USER = {
  id: 'netflix-user-1',
  email: 'user@netflix.com',
  displayName: 'Netflix User',
  createdAt: new Date().toISOString(),
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('netflix-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('netflix-user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Demo: accept any email/password
      if (!email || !password) throw new Error('Please enter your email and password.');
      if (password.length < 4) throw new Error('Wrong password. Please try again or reset it.');

      const userData = { ...DEMO_USER, email };
      setUser(userData);
      localStorage.setItem('netflix-user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      if (!email || !password) throw new Error('Please enter your email and password.');
      if (password.length < 6) throw new Error('Your password must be at least 6 characters.');

      const userData = { ...DEMO_USER, email };
      setUser(userData);
      localStorage.setItem('netflix-user', JSON.stringify(userData));
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('netflix-user');
    localStorage.removeItem('netflix-profile');
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
