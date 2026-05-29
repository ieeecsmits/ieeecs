import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Search, ArrowRight, Clock, Filter } from 'lucide-react';
import { eventsAPI } from '../services/api';
import WaveBackground from '../components/WaveBackground';
import './Events.css';

interface Event {
  id: string; title: string; description: string; short_description: string;
  event_type: string; status: string; date: string; time: string;
  venue: string; is_online: boolean; current_participants: number;
  max_participants: number; tags: string[];
}

const TYPES    = ['All','workshop','seminar','hackathon','webinar','competition','conference'];
const STATUSES = ['All','upcoming','ongoing','completed'];

const SAMPLES: Event[] = [
  {
  id: "roadmap-to-programming-skills",
  title: "Roadmap to Programming Skills",
  description: "IEEE Computer Society Student Chapter, MITS Gwalior, in collaboration with IEEE Madhya Pradesh Section, hosted an insightful technical talk by Dr. E. Balagurusamy, one of India's most renowned computer scientists, educators, and bestselling authors. The session provided students with a structured roadmap to mastering programming, covering the journey from fundamental concepts to advanced problem-solving skills. Drawing from decades of academic and industry experience, Dr. Balagurusamy shared practical guidance on developing strong programming foundations, choosing the right learning resources, building logical thinking, and preparing for successful careers in technology. The event inspired students to approach programming with clarity, consistency, and a growth mindset while gaining valuable insights from one of the most influential educators in computer science.",
  short_description: "An inspiring technical talk by Dr. E. Balagurusamy on mastering programming fundamentals and building a successful technology career.",
  event_type: "Technical Talk",
  status: 'completed',
  date: "2026-03-13",
  time: "04:00 PM",
  venue: "Conclave Hall",
  is_online: false,
  current_participants: 200,
  max_participants: 250,
  tags: [
    "Programming",
    "C++",
    "Computer Science",
    "Technical Talk",
    "Career Guidance",
    "Software Development",
    "IEEE",
    "IEEE Computer Society",
    "Skill Development",
    "Student Learning",
    "Coding",
    "Technology"
  ]
},
{
  id: "career-blueprint-deloitte-md",
  title: "Career Blueprint: Insights from Deloitte MD",
  description: "IEEE Computer Society Student Branch Chapter, MITS Gwalior, organized an exclusive leadership and career guidance session featuring Dr. Sandeep K. Sharma, Managing Director at Deloitte Consulting, Hyderabad. The session provided students with a rare opportunity to learn directly from an accomplished industry leader about building a successful career in the technology and consulting sectors. Dr. Sharma shared valuable insights on industry expectations, emerging technology trends, leadership development, professional growth, and the skills required to thrive in a highly competitive global environment. Students gained practical guidance on bridging the gap between academics and industry, developing a future-ready mindset, and making informed career decisions. The interactive discussion inspired participants to think beyond conventional career paths and prepare themselves for impactful roles in the ever-evolving technology landscape.",
  short_description: "A transformative industry interaction with Deloitte Managing Director Dr. Sandeep K. Sharma on careers, leadership, and future technology opportunities.",
  event_type: "Industry Talk",
  status: "completed",
  date: "2026-03-26",
  time: "04:00 PM",
  venue: "Student Activity Centre (SAC)",
  is_online: false,
  current_participants: 250,
  max_participants: 300,
  tags: [
    "Deloitte",
    "Industry Expert",
    "Career Guidance",
  ]
},
{
  id: "frontend-battle-2026",
  title: "Frontend Battle 2026",
  description: "Frontend Battle 2026 emerged as one of the flagship technical competitions organized by the IEEE Computer Society Student Branch Chapter, MITS Gwalior. Designed to challenge participants across the complete frontend development lifecycle, the event brought together aspiring developers, designers, and innovators to showcase their creativity, technical expertise, and problem-solving abilities. The competition featured two exciting rounds: Portfolio Showdown, where participants demonstrated their personal projects and technical journeys, followed by Pixel Perfect Battle, a high-intensity frontend challenge focused on transforming design concepts into fully functional and responsive web interfaces. Embracing modern development practices, participants were encouraged to leverage AI-powered tools alongside their coding skills, reflecting the evolving landscape of software development. With enthusiastic participation, competitive spirit, industry-relevant challenges, and an impressive prize pool, the event provided a platform for students to gain practical experience, strengthen their portfolios, and connect with a thriving community of developers. The overwhelming response and exceptional quality of submissions established Frontend Battle 2026 as one of the most successful and impactful technical events conducted by the chapter.",
  short_description: "A flagship frontend development competition featuring design, coding, deployment, and AI-powered innovation with an exceptional student response.",
  event_type: "Technical Competition",
  status: "completed",
  date: "2026-03-28",
  time: "11:00 AM",
  venue: "Student Activity Centre (SAC)",
  is_online: false,
  current_participants: 350,
  max_participants: 400,
  tags: [
    "Frontend Development",
    "Coding Competition",
    "Hackathon",
  ]
},
  
];

export default function Events() {
  const [events, setEvents]       = useState<Event[]>(SAMPLES);
  const [loading, setLoading]     = useState(true);
  const [type, setType]           = useState('All');
  const [status, setStatus]       = useState('All');
  const [search, setSearch]       = useState('');

  useEffect(() => {
    setLoading(true);
    const p: Record<string,string> = {};
    if (type !== 'All')   p.type   = type;
    if (status !== 'All') p.status = status;
    eventsAPI.getAll(p)
      .then(r => setEvents(r.data.events?.length ? r.data.events : SAMPLES))
      .catch(() => setEvents(SAMPLES))
      .finally(() => setLoading(false));
  }, [type, status]);

  const filtered = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.short_description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="events-page page-transition">
      <section className="page-header">
        <div className="page-header__bg" />
        <WaveBackground variant="hero" />
        <div className="container page-header__content">
          <span className="section-eyebrow">What's Happening</span>
          <h1 className="page-header__title">Events</h1>
          <p className="page-header__desc">Workshops, hackathons, seminars and more. Find your next opportunity to learn and grow.</p>
        </div>
      </section>

      <section className="section-pad" style={{ background:'var(--bg-primary)', position:'relative', overflow:'hidden' }}>
        <WaveBackground variant="subtle" />
        <div className="container" style={{ position:'relative', zIndex:1 }}>

          {/* Filters */}
          <div className="ev-filters">
            <div className="ev-search">
              <Search size={15} />
              <input placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="ev-filter-row">
              <Filter size={14} />
              <span className="ev-filter-label">Type:</span>
              {TYPES.map(t => (
                <button key={t} className={`ev-chip ${type===t?'ev-chip--on':''}`} onClick={() => setType(t)}>{t}</button>
              ))}
            </div>
            <div className="ev-filter-row">
              <span className="ev-filter-label">Status:</span>
              {STATUSES.map(s => (
                <button key={s} className={`ev-chip ${status===s?'ev-chip--on':''}`} onClick={() => setStatus(s)}>{s}</button>
              ))}
            </div>
          </div>

          <p className="ev-count">{loading ? 'Loading…' : `${filtered.length} event${filtered.length!==1?'s':''} found`}</p>

          {loading ? (
            <div className="ev-grid">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="ev-card ev-card--skeleton">
                  <div className="skeleton" style={{height:'140px',borderRadius:'10px',marginBottom:'1rem'}} />
                  <div className="skeleton skeleton--tag" style={{marginBottom:'0.75rem'}} />
                  <div className="skeleton skeleton--title" style={{marginBottom:'0.5rem'}} />
                  <div className="skeleton skeleton--body" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="ev-empty">No events found. Try adjusting your filters.</div>
          ) : (
            <div className="ev-grid">
              {filtered.map((ev, i) => <EvCard key={ev.id} ev={ev} idx={i} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function EvCard({ ev, idx }: { ev: Event; idx: number }) {
  const d = new Date(ev.date);
  return (
    <div className={`ev-card ${ev.status==='completed'?'ev-card--past':''}`} style={{ animationDelay:`${idx*0.06}s` }}>
      <div className="ev-card__header">
        <span className="ev-card__type">{ev.event_type}</span>
        <span className={`ev-card__status status--${ev.status}`}>{ev.status}</span>
      </div>
      <div className="ev-card__date">
        <span className="ev-card__day">{d.getDate()}</span>
        <span className="ev-card__month">{d.toLocaleString('default',{month:'short'})} '{d.getFullYear().toString().slice(2)}</span>
      </div>
      <h3 className="ev-card__title">{ev.title}</h3>
      <p className="ev-card__desc">{ev.short_description || ev.description?.slice(0,120)}</p>
      <div className="ev-card__meta">
        {ev.time && <span><Clock size={12}/> {ev.time.slice(0,5)}</span>}
        <span><MapPin size={12}/> {ev.is_online ? 'Online' : ev.venue || 'TBA'}</span>
        {ev.max_participants && <span><Users size={12}/> {ev.current_participants||0}/{ev.max_participants}</span>}
      </div>
      {ev.tags?.length > 0 && (
        <div className="ev-card__tags">{ev.tags.slice(0,3).map(t => <span key={t} className="tag">{t}</span>)}</div>
      )}
      <div className="ev-card__footer">
        <Link to={`/events/${ev.id}`} className="btn btn-outline btn--sm">Details</Link>
        {ev.status !== 'completed' && ev.status !== 'cancelled' && (
          <Link to={`/events/${ev.id}/register`} className="btn btn-primary btn--sm">Register <ArrowRight size={13}/></Link>
        )}
      </div>
      <div className="ev-card__glow" />
    </div>
  );
}
