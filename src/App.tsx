import React, { useEffect, useState } from 'react';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { AuthModal } from './components/auth/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { HomeDashboard } from './pages/HomeDashboard';
import { DiscoverPage } from './pages/DiscoverPage';
import { MatchesPage } from './pages/MatchesPage';
import { ConfessionsPage } from './pages/ConfessionsPage';
import { SecretAdmirerPage } from './pages/SecretAdmirerPage';
import { CouplesCornerPage } from './pages/CouplesCornerPage';
import { DatePlannerPage } from './pages/DatePlannerPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { EventsPage } from './pages/EventsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LegalPages } from './pages/LegalPages';
import { NotificationsPage } from './pages/NotificationsPage';
import { api } from './services/api';
import { Profile } from './types';
import { ShieldAlert } from 'lucide-react';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMatches, setUnreadMatches] = useState(1);
  const [loadingUser, setLoadingUser] = useState(true);

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot-password'>('login');

  const fetchSession = async () => {
    try {
      const res = await api.getCurrentUser();
      setCurrentUser(res.user);
      setIsAdmin(res.isAdmin);
      setUnreadNotifications(res.unreadNotifications || 0);
    } catch (err) {
      console.warn('No active session or server starting:', err);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchSession();

    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (mode: 'login' | 'signup' | 'forgot-password') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: Profile) => {
    setCurrentUser(user);
    setIsAdmin(user.email.toLowerCase().includes('admin'));
    navigate('/home');
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setIsAdmin(false);
    navigate('/');
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#101827] flex items-center justify-center text-xs text-[#d9b978]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1d2636] border border-[#d9b978]/40 flex items-center justify-center animate-pulse">
            <span className="font-heading font-extrabold text-[#d9b978]">AC</span>
          </div>
          <span className="font-mono text-[11px] text-[#9ca3af]">Connecting to HBTU Campus Network...</span>
        </div>
      </div>
    );
  }

  // Route Render Logic
  const renderCurrentView = () => {
    // 1. Legal / Public info pages
    if (currentPath === '/privacy') return <LegalPages page="privacy" onNavigate={navigate} />;
    if (currentPath === '/terms') return <LegalPages page="terms" onNavigate={navigate} />;
    if (currentPath === '/safety') return <LegalPages page="safety" onNavigate={navigate} />;
    if (currentPath === '/community-guidelines') return <LegalPages page="community-guidelines" onNavigate={navigate} />;
    if (currentPath === '/contact') return <LegalPages page="contact" onNavigate={navigate} />;
    if (currentPath === '/about') return <LegalPages page="about" onNavigate={navigate} />;
    if (currentPath === '/how-it-works') return <LegalPages page="how-it-works" onNavigate={navigate} />;

    // 2. Unauthenticated root landing
    if (!currentUser || currentPath === '/') {
      return (
        <LandingPage
          onOpenAuth={handleOpenAuth}
          onExplore={(p) => {
            if (currentUser) {
              navigate(p);
            } else {
              handleOpenAuth('signup');
            }
          }}
        />
      );
    }

    // 3. Authenticated routes
    switch (currentPath) {
      case '/home':
        return <HomeDashboard currentUser={currentUser} onNavigate={navigate} />;
      case '/discover':
        return <DiscoverPage currentUser={currentUser} onNavigate={navigate} />;
      case '/matches':
      case '/messages':
        return <MatchesPage currentUser={currentUser} onNavigate={navigate} />;
      case '/confessions':
        return <ConfessionsPage currentUser={currentUser} />;
      case '/secret-admirer':
        return <SecretAdmirerPage currentUser={currentUser} onNavigate={navigate} />;
      case '/couples':
        return <CouplesCornerPage currentUser={currentUser} />;
      case '/date-planner':
        return <DatePlannerPage currentUser={currentUser} />;
      case '/communities':
        return <CommunitiesPage currentUser={currentUser} />;
      case '/events':
        return <EventsPage currentUser={currentUser} />;
      case '/notifications':
        return (
          <NotificationsPage
            currentUser={currentUser}
            onNavigate={navigate}
            onRefreshUnread={fetchSession}
          />
        );
      case '/profile':
        return (
          <ProfilePage
            currentUser={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onNavigate={navigate}
          />
        );
      case '/settings':
        return (
          <SettingsPage
            currentUser={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onLogout={handleLogout}
          />
        );
      case '/admin':
      case '/admin/users':
      case '/admin/verifications':
      case '/admin/reports':
      case '/admin/confessions':
      case '/admin/analytics':
      case '/admin/settings':
        if (!isAdmin) {
          return (
            <div className="max-w-md mx-auto my-20 p-8 rounded-2xl bg-[#151a25] border border-[#f87171]/40 text-center space-y-3">
              <ShieldAlert className="w-10 h-10 text-[#f87171] mx-auto" />
              <h3 className="text-lg font-bold text-[#f3f4f6]">Unauthorized Admin Access</h3>
              <p className="text-xs text-[#9ca3af]">
                Your account ({currentUser.email}) does not hold administrative permissions.
              </p>
              <button
                onClick={() => navigate('/home')}
                className="px-4 py-2 bg-[#d9b978] text-[#101827] text-xs font-semibold rounded-xl"
              >
                Return to Dashboard
              </button>
            </div>
          );
        }
        return <AdminDashboard currentUser={currentUser} onNavigate={navigate} />;
      default:
        return <HomeDashboard currentUser={currentUser} onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#101827] text-[#f3f4f6] flex flex-col font-sans selection:bg-[#d9b978] selection:text-[#101827]">
      {/* Top Bar Contract Navbar */}
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        currentUser={currentUser}
        isAdmin={isAdmin}
        unreadCount={unreadNotifications}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Page Canvas */}
      <main className="flex-1 pb-20 md:pb-8">
        {renderCurrentView()}
      </main>



      {/* Mobile Ergonomic Bottom Navigation Bar */}
      {currentUser && (
        <BottomNav
          currentPath={currentPath}
          onNavigate={navigate}
          unreadMatches={unreadMatches}
        />
      )}

      {/* Authentication & Verification Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
export default App;
