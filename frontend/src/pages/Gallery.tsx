import { useState, useEffect, useRef } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import { galleryAPI } from '../services/api';
import WaveBackground from '../components/WaveBackground';
import './Gallery.css';

interface GalleryImage { id: string; title: string; description: string; image_url: string; category: string; event_title?: string; }

const CATS = ['All','events','workshops','hackathons','team','people','general'];

// ── Real Event Photos ──────────────────────────────────────────────────────────
// Replace these local paths with your actual event photos saved in frontend/public/gallery
const DEMO: GalleryImage[] = [
  {
    id: '1',
    title: 'Chapter Inauguration',
    description: 'Official inauguration ceremony of the IEEE Computer Society Student Branch Chapter with faculty and students.',
    image_url: '/gallery/inauguration-1.jpg',
    category: 'events',
    event_title: 'IEEE CS SBC Inauguration',
  },
  {
    id: '2',
    title: 'Guest Speaker Session',
    description: 'Dr. Sandeep Sharma delivering the keynote talk on career opportunities and leadership.',
    image_url: '/gallery/keynote-session.jpg',
    category: 'events',
    event_title: 'Career Blueprint Talk',
  },
  {
    id: '3',
    title: 'Panel Discussion',
    description: 'Panel members and faculty during the inauguration event discussion session.',
    image_url: '/gallery/panel-discussion.jpg',
    category: 'events',
    event_title: 'Inauguration Panel',
  },
  {
    id: '4',
    title: 'Audience Interaction',
    description: 'Students asking questions and engaging with the guest speaker in the auditorium.',
    image_url: '/gallery/audience-interaction.jpg',
    category: 'general',
    event_title: 'Interactive Q&A',
  },
  {
    id: '5',
    title: 'Workshop Session',
    description: 'Participants working on laptops during a hands-on workshop session.',
    image_url: '/gallery/workshop-lab.jpg',
    category: 'workshops',
    event_title: 'Hands-on Workshop',
  },
  {
    id: '6',
    title: 'Student Team',
    description: 'Core student volunteers and office bearers coordinating the event operations.',
    image_url: '/gallery/team-volunteers.jpg',
    category: 'team',
    event_title: 'Student Team',
  },
  {
    id: '7',
    title: 'Event Coordination',
    description: 'Organizers setting up the venue and ensuring a smooth event experience.',
    image_url: '/gallery/event-coordination.jpg',
    category: 'general',
    event_title: 'Event Setup',
  },
  {
    id: '8',
    title: 'Lecture Hall',
    description: 'Wide view of the audience seated in the lecture hall during the event.',
    image_url: '/gallery/lecture-hall.jpg',
    category: 'events',
    event_title: 'Main Session',
  },
  {
    id: '9',
    title: 'Project Showcase',
    description: 'Students presenting their project demos and shareable portfolios.',
    image_url: '/gallery/project-showcase.jpg',
    category: 'hackathons',
    event_title: 'Project Demo',
  },
  {
    id: '10',
    title: 'Networking Moment',
    description: 'Attendees networking and collaborating during a campus event.',
    image_url: '/gallery/networking.jpg',
    category: 'people',
    event_title: 'Networking Session',
  },
];
// ──────────────────────────────────────────────────────────────────────────────

/* 3-D Rotating Carousel */
function Carousel3D({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState(0);
  const total = Math.min(images.length, 8);
  const angle = 360 / total;
  const CARD_WIDTH = 220;
  const GAP_MULTIPLIER = 1.3;
  const radius = Math.round((CARD_WIDTH * GAP_MULTIPLIER) / (2 * Math.sin(Math.PI / total)));

  const prev = () => setActive(a => (a - 1 + total) % total);
  const next = () => setActive(a => (a + 1) % total);

  // Auto-rotate
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  useEffect(() => {
    timerRef.current = setInterval(next, 3200);
    return () => clearInterval(timerRef.current);
  }, [total]);

  return (
    <div className="c3d">
      <div className="c3d__scene">
        <div
          className="c3d__ring"
          style={{ transform: `rotateY(${-active * angle}deg)` }}
        >
          {images.slice(0, total).map((img, i) => (
            <div
              key={img.id}
              className={`c3d__card ${i === active ? 'c3d__card--active' : ''}`}
              style={{ transform: `rotateY(${i * angle}deg) translateZ(${radius}px)` }}
              onClick={() => setActive(i)}
            >
              <img src={img.image_url} alt={img.title} loading="lazy" />
              <div className="c3d__card-label">
                <p className="c3d__card-title">{img.title}</p>
                <p className="c3d__card-cat">{img.category}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="c3d__controls">
        <button className="c3d__btn" onClick={prev}><ChevronLeft size={20}/></button>
        <div className="c3d__dots">
          {Array.from({ length: total }).map((_, i) => (
            <button key={i} className={`c3d__dot ${i === active ? 'c3d__dot--on' : ''}`} onClick={() => setActive(i)} />
          ))}
        </div>
        <button className="c3d__btn" onClick={next}><ChevronRight size={20}/></button>
      </div>

      <p className="c3d__caption">{images[active]?.title}</p>
    </div>
  );
}

export default function Gallery() {
  const [images, setImages]       = useState<GalleryImage[]>(DEMO);
  const [cat, setCat]             = useState('All');
  const [lightbox, setLightbox]   = useState<GalleryImage | null>(null);

  useEffect(() => {
    galleryAPI.getAll({ limit: '24' })
      .then(r => { if (r.data.images?.length > 0) setImages(r.data.images); })
      .catch(() => {});
  }, []);

  const filtered = cat === 'All' ? images : images.filter(i => i.category === cat);

  // Close lightbox on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  return (
    <div className="gallery-page page-transition">
      <section className="page-header">
        <div className="page-header__bg" />
        <WaveBackground variant="hero" />
        <div className="container page-header__content">
          <span className="section-eyebrow">Memories & Moments</span>
          <h1 className="page-header__title">Gallery</h1>
          <p className="page-header__desc">A visual journey through our events, workshops, hackathons, and achievements.</p>
        </div>
      </section>

      {/* ── 3D Rotating Carousel ── */}
      <section className="gallery-carousel-section">
        <WaveBackground variant="dark" />
        <div className="container" style={{ position:'relative', zIndex:1 }}>
          <div className="section-header">
            <span className="section-eyebrow">Featured Moments</span>
            <h2 className="section-title">A look around the chapter</h2>
          </div>
          <Carousel3D images={images} />
        </div>
      </section>

      {/* ── Masonry Grid ── */}
      <section className="section-pad" style={{ background:'var(--bg-primary)', position:'relative', overflow:'hidden' }}>
        <WaveBackground variant="subtle" />
        <div className="container" style={{ position:'relative', zIndex:1 }}>
          <div className="section-header--flex" style={{ marginBottom:'2rem' }}>
            <div>
              <span className="section-eyebrow">All Photos</span>
              <h2 className="section-title" style={{ marginBottom:0 }}>Photo Archive</h2>
            </div>
          </div>

          {/* Category pills */}
          <div className="gallery-cats">
            {CATS.map(c => (
              <button key={c} className={`ev-chip ${cat===c?'ev-chip--on':''}`} onClick={() => setCat(c)} style={{ textTransform:'capitalize' }}>
                {c}
              </button>
            ))}
          </div>

          {/* Masonry */}
          <div className="gallery-masonry">
            {filtered.map((img, i) => (
              <div key={img.id} className={`gallery-item ${i % 5 === 0 ? 'gallery-item--tall' : ''}`} onClick={() => setLightbox(img)}>
                <img src={img.image_url} alt={img.title} loading="lazy" />
                <div className="gallery-item__overlay">
                  <ZoomIn size={22} />
                  <div>
                    <p className="gallery-item__title">{img.title}</p>
                    {img.event_title && <p className="gallery-item__ev">{img.event_title}</p>}
                  </div>
                </div>
                <span className="gallery-item__cat">{img.category}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div className="lb" onClick={() => setLightbox(null)}>
          <button className="lb__close"><X size={22}/></button>
          <div className="lb__box" onClick={e => e.stopPropagation()}>
            <img src={lightbox.image_url} alt={lightbox.title} />
            <div className="lb__info">
              <p className="lb__title">{lightbox.title}</p>
              {lightbox.description && <p className="lb__desc">{lightbox.description}</p>}
              <span className="tag" style={{ textTransform:'capitalize' }}>{lightbox.category}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}