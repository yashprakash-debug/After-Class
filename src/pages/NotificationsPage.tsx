import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  Heart, 
  MessageSquare, 
  Calendar, 
  Sparkles, 
  CheckCheck, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { AppNotification, Profile } from '../types';

interface NotificationsPageProps {
  currentUser: Profile;
  onNavigate: (path: string) => void;
  onRefreshUnread: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  currentUser,
  onNavigate,
  onRefreshUnread
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifs = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      onRefreshUnread();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_match':
        return <Heart className="w-4 h-4 text-[#e879a9] fill-current" />;
      case 'new_message':
        return <MessageSquare className="w-4 h-4 text-[#d9b978]" />;
      case 'secret_admirer_mutual':
        return <Sparkles className="w-4 h-4 text-[#e879a9]" />;
      case 'event_reminder':
        return <Calendar className="w-4 h-4 text-[#4ade80]" />;
      case 'couple_invite':
        return <Heart className="w-4 h-4 text-[#d9b978]" />;
      default:
        return <Bell className="w-4 h-4 text-[#9ca3af]" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[#f3f4f6]">
      <div className="flex items-center justify-between p-6 rounded-2xl bg-[#151a25] border border-[#2b3548]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#f3f4f6]">Campus Notifications</h1>
          <p className="text-xs text-[#9ca3af] mt-0.5">Stay updated on matches, messages, and events</p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-3.5 py-1.5 text-xs text-[#d9b978] hover:text-[#f3f4f6] border border-[#2b3548] rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark all as read</span>
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#9ca3af] animate-pulse">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-2">
            <Bell className="w-10 h-10 text-[#2b3548] mx-auto" />
            <h4 className="text-sm font-semibold text-[#f3f4f6]">No notifications yet</h4>
            <p className="text-xs text-[#9ca3af]">When you match, receive messages, or event updates, they will appear here.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => n.link_url && onNavigate(n.link_url)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                n.is_read
                  ? 'bg-[#151a25]/60 border-[#2b3548] text-[#9ca3af]'
                  : 'bg-[#151a25] border-[#d9b978]/40 shadow-sm'
              }`}
            >
              <div className="p-2 rounded-xl bg-[#101827] border border-[#2b3548] shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className={`text-xs sm:text-sm font-semibold ${n.is_read ? 'text-[#f3f4f6]' : 'text-[#d9b978]'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-[#9ca3af] font-mono">
                    {new Date(n.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  {n.message}
                </p>
              </div>

              {n.link_url && (
                <ArrowRight className="w-4 h-4 text-[#9ca3af] shrink-0 self-center" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
