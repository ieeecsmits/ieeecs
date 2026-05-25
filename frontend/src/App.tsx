import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState, lazy, Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import RouteFallback from './components/RouteFallback';
import { useLenis } from './hooks/useLenis';
import './styles/globals.css';

// Route-level code splitting — every page becomes its own chunk.
const Home            = lazy(() => import('./pages/Home'));
const About           = lazy(() => import('./pages/About'));
const Events          = lazy(() => import('./pages/Events'));
const EventRegister   = lazy(() => import('./pages/EventRegister'));
const OfficeBearers   = lazy(() => import('./pages/OfficeBearers'));
const Membership      = lazy(() => import('./pages/Membership'));
const Gallery         = lazy(() => import('./pages/Gallery'));
const Contact         = lazy(() => import('./pages/Contact'));
const AdminLogin      = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard  = lazy(() => import('./pages/AdminDashboard'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [pathname]);
  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const hideNav = pathname === '/admin/login';
  return (
    <>
      {!hideNav && <Navbar />}
      <main>{children}</main>
      {!hideNav && <Footer />}
    </>
  );
}

function NotFound() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1.5rem',
      background: 'var(--bg-primary)', paddingTop: 'var(--nav-height)',
    }}>
      <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '10rem', color: 'var(--gold)', lineHeight: 1 }}>404</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>This page doesn't exist.</p>
      <a href="/" className="btn btn-primary">← Go home</a>
    </div>
  );
}

function AppRoutes() {
  return (
    <Layout>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/"                      element={<Home />} />
          <Route path="/about"                 element={<About />} />
          <Route path="/events"                element={<Events />} />
          <Route path="/events/:id"            element={<EventRegister />} />
          <Route path="/events/:id/register"   element={<EventRegister />} />
          <Route path="/register"              element={<Events />} />
          <Route path="/office-bearers"        element={<OfficeBearers />} />
          <Route path="/membership"            element={<Membership />} />
          <Route path="/gallery"               element={<Gallery />} />
          <Route path="/contact"               element={<Contact />} />
          <Route path="/admin/login"           element={<AdminLogin />} />
          <Route path="/admin"                 element={<AdminDashboard />} />
          <Route path="*"                      element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);
  useLenis();

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          {loading && <LoadingScreen onDone={() => setLoading(false)} />}
          {!loading && (
            <>
              <ScrollToTop />
              <AppRoutes />
              <Analytics />
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: 'var(--surface-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '10px',
                    fontFamily: "'DM Sans',sans-serif",
                    fontSize: '0.88rem',
                    boxShadow: 'var(--shadow-lg)',
                  },
                  success: { iconTheme: { primary: '#F5C518', secondary: '#0D0D12' } },
                  error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
                }}
              />
            </>
          )}
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
