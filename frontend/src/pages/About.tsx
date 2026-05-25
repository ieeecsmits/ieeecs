import { Link } from 'react-router-dom';
import { ArrowRight, Target, Eye, Heart } from 'lucide-react';
import WaveBackground from '../components/WaveBackground';
import './About.css';

const IEEE_STATS = [
  { value: '400K+', label: 'IEEE Members Worldwide' },
  { value: '160+',  label: 'Countries' },
  { value: '39',    label: 'Technical Societies' },
  { value: '1884',  label: 'Year Founded' },
];

export default function About() {
  return (
    <div className="about-page page-transition">

      {/* ── Header ── */}
      <section className="page-header">
        <div className="page-header__bg" />
        <WaveBackground variant="hero" />
        <div className="container page-header__content">
          <span className="section-eyebrow">Who we are</span>
          <h1 className="page-header__title">About<br />IEEE CS</h1>
          <p className="page-header__desc">
            A student-led chapter of IEEE — the world's largest technical professional society — building engineers, researchers, and leaders at MITS.
          </p>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="section-pad abt-story">
        <WaveBackground variant="section" />
        <div className="container abt-story__inner">
          <div className="abt-story__text">
            <span className="section-eyebrow">Our story</span>
            <h2 className="section-title">Building tomorrow's<br /><em>engineers, today.</em></h2>
            <p className="section-body" style={{ marginBottom:'1rem' }}>
              Founded in 2019, the IEEE Computer Society chapter at MITS started as a small group of curious students. Six years later, it's a community of 500+ members shipping projects, running events, and pushing each other to do harder things.
            </p>
            <p className="section-body" style={{ marginBottom:'1rem' }}>
              We run workshops in modern stacks, hackathons that ship real products, research talks with industry engineers, and competitions that take members to national stages.
            </p>
            <p className="section-body">
              Whether you're a first-year finding your footing or a final-year preparing for interviews and research, this chapter is where you compound.
            </p>
            <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap', marginTop:'2rem' }}>
              <Link to="/membership" className="btn btn-primary">Join IEEE CS <ArrowRight size={15}/></Link>
              <Link to="/events"     className="btn btn-outline">See events</Link>
            </div>
          </div>

          {/* Glass card — Anubhava about-box style */}
          <div className="abt-story__visual">
            <div className="abt-glass">
              <div className="abt-glass__bar" />
              <div className="abt-glass__shimmer" />

              <div className="abt-glass__logo-row">
                <img src="/ieee-cs-logo.png" alt="IEEE CS" loading="lazy" decoding="async" className="abt-glass__ieee-img"
                  onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}} />
                <img src="/mits-logo.png" alt="MITS" loading="lazy" decoding="async" className="abt-glass__mits-img"
                  onError={(e)=>{(e.target as HTMLImageElement).style.display='none';}} />
              </div>

              <p className="abt-glass__title">IEEE CS — MITS Gwalior</p>
              <p className="abt-glass__year">Established 2019 &nbsp;·&nbsp; Tenure 2025–26</p>

              <div className="abt-glass__stats">
                {[['500+','Members'],['40+','Events'],['5+','Years'],['15+','Awards']].map(([v,l])=>(
                  <div key={l} className="abt-glass__stat">
                    <span className="abt-glass__stat-val">{v}</span>
                    <span className="abt-glass__stat-lbl">{l}</span>
                  </div>
                ))}
              </div>

              <div className="abt-glass__tags">
                {['Workshops','Hackathons','Seminars','Research','Networking','Webinars','Competitions','Awards'].map(t=>(
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission Vision Values ── */}
      <section className="section-pad abt-mvv">
        <WaveBackground variant="dark" />
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Our purpose</span>
            <h2 className="section-title">Mission, vision &amp; values</h2>
          </div>
          <div className="abt-mvv__grid">
            {[
              { icon: Target, title: 'Mission', body: 'Build technical depth and leadership in computer-science students through collaborative learning, real projects, and competition.' },
              { icon: Eye,    title: 'Vision',  body: 'Be the most impactful student-led technology chapter in the region — producing graduates who ship, lead, and stand on their own technical work.', gold: true },
              { icon: Heart,  title: 'Values',  body: 'Inclusivity, curiosity, ownership, integrity, and the discipline of continuous learning. Everything we do compounds from these.' },
            ].map(({ icon: Icon, title, body, gold }) => (
              <div key={title} className={`abt-mvv__card ${gold ? 'abt-mvv__card--gold' : ''}`}>
                <div className="abt-mvv__card-icon"><Icon size={26}/></div>
                <h3>{title}</h3>
                <p>{body}</p>
                <div className="abt-mvv__card-line" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IEEE Global ── */}
      <section className="section-pad abt-global">
        <WaveBackground variant="section" />
        <div className="container abt-global__inner">
          <div>
            <span className="section-eyebrow">Part of something global</span>
            <h2 className="section-title">IEEE — the world's largest<br /><em>technical society.</em></h2>
            <p className="section-body" style={{ marginBottom:'1.5rem' }}>
              Through our chapter, members tap into IEEE's network of 400,000+ professionals across 160+ countries — papers from IEEE Xplore, certifications, conferences, and a hiring funnel that reaches far beyond campus.
            </p>
            <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
              <a href="https://www.ieee.org" target="_blank" rel="noreferrer" className="btn btn-outline">Visit IEEE.org <ArrowRight size={15}/></a>
              <a href="https://www.computer.org" target="_blank" rel="noreferrer" className="btn btn-outline">Computer Society <ArrowRight size={15}/></a>
            </div>
          </div>
          <div className="abt-global__stats">
            {IEEE_STATS.map(({ value, label }) => (
              <div key={label} className="abt-global__stat">
                <span className="abt-global__stat-val">{value}</span>
                <span className="abt-global__stat-lbl">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-banner">
        <WaveBackground variant="subtle" />
        <div className="container cta-banner__inner">
          <div>
            <h2 className="cta-banner__title">Write the next chapter with us.</h2>
            <p className="cta-banner__sub">Apply for membership or drop into the next event.</p>
          </div>
          <div className="cta-banner__actions">
            <Link to="/membership" className="btn btn-primary">Apply for membership <ArrowRight size={17}/></Link>
            <Link to="/events" className="btn btn-outline-gold">See events</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
