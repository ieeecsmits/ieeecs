import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, ChevronDown, Users, Calendar, Award, Globe,
  Cpu, Zap, BookOpen, MapPin, Sparkles,
} from 'lucide-react';
import { eventsAPI } from '../services/api';
import WaveBackground from '../components/WaveBackground';
import HighlightsCarousel, { Highlight } from '../components/HighlightsCarousel';
import './Home.css';

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

const STATS = [
  { icon: Users,    value: '500+', label: 'Active Members' },
  { icon: Calendar, value: '40+',  label: 'Events Hosted' },
  { icon: Award,    value: '15+',  label: 'Awards Won' },
  { icon: Globe,    value: '5+',   label: 'Years Active' },
];

const ORBIT_CHIPS = ['AI / ML', 'Cloud', 'Hackathons', 'Research', 'Web3', 'Embedded'];

const HIGHLIGHTS: Highlight[] = [
  {
    id: 'h1',
    title: 'Frontend Battle 2026',
    subtitle: 'Two rounds, dozens of teams, one pixel-perfect winner.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=80',
    tag: 'Hackathon',
    meta: 'Mar 2026 · 200+ participants',
    href: '/events',
  },
  {
    id: 'h2',
    title: 'Career Blueprint with Deloitte',
    subtitle: 'A frank look at building a career in the age of AI.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&q=80',
    tag: 'Seminar',
    meta: 'Mar 2026 · SAC',
    href: '/events',
  },
  {
    id: 'h3',
    title: 'React & Node full-stack workshop',
    subtitle: 'Shipping a production-grade app from scratch in a day.',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900&q=80',
    tag: 'Workshop',
    meta: 'Apr 2026 · Lab 301',
    href: '/events',
  },
  {
    id: 'h4',
    title: 'AI & ML Trends — Tech Talk',
    subtitle: 'Industry researchers on what really moved the field this year.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=900&q=80',
    tag: 'Tech talk',
    meta: 'Jun 2026 · Seminar Hall',
    href: '/events',
  },
  {
    id: 'h5',
    title: 'Chapter inauguration 2025',
    subtitle: 'The tenure begins — new team, new programs, same standards.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80',
    tag: 'Chapter',
    meta: 'Aug 2025',
    href: '/about',
  },
  {
    id: 'h6',
    title: 'Cybersecurity & ethical hacking',
    subtitle: 'Hands-on intro to offensive security from the red-team perspective.',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=900&q=80',
    tag: 'Workshop',
    meta: 'Feb 2026',
    href: '/events',
  },
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

  useEffect(() => {
    eventsAPI.getAll({ featured: 'true', limit: '3' })
      .then((res) => { if (res.data.events?.length) setEvents(res.data.events); })
      .catch(() => {});
  }, []);

  // Pointer-tracked tilt on the hero card (disabled when prefers-reduced-motion).
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) return;
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
  }, []);

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
        <div className="hero__glow hero__glow--1" />
        <div className="hero__glow hero__glow--2" />
        <div className="hero__glow hero__glow--3" />

        <div className="container hero__body">
          <div className="hero__grid">
            {/* ── LEFT: typography ── */}
            <div className="hero__left">
              <div className="hero__eyebrow">
                <span className="hero__eyebrow-dot" />
                <span className="hero__eyebrow-text">
                  <span className="hero__eyebrow-live">Now active</span>
                  <span className="hero__eyebrow-sep">·</span>
                  IEEE Computer Society Chapter
                </span>
              </div>

              <h1 className="hero__title">
                <span className="hero__title-line hero__title-line--1">Build.</span>
                <span className="hero__title-line hero__title-line--2">
                  <span className="hero__title-grad">Inno<em>vate</em></span>.
                </span>
                <span className="hero__title-line hero__title-line--3">Lead.</span>
              </h1>

              <p className="hero__sub">
                A community of computer-science students shipping real projects,
                running hackathons, and shaping what comes next in tech.
              </p>

              <div className="hero__cta">
                <Link to="/events" className="btn btn-primary hero__cta-main">
                  Explore Events <ArrowRight size={17} />
                </Link>
                <Link to="/membership" className="btn btn-outline hero__cta-sec">
                  Become a Member
                </Link>
              </div>

              <p className="hero__trust">
                <Sparkles size={13} />
                Affiliated with <strong>IEEE</strong> — 400,000+ members across 160+ countries.
              </p>
            </div>

            {/* ── RIGHT: glass next-event card + orbiting chips ── */}
            <div className="hero__right">
              <div className="hero__orbit" aria-hidden="true">
                {ORBIT_CHIPS.map((label, i) => (
                  <span
                    key={label}
                    className="hero__orbit-chip"
                    style={{ ['--i' as never]: i, ['--n' as never]: ORBIT_CHIPS.length }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <div className="hero__card" ref={cardRef}>
                <div className="hero__card-bar" />

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
                </div>

                {nextEvent ? <NextEventBlock event={nextEvent} /> : null}

                <div className="hero__card-foot">
                  <div className="hero__card-tags">
                    <span className="tag">Workshops</span>
                    <span className="tag">Hackathons</span>
                    <span className="tag">Research</span>
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
            {STATS.map(({ icon: Icon, value, label }) => (
              <div className="hero__metric" key={label}>
                <Icon size={16} className="hero__metric-icon" />
                <div className="hero__metric-text">
                  <span className="hero__metric-value">{value}</span>
                  <span className="hero__metric-label">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <a href="#about" className="hero__scroll-cue" aria-label="Scroll to about">
          <span className="hero__scroll-cue-text">Scroll</span>
          <ChevronDown size={16} />
        </a>
      </section>

      {/* ══════════════ ABOUT STRIP ══════════════ */}
      <section id="about" className="about-strip section-pad">
        <WaveBackground variant="section" />
        <div className="container about-strip__inner">
          {/* Left text */}
          <div className="about-strip__text">
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
          </div>

          {/* Right — glass card like Anubhava "about box" */}
          <div className="about-strip__card-wrap">
            <div className="about-glass-card">
              {/* Top accent bar */}
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

              {/* Hover shimmer line — Anubhava style */}
              <div className="about-glass-card__shimmer" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ WHAT WE OFFER ══════════════ */}
      <section className="offerings section-pad">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">What we offer</span>
            <h2 className="section-title">
              Everything you need to grow<br />
              <em>as an engineer.</em>
            </h2>
            <p className="section-body">
              Workshops, hackathons, research, community — one chapter, one trajectory.
            </p>
          </div>

          <div className="offerings__grid">
            {OFFERINGS.map(({ icon: Icon, title, desc }, i) => (
              <div className="offering-card" key={title} style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="offering-card__icon">
                  <Icon size={22} />
                </div>
                <h3 className="offering-card__title">{title}</h3>
                <p className="offering-card__desc">{desc}</p>
                {/* Bottom gradient line on hover — Anubhava style */}
                <div className="offering-card__line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ HIGHLIGHTS CAROUSEL ══════════════ */}
      <section className="home-highlights section-pad">
        <WaveBackground variant="subtle" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-header--flex">
            <div>
              <span className="section-eyebrow">Recent highlights</span>
              <h2 className="section-title">
                Moments worth<br /><em>looking back at.</em>
              </h2>
            </div>
            <Link to="/gallery" className="btn btn-outline btn--sm">
              Open gallery <ArrowRight size={14} />
            </Link>
          </div>
          <HighlightsCarousel items={HIGHLIGHTS} />
        </div>
      </section>

      {/* ══════════════ FEATURED EVENTS ══════════════ */}
      <section className="home-events section-pad">
        <WaveBackground variant="section" />
        <div className="container">
          <div className="section-header--flex">
            <div>
              <span className="section-eyebrow">What's happening</span>
              <h2 className="section-title">Featured events</h2>
            </div>
            <Link to="/events" className="btn btn-outline btn--sm">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="home-events__grid">
            {events.map((ev, i) => (
              <EventCard key={ev.id} event={ev} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section className="cta-banner">
        <div className="container cta-banner__inner">
          <div>
            <h2 className="cta-banner__title">
              Build what's next.<br />
              <em>With people who care.</em>
            </h2>
            <p className="cta-banner__sub">
              Membership opens doors to events, mentorship, and a global IEEE network.
            </p>
          </div>
          <div className="cta-banner__actions">
            <Link to="/membership" className="btn btn-primary">
              Apply for membership <ArrowRight size={17} />
            </Link>
            <Link to="/contact" className="btn btn-outline-gold">
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </div>
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

function EventCard({ event, index }: { event: Event; index: number }) {
  const d = new Date(event.date);
  return (
    <div
      className={`home-ev-card ${event.status === 'completed' ? 'home-ev-card--past' : ''}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
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

      {/* Hover accent line */}
      <div className="home-ev-card__glow" />
    </div>
  );
}
