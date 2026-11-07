import React from 'react';
import { Home, Compass, Heart, MessageSquareQuote, Menu } from 'lucide-react';

interface BottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  unreadMatches: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentPath,
  onNavigate,
  unreadMatches,
}) => {
  const tabs = [
    { id: '/home', label: 'Home', icon: Home },
    { id: '/discover', label: 'Discover', icon: Compass },
    { id: '/matches', label: 'Matches', icon: Heart, badge: unreadMatches > 0 ? unreadMatches : undefined },
    { id: '/confessions', label: 'Confess', icon: MessageSquareQuote },
    { id: '/communities', label: 'Campus', icon: Menu },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#101827]/95 backdrop-blur-md border-t border-[#1d2636] px-2 py-1">
      <div className="grid grid-cols-5 items-center h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPath === tab.id || (tab.id === '/matches' && currentPath === '/messages');
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] w-full text-center focus:outline-none relative group"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-[#d9b978]' : 'text-[#9ca3af] group-hover:text-[#f3f4f6]'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-[#e879a9] text-[#101827] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive ? 'text-[#d9b978] font-semibold' : 'text-[#9ca3af]'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-[#d9b978] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
