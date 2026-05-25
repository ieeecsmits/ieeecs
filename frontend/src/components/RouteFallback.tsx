import './RouteFallback.css';

/** Lightweight inline loader shown while a lazy route chunk is fetching. */
export default function RouteFallback() {
  return (
    <div className="route-fallback" role="status" aria-live="polite">
      <div className="route-fallback__pulse" aria-hidden="true">
        <span /><span /><span />
      </div>
      <span className="route-fallback__label">Loading</span>
    </div>
  );
}
