



import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  motion, useScroll, useTransform, useReducedMotion,
} from 'framer-motion';
import {
  ArrowRight, ArrowUpRight, Users, Calendar, Award, Globe,
  Cpu, Zap, BookOpen, MapPin, Sparkles, Rocket, Code2, Cloud, Brain,
  Layers, Shield, Database, GitBranch, Terminal, Wifi,
  Github, Linkedin, Instagram, Play,
} from 'lucide-react';
import { eventsAPI } from '../services/api';
import WaveBackground from '../components/WaveBackground';
import HighlightsCarousel, { Highlight } from '../components/HighlightsCarousel';
import Reveal from '../components/Reveal';
import Counter from '../components/Counter';
import Marquee from '../components/Marquee';
import { useMagnetic } from '../hooks/useMagnetic';
import './Home.css';
import { getCldImageUrl } from '@/components/Cloudinary';

interface Event {
  id: string;
  title: string;
  short_description: string;
  event_type: string;
  status: string;
  date: string;
  venue: string;
  is_featured: boolean;
  max_participants?: number | null;
  current_participants?: number | null;
}

const STATS: { icon: typeof Users; value: number; suffix: string; label: string }[] = [
  { icon: Users,    value: 500, suffix: '+', label: 'Active Members' },
  { icon: Calendar, value: 40,  suffix: '+', label: 'Events Hosted' },
  { icon: Award,    value: 15,  suffix: '+', label: 'Awards Won' },
  { icon: Globe,    value: 5,   suffix: '+', label: 'Years Active' },
];

const HERO_TICKER = [
  'Build the future',
  'Ship real projects',
  'Hackathons every term',
  'Research that matters',
  'Workshops every week',
  'Open-source culture',
  'Mentorship that scales',
];

const HERO_SOCIAL = [
  { Icon: Github,    href: 'https://github.com',    label: 'GitHub' },
  { Icon: Linkedin,  href: 'https://linkedin.com',  label: 'LinkedIn' },
  { Icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
];

const TECH_STRIP = [
  { Icon: Brain,     label: 'AI / ML' },
  { Icon: Cloud,     label: 'Cloud Native' },
  { Icon: Code2,     label: 'Full Stack' },
  { Icon: Shield,    label: 'Cybersecurity' },
  { Icon: Database,  label: 'Data Engineering' },
  { Icon: GitBranch, label: 'Open Source' },
  { Icon: Layers,    label: 'Web3' },
  { Icon: Terminal,  label: 'DevOps' },
  { Icon: Wifi,      label: 'IoT & Embedded' },
  { Icon: Rocket,    label: 'Hackathons' },
];

const HIGHLIGHTS: Highlight[] = [
  {
    id: 'h1',
    title: 'Frontend Battle 2026',
    subtitle: 'Two rounds, dozens of teams, one pixel-perfect winner.',
    image: getCldImageUrl("IMG_6649.HEIC_hnacuq.jpg"),
    tag: 'Hackathon',
    meta: 'Apr 2026 · 200+ participants',
    href: '/events',
  },
  {
    id: 'h2',
    title: 'Career Blueprint with Deloitte',
    subtitle: 'A frank look at building a career in the age of AI, an inspiring session by Deloitte MD Dr. Sandeep Sharma.',
    image: getCldImageUrl("IMG_6593.HEIC_ulc3fr.heic"),
    tag: 'Seminar',
    meta: 'Mar 2026 · SAC',
    href: '/events',
  },
  {
    id: 'h3',
    title: 'Programming Mastery Roadmap',
    subtitle: 'Learn programming under the guidance of the legendary Dr. E. Balagurusamy himself.',
    image: getCldImageUrl("IMG_5981.HEIC_cr1kim"),
    tag: 'Workshop',
    meta: 'Mar 2026 · Lab 301',
    href: '/events',
  },
  // {
  //   id: 'h4',
  //   title: 'AI & ML Trends — Tech Talk',
  //   subtitle: 'Industry researchers on what really moved the field this year.',
  //   image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&q=80',
  //   tag: 'Tech talk',
  //   meta: 'Jun 2026 · Seminar Hall',
  //   href: '/events',
  // },
  {
    id: 'h5',
    title: 'Chapter inauguration 2026',
    subtitle: 'The tenure begins — new team, new programs, same standards.',
    image: getCldImageUrl("IMG_8559.HEIC_undaur.heic"),
    tag: 'Chapter',
    meta: 'Apr 2026',
    href: '/about',
  },
  // {
  //   id: 'h6',
  //   title: 'Cybersecurity & ethical hacking',
  //   subtitle: 'Hands-on intro to offensive security from the red-team perspective.',
  //   image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&q=80',
  //   tag: 'Workshop',
  //   meta: 'Feb 2026',
  //   href: '/events',
  // },
];

const OFFERINGS = [
  { icon: Cpu,      title: 'Technical workshops',   desc: 'Hands-on sessions in AI, cloud, full-stack, and embedded systems — taught by peers and practitioners.' },
  { icon: Zap,      title: 'Hackathons & contests', desc: 'Twenty-four-hour sprints where teams ship real products. Prizes, mentors, and bragging rights included.' },
  { icon: BookOpen, title: 'Seminars & research',   desc: 'Talks from industry engineers, alumni in top labs, and student research showcases.' },
  { icon: Users,    title: 'Community & mentorship', desc: 'A tight-knit network of seniors, peers, and mentors who help you ship, interview, and grow.' },
];

const SAMPLE_EVENTS: Event[] = [
  { id: '1', title: 'Tech Talk: AI & ML Trends 2026', short_description: 'Industry experts on the latest in AI, from LLMs to computer vision.', event_type: 'seminar', status: 'upcoming', date: '2026-06-15', venue: 'Seminar Hall A', is_featured: true },
  { id: '2', title: 'Hackathon 2026: Code for Change', short_description: '24-hour hackathon. Build, compete, and showcase innovative solutions.', event_type: 'hackathon', status: 'upcoming', date: '2026-07-10', venue: 'CS Block', is_featured: true },
  { id: '3', title: 'React & Node.js Full-Stack Workshop', short_description: 'Hands-on workshop covering modern full-stack development from scratch.', event_type: 'workshop', status: 'completed', date: '2026-04-20', venue: 'Lab 301', is_featured: false },
];

export default function Home() {
  const [events, setEvents] = useState<Event[]>(SAMPLE_EVENTS);
  const heroRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    eventsAPI.getAll({ featured: 'true', limit: '3' })
      .then((res) => { if (res.data.events?.length) setEvents(res.data.events); })
      .catch(() => {});
  }, []);

  /* Pointer-tracked tilt on the hero card. */
  useEffect(() => {
    const card = cardRef.current;
    if (!card || reduced) return;
    const onMove = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`);
    };
    const onLeave = () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    };
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', onLeave);
    return () => {
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced]);

  /* Pointer spotlight overlay — soft gold radial that tracks the cursor. */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || reduced) return;
    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      hero.style.setProperty('--spot-x', `${x.toFixed(1)}%`);
      hero.style.setProperty('--spot-y', `${y.toFixed(1)}%`);
    };
    hero.addEventListener('pointermove', onMove);
    return () => hero.removeEventListener('pointermove', onMove);
  }, [reduced]);

  /* Scroll-linked parallax on hero glows. */
  const { scrollY } = useScroll();
  const glowY1 = useTransform(scrollY, [0, 800], [0, 120]);
  const glowY2 = useTransform(scrollY, [0, 800], [0, -90]);
  const glowY3 = useTransform(scrollY, [0, 800], [0, 60]);
  const heroFade = useTransform(scrollY, [0, 600], [1, 0.25]);
  const heroLift = useTransform(scrollY, [0, 600], [0, -60]);

  const nextEvent = useMemo(
    () => events.find((e) => e.status === 'upcoming') ?? events[0],
    [events]
  );

  return (
    <div className="home page-transition">

      {/* ══════════════ HERO ══════════════ */}
      <section className="hero" ref={heroRef}>
        <WaveBackground variant="hero" />
        <div className="hero__grid-texture" />
        <div className="hero__noise" aria-hidden="true" />
        <div className="hero__spotlight" aria-hidden="true" />
        <div className="hero__vignette" aria-hidden="true" />

        <motion.div className="hero__glow hero__glow--1" style={{ y: glowY1 }} />
        <motion.div className="hero__glow hero__glow--2" style={{ y: glowY2 }} />
        <motion.div className="hero__glow hero__glow--3" style={{ y: glowY3 }} />

        {/* IEEE-CS branded ring — rotating wordmark text on a circular path */}
        <div className="hero__ring" aria-hidden="true">
          <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet">
            <defs>
              {/* Path the wordmark rides on — circle traced counter-clockwise
                  so the text reads upright along the outside. */}
              <path
                id="hero-ring-path"
                d="M 300,300 m -240,0 a 240,240 0 1,1 480,0 a 240,240 0 1,1 -480,0"
              />
              <linearGradient id="hero-ring-fade" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%"   stopColor="rgba(245,197,24,0.95)" />
                <stop offset="60%"  stopColor="rgba(245,197,24,0.35)" />
                <stop offset="100%" stopColor="rgba(245,197,24,0)" />
              </linearGradient>
            </defs>

            {/* Thin solid outer ring — clean, no clock-face dashes */}
            <circle cx="300" cy="300" r="270" fill="none" stroke="rgba(245,197,24,0.18)" strokeWidth="1" />

            {/* Compass nodes at N / E / S / W — small gold ticks */}
            <g stroke="rgba(245,197,24,0.7)" strokeWidth="1.5" strokeLinecap="round">
              <line x1="300" y1="24"  x2="300" y2="40"  />
              <line x1="576" y1="300" x2="560" y2="300" />
              <line x1="300" y1="576" x2="300" y2="560" />
              <line x1="24"  y1="300" x2="40"  y2="300" />
            </g>

            {/* Rotating wordmark — IEEE Computer Society identity */}
            <text
              className="hero__ring-text"
              fill="url(#hero-ring-fade)"
              fontFamily="'DM Sans', sans-serif"
              fontSize="13"
              fontWeight="700"
              letterSpacing="6"
            >
              <textPath href="#hero-ring-path" startOffset="0">
                IEEE  ·  COMPUTER  SOCIETY  ·  MITS  STUDENT  CHAPTER  ·  TENURE  2025—26  ·  EST  2019  ·
              </textPath>
            </text>
          </svg>
        </div>

        {/* Vertical side rail — left edge */}
        <aside className="hero__rail" aria-label="Chapter info">
          <span className="hero__rail-text">EST · 2019 — CHAPTER #STB48051</span>
          <span className="hero__rail-divider" aria-hidden="true" />
          <div className="hero__rail-social">
            {HERO_SOCIAL.map(({ Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="hero__rail-icon">
                <Icon size={13} />
              </a>
            ))}
          </div>
        </aside>

        <motion.div className="container hero__body" style={{ y: heroLift, opacity: heroFade }}>
          <div className="hero__grid">
            {/* ── LEFT: typography ── */}
            <div className="hero__left">
              <div className="hero__eyebrow-row">
                <div className="hero__eyebrow">
                  <span className="hero__eyebrow-dot" />
                  <span className="hero__eyebrow-text">
                    <span className="hero__eyebrow-live">Live</span>
                    <span className="hero__eyebrow-sep">·</span>
                    IEEE Computer Society — MITS
                  </span>
                </div>
                <Link to="/events" className="hero__eyebrow-cta">
                  View open events <ArrowUpRight size={11} />
                </Link>
              </div>

              <h1 className="hero__title" aria-label="Build. Innovate. Lead.">
                <span className="hero__title-line hero__title-line--1">
                  <CharReveal text="BUILD." baseDelay={0.1} />
                </span>
                <span className="hero__title-line hero__title-line--2">
                  <span className="hero__title-grad">
                    <CharReveal text="INNO" baseDelay={0.28} />
                    <em className="hero__title-em">
                      <CharReveal text="VATE" baseDelay={0.48} />
                    </em>
                    <span className="hero__title-dot">.</span>
                  </span>
                </span>
                <span className="hero__title-line hero__title-line--3">
                  <CharReveal text="LEAD." baseDelay={0.72} />
                </span>
              </h1>

              <div className="hero__sub-wrap">
                <span className="hero__sub-bar" aria-hidden="true" />
                <p className="hero__sub">
                  A community of computer-science students shipping real projects,
                  running hackathons, and shaping what comes next in tech.
                </p>
              </div>

              <div className="hero__cta">
                <MagneticLink to="/events" className="btn btn-primary hero__cta-main">
                  Explore Events <ArrowRight size={17} />
                </MagneticLink>
                <MagneticLink to="/membership" className="btn btn-ghost hero__cta-sec">
                  <span className="hero__cta-play" aria-hidden="true">
                    <Play size={11} fill="currentColor" />
                  </span>
                  Become a Member
                </MagneticLink>
              </div>

              <div className="hero__trust">
                <span className="hero__trust-avatars" aria-hidden="true">
                  <span /><span /><span /><span />
                </span>
                <span className="hero__trust-text">
                  Joined by <strong>500+ students</strong> &nbsp;·&nbsp; affiliated with IEEE (160+ countries)
                </span>
              </div>
            </div>

            {/* ── RIGHT: glass next-event card ── */}
            <div className="hero__right">
              <div className="hero__card" ref={cardRef}>
                <div className="hero__card-border" aria-hidden="true" />
                <div className="hero__card-bar" />

                <div className="hero__card-inner">
                  <div className="hero__card-head">
                    <div className="hero__card-badge">
                      <span>IEEE</span>
                      <span>CS</span>
                    </div>
                    <div className="hero__card-meta">
                      <span className="hero__card-kicker">
                        <span className="hero__card-kicker-dot" />
                        Next up
                      </span>
                      <span className="hero__card-tenure">Tenure 2025 — 26</span>
                    </div>
                    <div className="hero__card-corner" aria-hidden="true">
                      <span />
                      <span />
                    </div>
                  </div>

                  {nextEvent ? <NextEventBlock event={nextEvent} /> : null}

                  <div className="hero__card-foot">
                    <div className="hero__card-tags">
                      <span className="tag">Workshops</span>
                      <span className="tag">Hackathons</span>
                      <span className="tag">Research</span>
                    </div>
                  </div>
                </div>

                <div className="hero__card-shimmer" />
              </div>

              <div className="hero__floater hero__floater--top">
                <Sparkles size={12} /> Featured chapter
              </div>
              <div className="hero__floater hero__floater--bottom">
                <Users size={12} /> 500+ members
              </div>
            </div>
          </div>

          {/* ── Metric strip ── */}
          <div className="hero__metrics">
            {STATS.map(({ icon: Icon, value, suffix, label }) => (
              <div className="hero__metric" key={label}>
                <Icon size={16} className="hero__metric-icon" />
                <div className="hero__metric-text">
                  <span className="hero__metric-value">
                    <Counter to={value} suffix={suffix} duration={1.8} />
                  </span>
                  <span className="hero__metric-label">{label}</span>
                </div>
                <span className="hero__metric-line" aria-hidden="true" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Ticker tape at hero bottom */}
        <div className="hero__ticker" aria-hidden="true">
          <Marquee speed={55}>
            {HERO_TICKER.map((w, i) => (
              <span className="hero__ticker-word" key={i}>
                <span className="hero__ticker-star">✦</span>
                {w}
              </span>
            ))}
          </Marquee>
        </div>

        {/* Animated vertical scroll cue (right) */}
        <a href="#about" className="hero__scroll-cue" aria-label="Scroll to about">
          <span className="hero__scroll-cue-text">Scroll</span>
          <span className="hero__scroll-cue-line" aria-hidden="true">
            <span className="hero__scroll-cue-dot" />
          </span>
        </a>
      </section>

      {/* ══════════════ TECH MARQUEE ══════════════ */}
      <section className="tech-strip" aria-label="Domains we explore">
        <Marquee speed={45}>
          {TECH_STRIP.map(({ Icon, label }) => (
            <span className="tech-strip__pill" key={label}>
              <Icon size={15} />
              {label}
            </span>
          ))}
        </Marquee>
      </section>

      {/* ══════════════ ABOUT STRIP ══════════════ */}
      <section id="about" className="about-strip section-pad">
        <WaveBackground variant="section" />
        <div className="container about-strip__inner">
          {/* Left text */}
          <Reveal className="about-strip__text" direction="up">
            <span className="section-eyebrow">Who we are</span>
            <h2 className="section-title">
              Driven by curiosity.<br />
              <em>Shaped by code.</em>
            </h2>
            <p className="section-body">
              The IEEE Computer Society chapter at MITS is where students go beyond the syllabus —
              shipping projects, running events, and building the technical foundation that defines
              their careers.
            </p>
            <p className="section-body" style={{ marginTop: '0.85rem' }}>
              Affiliated with IEEE — the world's largest technical professional society,
              with 400,000+ members across 160+ countries.
            </p>
            <Link to="/about" className="btn btn-outline" style={{ marginTop: '2rem' }}>
              Our story <ArrowRight size={15} />
            </Link>
          </Reveal>

          {/* Right — glass card like Anubhava "about box" */}
          <Reveal className="about-strip__card-wrap" direction="left" delay={0.15}>
            <div className="about-glass-card">
              <div className="about-glass-card__bar" />

              <div className="about-glass-card__head">
                <div className="about-glass-card__badge-mark">
                  <span>IEEE</span>
                  <span>CS</span>
                </div>
                <div>
                  <p className="about-glass-card__title">Computer Society</p>
                  <p className="about-glass-card__sub">MITS — Student Chapter</p>
                </div>
              </div>

              <p className="about-glass-card__year">Est. 2019 &nbsp;·&nbsp; Tenure 2025–26</p>

              <div className="about-glass-card__tags">
                {['Workshops', 'Hackathons', 'Seminars', 'Research', 'Networking', 'Competitions', 'Webinars', 'Awards'].map((t) => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>

              <div className="about-glass-card__shimmer" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════ WHAT WE OFFER ══════════════ */}
      <section className="offerings section-pad">
        <div className="container">
          <Reveal className="section-header" direction="up">
            <span className="section-eyebrow">What we offer</span>
            <h2 className="section-title">
              Everything you need to grow<br />
              <em>as an engineer.</em>
            </h2>
            <p className="section-body">
              Workshops, hackathons, research, community — one chapter, one trajectory.
            </p>
          </Reveal>

          <div className="offerings__grid">
            {OFFERINGS.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} direction="up" delay={i * 0.08}>
                <div className="offering-card">
                  <div className="offering-card__glow" aria-hidden="true" />
                  <div className="offering-card__icon">
                    <Icon size={22} />
                  </div>
                  <h3 className="offering-card__title">{title}</h3>
                  <p className="offering-card__desc">{desc}</p>
                  <div className="offering-card__line" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ HIGHLIGHTS CAROUSEL ══════════════ */}
      <section className="home-highlights section-pad">
        <WaveBackground variant="subtle" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Reveal className="section-header--flex" direction="up">
            <div>
              <span className="section-eyebrow">Recent highlights</span>
              <h2 className="section-title">
                Moments worth<br /><em>looking back at.</em>
              </h2>
            </div>
            <Link to="/gallery" className="btn btn-outline btn--sm">
              Open gallery <ArrowRight size={14} />
            </Link>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <HighlightsCarousel items={HIGHLIGHTS} />
          </Reveal>
        </div>
      </section>

      {/* ══════════════ FEATURED EVENTS ══════════════ */}
      <section className="home-events section-pad">
        <WaveBackground variant="section" />
        <div className="container">
          <Reveal className="section-header--flex" direction="up">
            <div>
              <span className="section-eyebrow">What's happening</span>
              <h2 className="section-title">Featured events</h2>
            </div>
            <Link to="/events" className="btn btn-outline btn--sm">
              View all <ArrowRight size={14} />
            </Link>
          </Reveal>

          <div className="home-events__grid">
            {events.map((ev, i) => (
              <Reveal key={ev.id} direction="up" delay={i * 0.1}>
                <EventCard event={ev} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section className="cta-banner">
        <div className="cta-banner__sheen" aria-hidden="true" />
        <div className="container cta-banner__inner">
          <Reveal direction="up">
            <h2 className="cta-banner__title">
              Build what's next.<br />
              <em>With people who care.</em>
            </h2>
            <p className="cta-banner__sub">
              Membership opens doors to events, mentorship, and a global IEEE network.
            </p>
          </Reveal>
          <Reveal className="cta-banner__actions" direction="up" delay={0.1}>
            <MagneticLink to="/membership" className="btn btn-primary">
              Apply for membership <ArrowRight size={17} />
            </MagneticLink>
            <MagneticLink to="/contact" className="btn btn-outline-gold">
              Talk to us
            </MagneticLink>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

/* ─── helpers ─── */

/**
 * Per-character lift reveal. Each letter sits in an overflow-hidden mask
 * and rises into place on a slight stagger — cinematic and works inline.
 */
function CharReveal({ text, baseDelay = 0 }: { text: string; baseDelay?: number }) {
  const reduced = useReducedMotion();
  if (reduced) return <span>{text}</span>;
  const chars = Array.from(text);
  return (
    <span className="char-reveal">
      {chars.map((c, i) => (
        <span className="char-reveal__char" key={i}>
          <motion.span
            className="char-reveal__inner"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{
              duration: 0.95,
              delay: baseDelay + i * 0.045,
              ease: [0.2, 0.7, 0.2, 1],
            }}
          >
            {c === ' ' ? ' ' : c}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function WordReveal({
  text,
  className,
  baseDelay = 0,
  inline = false,
  gradient = false,
}: { text: string; className?: string; baseDelay?: number; inline?: boolean; gradient?: boolean }) {
  const reduced = useReducedMotion();
  const Wrapper = (inline ? 'span' : 'span') as 'span';
  const words = text.split(' ');

  if (reduced) {
    return <Wrapper className={className}>{text}</Wrapper>;
  }

  return (
    <Wrapper className={`${className ?? ''} word-reveal${gradient ? ' word-reveal--grad' : ''}`}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="word-reveal__word">
          <motion.span
            className="word-reveal__inner"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{
              duration: 0.85,
              delay: baseDelay + i * 0.08,
              ease: [0.2, 0.7, 0.2, 1],
            }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Wrapper>
  );
}

function MagneticLink({
  to, className, children,
}: { to: string; className?: string; children: React.ReactNode }) {
  const ref = useMagnetic<HTMLAnchorElement>(10);
  return (
    <Link ref={ref} to={to} className={`${className ?? ''} magnetic`}>
      <span className="magnetic__inner">{children}</span>
    </Link>
  );
}

function NextEventBlock({ event }: { event: Event }) {
  const d = new Date(event.date);
  const daysAway = Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86_400_000));
  const cap = event.max_participants || 0;
  const cur = event.current_participants || 0;
  const pct = cap > 0 ? Math.min(100, Math.round((cur / cap) * 100)) : null;

  return (
    <div className="hero__card-body">
      <div className="hero__card-type">{event.event_type}</div>
      <h3 className="hero__card-title">{event.title}</h3>

      <div className="hero__card-line">
        <span className="hero__card-date">
          <Calendar size={13} />
          {d.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <span className="hero__card-venue">
          <MapPin size={13} />
          {event.venue}
        </span>
      </div>

      {pct !== null && (
        <div className="hero__card-cap">
          <div className="hero__card-cap-top">
            <span>{cur} / {cap} registered</span>
            <span>{pct}%</span>
          </div>
          <div className="hero__card-cap-bar">
            <div className="hero__card-cap-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      <div className="hero__card-cta-row">
        <Link to={`/events/${event.id}/register`} className="btn btn-primary btn--sm">
          Register <ArrowUpRight size={13} />
        </Link>
        <span className="hero__card-countdown">
          {daysAway === 0 ? 'Today' : `in ${daysAway} day${daysAway === 1 ? '' : 's'}`}
        </span>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const d = new Date(event.date);
  const cardRef = useRef<HTMLDivElement>(null);

  /* Pointer-tracked tilt + spotlight for each event card. */
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width);
      const y = ((e.clientY - r.top) / r.height);
      el.style.setProperty('--rx', `${((0.5 - y) * 6).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((x - 0.5) * 8).toFixed(2)}deg`);
      el.style.setProperty('--spot-x', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--spot-y', `${(y * 100).toFixed(1)}%`);
    };
    const onLeave = () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`home-ev-card ${event.status === 'completed' ? 'home-ev-card--past' : ''}`}
    >
      <div className="home-ev-card__spot" aria-hidden="true" />
      <div className="home-ev-card__top">
        <span className="home-ev-card__type">{event.event_type}</span>
        <span className={`home-ev-card__status status--${event.status}`}>{event.status}</span>
      </div>

      <div className="home-ev-card__date">
        <span className="home-ev-card__day">{d.getDate()}</span>
        <span className="home-ev-card__month">
          {d.toLocaleString('default', { month: 'short' })} '{d.getFullYear().toString().slice(2)}
        </span>
      </div>

      <h3 className="home-ev-card__title">{event.title}</h3>
      <p className="home-ev-card__desc">{event.short_description}</p>

      <div className="home-ev-card__venue">📍 {event.venue}</div>

      <div className="home-ev-card__footer">
        {event.status !== 'completed' ? (
          <Link to={`/events/${event.id}/register`} className="btn btn-primary btn--sm">
            Register <ArrowRight size={13} />
          </Link>
        ) : (
          <Link to={`/events/${event.id}`} className="btn btn-outline btn--sm">View Details</Link>
        )}
        <Link to={`/events/${event.id}`} className="home-ev-card__more">
          Learn more →
        </Link>
      </div>

      <div className="home-ev-card__glow" />
    </div>
  );
}