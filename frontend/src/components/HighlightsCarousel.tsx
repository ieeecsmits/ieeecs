import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import './HighlightsCarousel.css';

export interface Highlight {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  tag?: string;
  href?: string;
  meta?: string;
}

interface Props {
  items: Highlight[];
  autoplayMs?: number;
}

export default function HighlightsCarousel({ items, autoplayMs = 4500 }: Props) {
  const [emblaRef, embla] = useEmblaCarousel({
    align: 'start',
    loop: true,
    skipSnaps: false,
    dragFree: false,
  });
  const [selected, setSelected] = useState(0);
  const [snaps, setSnaps] = useState<number[]>([]);

  const scrollTo = useCallback((i: number) => embla?.scrollTo(i), [embla]);
  const scrollPrev = useCallback(() => embla?.scrollPrev(), [embla]);
  const scrollNext = useCallback(() => embla?.scrollNext(), [embla]);

  useEffect(() => {
    if (!embla) return;
    setSnaps(embla.scrollSnapList());
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    embla.on('select', onSelect);
    embla.on('reInit', onSelect);
    onSelect();
    return () => {
      embla.off('select', onSelect);
      embla.off('reInit', onSelect);
    };
  }, [embla]);

  // Autoplay — pauses on hover and when document is hidden.
  useEffect(() => {
    if (!embla || autoplayMs <= 0) return;
    let paused = false;
    const root = embla.rootNode();
    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };
    const onVisibility = () => { paused = document.hidden; };
    root.addEventListener('pointerenter', onEnter);
    root.addEventListener('pointerleave', onLeave);
    document.addEventListener('visibilitychange', onVisibility);

    const id = window.setInterval(() => {
      if (paused || !embla) return;
      embla.scrollNext();
    }, autoplayMs);

    return () => {
      window.clearInterval(id);
      root.removeEventListener('pointerenter', onEnter);
      root.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [embla, autoplayMs]);

  return (
    <div className="hc">
      <div className="hc__viewport" ref={emblaRef}>
        <div className="hc__track">
          {items.map((item) => (
            <article className="hc__slide" key={item.id}>
              <a
                className="hc__card"
                href={item.href || '#'}
                target={item.href?.startsWith('http') ? '_blank' : undefined}
                rel={item.href?.startsWith('http') ? 'noreferrer' : undefined}
              >
                <div className="hc__media">
                  <img src={item.image} alt={item.title} loading="lazy" />
                  <div className="hc__media-overlay" aria-hidden="true" />
                  {item.tag && <span className="hc__tag">{item.tag}</span>}
                </div>
                <div className="hc__body">
                  {item.meta && <span className="hc__meta">{item.meta}</span>}
                  <h3 className="hc__title">{item.title}</h3>
                  {item.subtitle && <p className="hc__sub">{item.subtitle}</p>}
                  <span className="hc__cta">
                    Read more <ArrowUpRight size={14} />
                  </span>
                </div>
              </a>
            </article>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="hc__controls">
        <button
          className="hc__btn"
          onClick={scrollPrev}
          aria-label="Previous slide"
          type="button"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="hc__dots" role="tablist" aria-label="Carousel slides">
          {snaps.map((_, i) => (
            <button
              key={i}
              className={`hc__dot ${i === selected ? 'hc__dot--on' : ''}`}
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === selected ? 'true' : undefined}
              role="tab"
              type="button"
            />
          ))}
        </div>

        <button
          className="hc__btn"
          onClick={scrollNext}
          aria-label="Next slide"
          type="button"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
