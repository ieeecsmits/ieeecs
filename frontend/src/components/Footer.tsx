import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Linkedin, Instagram, Twitter, Mail, MapPin, Phone,
  ArrowUpRight, ArrowRight, Send,
} from 'lucide-react';
import './Footer.css';

const SOCIALS = [
  { icon: Linkedin,  label: 'LinkedIn',  href: 'https://www.linkedin.com/' },
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/ieeecomputersocietymits/' },
  { icon: Twitter,   label: 'Twitter',   href: 'https://twitter.com/' },
];

const QUICK_LINKS = [
  { label: 'Home',           to: '/' },
  { label: 'About IEEE CS',  to: '/about' },
  { label: 'Events',         to: '/events' },
  { label: 'Office bearers', to: '/office-bearers' },
  { label: 'Membership',     to: '/membership' },
  { label: 'Gallery',        to: '/gallery' },
  { label: 'Contact',        to: '/contact' },
];

const PROGRAMS: [string, string][] = [
  ['Workshops',    '/events?type=workshop'],
  ['Hackathons',   '/events?type=hackathon'],
  ['Seminars',     '/events?type=seminar'],
  ['Webinars',     '/events?type=webinar'],
  ['Upcoming',     '/events?status=upcoming'],
  ['Past events',  '/events?status=completed'],
];

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const onSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="footer">
      {/* Wave separator */}
      <div className="footer__wave" aria-hidden="true">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z"
            fill="var(--bg-primary)"
          />
        </svg>
      </div>

      {/* Newsletter callout */}
      <div className="footer__cta">
        <div className="container footer__cta-inner">
          <div className="footer__cta-text">
            <span className="footer__cta-kicker">Stay in the loop</span>
            <h3 className="footer__cta-title">
              The chapter newsletter — <em>once a month, never spammy.</em>
            </h3>
            <p className="footer__cta-sub">
              Upcoming events, recaps, opportunities, and the occasional research highlight.
            </p>
          </div>
          <form className="footer__cta-form" onSubmit={onSubscribe}>
            <div className="footer__cta-field">
              <Mail size={15} className="footer__cta-icon" />
              <input
                type="email"
                placeholder="you@mits.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Email address"
              />
            </div>
            <button type="submit" className="btn btn-primary footer__cta-btn">
              {subscribed ? 'Subscribed' : 'Subscribe'}
              {subscribed ? null : <Send size={14} />}
            </button>
          </form>
        </div>
      </div>

      <div className="footer__body">
        <div className="container">
          <div className="footer__grid">
            {/* Brand */}
            <div className="footer__brand">
              <Link to="/" className="footer__brand-logo" aria-label="Home">
                <div className="footer__logo-mark">
                  <span>IEEE</span>
                  <span>CS</span>
                </div>
                <div>
                  <p className="footer__brand-name">Computer Society</p>
                  <p className="footer__brand-chapter">MITS Student Chapter</p>
                </div>
              </Link>
              <p className="footer__brand-desc">
                A community of computer-science students at MITS shipping projects,
                running events, and building the technical foundation for what comes next.
              </p>
              <div className="footer__socials">
                {SOCIALS.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="footer__social-btn"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="footer__col">
              <h4 className="footer__col-head">Explore</h4>
              <ul className="footer__col-list">
                {QUICK_LINKS.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to}>
                      <span>{label}</span>
                      <ArrowRight size={11} className="footer__col-arrow" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Programs */}
            <div className="footer__col">
              <h4 className="footer__col-head">Programs</h4>
              <ul className="footer__col-list">
                {PROGRAMS.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to}>
                      <span>{label}</span>
                      <ArrowRight size={11} className="footer__col-arrow" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="footer__col">
              <h4 className="footer__col-head">Reach us</h4>
              <div className="footer__contact-list">
                <a href="mailto:contact@ieee-cs.org" className="footer__contact-item">
                  <Mail size={14} />
                  <span>contact@ieee-cs.org</span>
                </a>
                <a href="tel:+919244524591" className="footer__contact-item">
                  <Phone size={14} />
                  <span>+91 92445 24591</span>
                </a>
                <div className="footer__contact-item footer__contact-item--addr">
                  <MapPin size={14} />
                  <span>CSE Department, MITS-DU<br />Gwalior, MP — 474005</span>
                </div>
              </div>

              <div className="footer__ext-row">
                <a href="https://www.ieee.org" target="_blank" rel="noreferrer" className="footer__ext-link">
                  IEEE.org <ArrowUpRight size={12} />
                </a>
                <a href="https://www.computer.org" target="_blank" rel="noreferrer" className="footer__ext-link">
                  Computer Society <ArrowUpRight size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p className="footer__copy">
            © {year} <strong>IEEE Computer Society</strong> — MITS Student Chapter. All rights reserved.
          </p>
          <p className="footer__credit">
            Built &amp; maintained by the IEEE CS web team
            <span className="footer__credit-sep">·</span>
            <a href="https://www.ieee.org" target="_blank" rel="noreferrer">ieee.org</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
