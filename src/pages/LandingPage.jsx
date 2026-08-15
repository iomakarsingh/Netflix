import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LandingPage.css';

const NETFLIX_LOGO = 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg';
const HERO_BG = 'https://assets.nflxext.com/ffe/siteui/vlv3/00103100-5b45-4d4f-af32-342649f5bda5/01/IN-en-20240129-popsignuptwoweeks-perspective_alpha_website_large.jpg';

const FAQ_ITEMS = [
  {
    q: 'What is Netflix?',
    a: 'Netflix is a streaming service that offers a wide variety of award-winning TV shows, movies, anime, documentaries, and more on thousands of internet-connected devices. You can watch as much as you want, whenever you want – all for one low monthly price.',
  },
  {
    q: 'How much does Netflix cost?',
    a: 'Watch Netflix on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one fixed monthly fee. Plans range from ₹149 to ₹649 a month. No extra costs, no contracts.',
  },
  {
    q: 'Where can I watch?',
    a: 'Watch anywhere, anytime. Sign in with your Netflix account to watch instantly on the web at netflix.com from your personal computer or on any internet-connected device that offers the Netflix app, including smart TVs, smartphones, tablets, streaming media players and game consoles.',
  },
  {
    q: 'How do I cancel?',
    a: 'Netflix is flexible. There are no pesky contracts and no commitments. You can easily cancel your account online in two clicks. There are no cancellation fees – start or stop your account anytime.',
  },
  {
    q: 'What can I watch on Netflix?',
    a: "Netflix has an extensive library of feature films, documentaries, TV shows, anime, award-winning Netflix originals, and more. Watch as much as you want, anytime you want.",
  },
  {
    q: 'Is Netflix good for kids?',
    a: "The Netflix Kids experience is included in your membership to give parents control while kids enjoy family-friendly TV shows and movies in their own space. Kids profiles come with PIN-protected parental controls that let you restrict the maturity rating of content kids can watch and block specific titles you don't want kids to see.",
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button
        className="faq-question"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <svg
          className={`faq-icon ${open ? 'faq-icon-open' : ''}`}
          width="24" height="24" viewBox="0 0 24 24" fill="currentColor"
        >
          <path d="M19 13H5v-2h14v2z"/>
          {!open && <path d="M12 5v14" stroke="currentColor" strokeWidth="2"/>}
        </svg>
      </button>
      {open && (
        <div className="faq-answer">
          <p>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/browse');
  }, [user, navigate]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleGetStarted = (e) => {
    e.preventDefault();
    if (!email) {
      setEmailError('Email is required.');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');
    navigate('/login', { state: { email } });
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <img src={NETFLIX_LOGO} alt="Netflix" className="landing-logo" />
        <div className="landing-header-right">
          <button className="landing-lang-btn" aria-label="Language selector">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            English
            <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            </svg>
          </button>
          <button
            className="landing-signin-btn"
            onClick={() => navigate('/login')}
            id="landing-signin-btn"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="landing-hero"
        style={{ backgroundImage: `url(${HERO_BG})` }}
      >
        <div className="landing-hero-overlay"/>
        <div className="landing-hero-content">
          <h1 className="landing-hero-title">Unlimited movies, TV shows, and more</h1>
          <p className="landing-hero-sub">Starts at ₹149. Cancel anytime.</p>
          <p className="landing-hero-cta-text">
            Ready to watch? Enter your email to create or restart your membership.
          </p>
          <form className="landing-email-form" onSubmit={handleGetStarted} noValidate>
            <div className="landing-email-wrap">
              <input
                type="email"
                className={`landing-email-input ${emailError ? 'input-error' : ''}`}
                placeholder="Email address"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                id="landing-email-input"
                aria-label="Email address"
                aria-describedby={emailError ? 'email-error' : undefined}
              />
              <label className="landing-email-label" htmlFor="landing-email-input">
                Email address
              </label>
              {emailError && (
                <p className="landing-email-error" id="email-error" role="alert">
                  {emailError}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="btn landing-get-started-btn"
              id="landing-get-started-btn"
            >
              Get Started
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </button>
          </form>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        {/* Feature 1 */}
        <div className="feature-section">
          <div className="feature-content">
            <h2 className="feature-title">Enjoy on your TV</h2>
            <p className="feature-desc">
              Watch on Smart TVs, PlayStation, Xbox, Chromecast, Apple TV, Blu-ray players, and more.
            </p>
          </div>
          <div className="feature-media">
            <img
              src="https://assets.nflxext.com/ffe/siteui/acquisition/ourStory/fuji/desktop/tv.png"
              alt="Netflix on TV"
              className="feature-img"
            />
            <div className="feature-tv-anim">
              <video autoPlay playsInline muted loop className="feature-tv-video">
                <source src="https://assets.nflxext.com/ffe/siteui/acquisition/ourStory/fuji/desktop/video-tv-0819.m4v" type="video/mp4"/>
              </video>
            </div>
          </div>
        </div>

        <div className="feature-divider"/>

        {/* Feature 2 */}
        <div className="feature-section feature-section-reverse">
          <div className="feature-content">
            <h2 className="feature-title">Download your shows to watch offline</h2>
            <p className="feature-desc">
              Save your favourites easily and always have something to watch.
            </p>
          </div>
          <div className="feature-media">
            <img
              src="https://assets.nflxext.com/ffe/siteui/acquisition/ourStory/fuji/desktop/mobile-0819.jpg"
              alt="Netflix mobile downloads"
              className="feature-img"
            />
            <div className="feature-download-badge">
              <img
                src="https://assets.nflxext.com/ffe/siteui/acquisition/ourStory/fuji/desktop/boxshot.png"
                alt=""
                className="feature-download-cover"
              />
              <div className="feature-download-text">
                <p className="feature-download-title">Stranger Things</p>
                <p className="feature-download-sub">Downloading...</p>
              </div>
              <div className="feature-download-anim">
                <svg viewBox="0 0 50 50" width="40" height="40">
                  <circle cx="25" cy="25" r="20" fill="none" stroke="#0071eb" strokeWidth="4"
                    strokeDasharray="100" strokeDashoffset="20" strokeLinecap="round">
                    <animateTransform attributeName="transform" type="rotate"
                      from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
                  </circle>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="feature-divider"/>

        {/* Feature 3 */}
        <div className="feature-section">
          <div className="feature-content">
            <h2 className="feature-title">Watch everywhere</h2>
            <p className="feature-desc">
              Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV.
            </p>
          </div>
          <div className="feature-media">
            <img
              src="https://assets.nflxext.com/ffe/siteui/acquisition/ourStory/fuji/desktop/device-pile-in.png"
              alt="Netflix on all devices"
              className="feature-img"
            />
            <div className="feature-devices-anim">
              <video autoPlay playsInline muted loop className="feature-devices-video">
                <source src="https://assets.nflxext.com/ffe/siteui/acquisition/ourStory/fuji/desktop/video-devices-in.m4v" type="video/mp4"/>
              </video>
            </div>
          </div>
        </div>

        <div className="feature-divider"/>

        {/* Feature 4 */}
        <div className="feature-section feature-section-reverse">
          <div className="feature-content">
            <h2 className="feature-title">Create profiles for kids</h2>
            <p className="feature-desc">
              Send kids on adventures with their favourite characters in a space made just for them — free with your membership.
            </p>
          </div>
          <div className="feature-media">
            <img
              src="https://occ-0-8407-90.1.nflxso.net/dnm/api/v6/19OhWN2dO19C9txTON9tvTFtefw/AAAABVMGxdBDNX1JNmTIK_HHhiGBGHR5r-LtcOwUMmgThSQ7tcUkdVw9KfAXKd2SjVMelPbmQPgH4LdORJP3Vs7bLXbrgGO2h0.png?r=54d"
              alt="Netflix Kids profiles"
              className="feature-img"
            />
          </div>
        </div>

        <div className="feature-divider"/>
      </section>

      {/* FAQ */}
      <section className="landing-faq">
        <h2 className="landing-faq-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem key={i} {...item}/>
          ))}
        </div>
        <div className="landing-faq-cta">
          <p>Ready to watch? Enter your email to create or restart your membership.</p>
          <form className="landing-email-form" onSubmit={handleGetStarted} noValidate>
            <div className="landing-email-wrap">
              <input
                type="email"
                className="landing-email-input"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                aria-label="Email address for sign up"
                id="landing-faq-email"
              />
              <label className="landing-email-label" htmlFor="landing-faq-email">
                Email address
              </label>
            </div>
            <button type="submit" className="btn landing-get-started-btn" id="landing-faq-cta-btn">
              Get Started
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p className="footer-contact">
          Questions? <a href="tel:000800 919 1694" className="footer-link">Call 000800 919 1694</a>
        </p>
        <div className="footer-links-grid">
          {[
            'FAQ', 'Help Center', 'Account', 'Media Centre', 'Investor Relations',
            'Jobs', 'Redeem Gift Cards', 'Buy Gift Cards', 'Ways to Watch',
            'Terms of Use', 'Privacy', 'Cookie Preferences', 'Corporate Information',
            'Contact Us', 'Speed Test', 'Legal Notices', 'Netflix Originals',
          ].map(link => (
            <a key={link} href="#" className="footer-link footer-link-item">{link}</a>
          ))}
        </div>
        <div className="footer-bottom">
          <button className="landing-lang-btn footer-lang-btn" aria-label="Language selector">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            English
          </button>
          <p className="footer-copyright">Netflix India</p>
        </div>
      </footer>
    </div>
  );
}
