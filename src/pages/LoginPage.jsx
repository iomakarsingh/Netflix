import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const NETFLIX_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg';
const BG_URL = 'https://assets.nflxext.com/ffe/siteui/vlv3/00103100-5b45-4d4f-af32-342649f5bda5/01/IN-en-20240129-popsignuptwoweeks-perspective_alpha_website_large.jpg';

export default function LoginPage() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, user, error: authError, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) navigate('/profile-select');
  }, [user, navigate]);

  useEffect(() => {
    // Pre-fill email from landing page
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  useEffect(() => {
    if (authError) setFormError(authError);
  }, [authError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!email.trim()) {
      setFormError('Please enter a valid email address or phone number.');
      return;
    }
    if (!password) {
      setFormError('Your password must contain between 4 and 60 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch {
      // Error set by context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background */}
      <div
        className="login-bg"
        style={{ backgroundImage: `url(${BG_URL})` }}
      />
      <div className="login-bg-overlay"/>

      {/* Header */}
      <header className="login-header">
        <img src={NETFLIX_LOGO} alt="Netflix" className="login-logo" />
      </header>

      {/* Form Card */}
      <main className="login-main">
        <div className="login-card">
          <h1 className="login-title">
            {mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </h1>

          {formError && (
            <div className="login-error-box" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              {formError}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="login-field">
              <input
                type="email"
                className={`login-input ${email ? 'has-value' : ''}`}
                id="login-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <label className="login-label" htmlFor="login-email">Email or phone number</label>
            </div>

            {/* Password Field */}
            <div className="login-field">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`login-input ${password ? 'has-value' : ''}`}
                id="login-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
              />
              <label className="login-label" htmlFor="login-password">Password</label>
              <button
                type="button"
                className="password-show-btn"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? (
                <span className="login-loading">
                  <span className="login-spinner"/>
                </span>
              ) : (
                mode === 'signin' ? 'Sign In' : 'Sign Up'
              )}
            </button>

            {/* Options Row */}
            <div className="login-options">
              {mode === 'signin' && (
                <label className="remember-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="remember-checkbox"
                  />
                  <span className="remember-text">Remember me</span>
                </label>
              )}
              <a href="#" className="login-help-link">Need help?</a>
            </div>
          </form>

          {/* OR Use Code */}
          {mode === 'signin' && (
            <div className="login-or">
              <div className="login-or-line"/>
              <span className="login-or-text">OR</span>
              <div className="login-or-line"/>
            </div>
          )}

          {mode === 'signin' && (
            <button className="login-code-btn" id="login-code-btn">
              Use a sign-in code
            </button>
          )}

          {/* Switch Mode */}
          <div className="login-switch">
            {mode === 'signin' ? (
              <>
                <span className="login-switch-text">New to Netflix?</span>
                {' '}
                <button
                  className="login-switch-btn"
                  onClick={() => { setMode('signup'); setFormError(''); clearError(); }}
                  id="login-switch-to-signup"
                >
                  Sign up now.
                </button>
              </>
            ) : (
              <>
                <span className="login-switch-text">Already have an account?</span>
                {' '}
                <button
                  className="login-switch-btn"
                  onClick={() => { setMode('signin'); setFormError(''); clearError(); }}
                  id="login-switch-to-signin"
                >
                  Sign in now.
                </button>
              </>
            )}
          </div>

          {/* reCAPTCHA notice */}
          <p className="login-recaptcha">
            This page is protected by Google reCAPTCHA to ensure you're not a bot.{' '}
            <a href="#" className="login-learn-more">Learn more.</a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="login-footer">
        <div className="login-footer-links">
          {['FAQ', 'Help Center', 'Terms of Use', 'Privacy', 'Cookie Preferences', 'Corporate Information'].map(l => (
            <a key={l} href="#" className="login-footer-link">{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
