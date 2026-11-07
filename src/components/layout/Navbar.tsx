import React from 'react';
import { 
  Bell, 
  ShieldCheck, 
  SlidersHorizontal, 
  Sparkles, 
  Users, 
  Heart, 
  MessageCircle, 
  Flame, 
  Compass, 
  LogOut, 
  Lock,
  UserCheck
} from 'lucide-react';
import { Profile } from '../../types';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  currentUser: Profile | null;
  isAdmin: boolean;
  unreadCount: number;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  currentUser,
  isAdmin,
  unreadCount,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#101827]/95 backdrop-blur-md border-b border-[#1d2636] px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark with subtle AC connection monogram */}
        <button 
          onClick={() => onNavigate(currentUser ? '/home' : '/')}
          className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1d2636] to-[#151a25] border border-[#d9b978]/30 flex items-center justify-center text-[#d9b978] group-hover:border-[#e879a9]/60 transition-colors shadow-sm">
            <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
              {/* Sophisticated AC Monogram with subtle linked loop */}
              <path 
                d="M7 23L12 8L17 23M9.5 17.5H14.5" 
                stroke="#D9B978" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d="M26 11.5C24.5 9.5 22 9 19.5 10C17 11 16 14.5 16.5 17C17 19.5 19 23 22.5 23C25 23 26.5 21 26.5 21" 
                stroke="#E879A9" 
                strokeWidth="2.2" 
                strokeLinecap="round" 
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-extrabold text-base lg:text-lg tracking-wider text-[#f3f4f6] whitespace-nowrap">
              AFTER<span className="text-[#d9b978]">CLASS</span>
            </span>
            <span className="text-[10px] tracking-widest uppercase text-[#9ca3af] hidden sm:block">
              HBTU Kanpur
            </span>
          </div>
        </button>

        {/* Zone 2: Clean 4–5 single-line navigation links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#9ca3af]">
          {currentUser ? (
            <>
              <button
                onClick={() => onNavigate('/home')}
                className={`hover:text-[#f3f4f6] transition-colors whitespace-nowrap ${currentPath === '/home' ? 'text-[#d9b978] font-semibold' : ''}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('/discover')}
                className={`hover:text-[#f3f4f6] transition-colors whitespace-nowrap ${currentPath === '/discover' ? 'text-[#d9b978] font-semibold' : ''}`}
              >
                Discover
              </button>
              <button
                onClick={() => onNavigate('/confessions')}
                className={`hover:text-[#f3f4f6] transition-colors whitespace-nowrap ${currentPath === '/confessions' ? 'text-[#d9b978] font-semibold' : ''}`}
              >
                Confessions
              </button>
              <button
                onClick={() => onNavigate('/communities')}
                className={`hover:text-[#f3f4f6] transition-colors whitespace-nowrap ${currentPath === '/communities' ? 'text-[#d9b978] font-semibold' : ''}`}
              >
                Communities
              </button>
              <button
                onClick={() => onNavigate('/events')}
                className={`hover:text-[#f3f4f6] transition-colors whitespace-nowrap ${currentPath === '/events' ? 'text-[#d9b978] font-semibold' : ''}`}
              >
                Campus Buzz
              </button>
              <button
                onClick={() => onNavigate('/couples')}
                className={`hover:text-[#f3f4f6] transition-colors whitespace-nowrap ${currentPath === '/couples' ? 'text-[#e879a9] font-semibold' : ''}`}
              >
                Couples Corner
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('/how-it-works')}
                className={`hover:text-[#f3f4f6] transition-colors whitespace-nowrap ${currentPath === '/how-it-works' ? 'text-[#d9b978]' : ''}`}
              >
                How It Works
              </button>
              <button
                onClick={() => onNavigate('/safety')}
                className={`hover:text-[#f3f4f6] transition-colors whitespace-nowrap ${currentPath === '/safety' ? 'text-[#d9b978]' : ''}`}
              >
                Safety & Verification
              </button>
              <button
                onClick={() => onNavigate('/about')}
                className={`hover:text-[#f3f4f6] transition-colors whitespace-nowrap ${currentPath === '/about' ? 'text-[#d9b978]' : ''}`}
              >
                About Campus
              </button>
              <button
                onClick={() => onNavigate('/community-guidelines')}
                className={`hover:text-[#f3f4f6] transition-colors whitespace-nowrap ${currentPath === '/community-guidelines' ? 'text-[#d9b978]' : ''}`}
              >
                Guidelines
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action zone */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* In-app Notification Bell */}
              <button
                onClick={() => onNavigate('/notifications')}
                className="relative p-2 rounded-xl text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#1d2636] transition-colors"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#e879a9]" />
                )}
              </button>

              {/* Admin Portal Shortcut if authorized */}
              {isAdmin && (
                <button
                  onClick={() => onNavigate('/admin')}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    currentPath.startsWith('/admin')
                      ? 'bg-[#d9b978]/20 border-[#d9b978] text-[#d9b978]'
                      : 'border-[#d9b978]/40 text-[#d9b978] hover:bg-[#d9b978]/10'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Admin
                </button>
              )}

              {/* User Profile Avatar Pill */}
              <button
                onClick={() => onNavigate('/profile')}
                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-[#1d2636] border border-[#2b3548] hover:border-[#d9b978]/50 transition-colors"
              >
                <img
                  src={currentUser.avatar_url || 'https://placehold.co/100'}
                  alt={currentUser.display_name}
                  className="w-7 h-7 rounded-full object-cover border border-[#d9b978]/30"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs font-medium text-[#f3f4f6] hidden sm:inline max-w-[90px] truncate">
                  {currentUser.display_name}
                </span>
                {currentUser.is_student_verified && (
                  <span title="Verified HBTU Student">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" />
                  </span>
                )}
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-[#9ca3af] hover:text-[#f87171] hover:bg-[#1d2636] transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3.5 py-1.5 text-xs font-medium text-[#f3f4f6] hover:text-[#d9b978] transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-4 py-2 text-xs font-medium text-[#101827] bg-[#d9b978] hover:bg-[#c9a968] rounded-xl transition-all shadow-sm font-semibold active:scale-[0.98]"
              >
                Join HBTU Network
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
