import React, { useEffect, useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { CampusEvent, EventCategory, Profile } from '../types';

interface EventsPageProps {
  currentUser: Profile;
}

export const EventsPage: React.FC<EventsPageProps> = ({ currentUser }) => {
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const categories = [
    'All',
    'Acoustic Social Mixer',
    'Chess Meetups',
    'Photography Walks',
    'Coffee Meetups',
    'Movie Nights',
    'Community Activities'
  ];

  const loadEvents = async () => {
    try {
      const res = await api.getEvents();
      setEvents(res.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleToggleRsvp = async (id: string) => {
    try {
      const res = await api.toggleEventRsvp(id);
      setEvents(prev => prev.map(e => e.id === id ? {
        ...e,
        is_registered: res.is_registered,
        current_participants_count: res.count
      } : e));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = events.filter(e => {
    if (selectedCategory === 'All') return true;
    return e.category === selectedCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[#f3f4f6]">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#151a25] to-[#1d2636] border border-[#2b3548] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#d9b978] font-semibold mb-1">
            <Calendar className="w-4 h-4" />
            <span>Campus Buzz & Student Activities</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f3f4f6]">
            Campus Buzz Events
          </h1>
          <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
            Discover mixers, acoustic jams, photo walks, and social activities across HBTU.
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-[#d9b978] text-[#101827] font-bold shadow-sm'
                : 'bg-[#151a25] text-[#9ca3af] hover:text-[#f3f4f6] border border-[#2b3548]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-[#9ca3af] animate-pulse">
            Loading upcoming campus activities...
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-[#151a25] border border-[#2b3548] text-[#9ca3af] text-xs">
            No events scheduled in this category yet.
          </div>
        ) : (
          filtered.map((evt) => (
            <div
              key={evt.id}
              className="rounded-2xl bg-[#151a25] border border-[#2b3548] overflow-hidden flex flex-col justify-between hover:border-[#d9b978]/40 transition-colors"
            >
              <div>
                <div className="h-44 bg-[#101827] relative overflow-hidden">
                  <img
                    src={evt.image_url || '/src/assets/images/campus_event_vibe_1793616895121.jpg'}
                    alt={evt.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-[#101827]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#2b3548] text-[10px] text-[#d9b978] font-bold">
                    {evt.category}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-[#f3f4f6] leading-snug">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-[#9ca3af] line-clamp-3 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-[#1d2636] text-xs text-[#9ca3af]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#d9b978]" />
                      <span>{new Date(evt.event_date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#e879a9]" />
                      <span className="truncate">{evt.venue_meeting_point}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#4ade80]" />
                      <span>{evt.current_participants_count} / {evt.max_participants} registered</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RSVP Action */}
              <div className="p-4 bg-[#101827]/40 border-t border-[#1d2636] flex items-center justify-between">
                <span className="text-[11px] text-[#9ca3af]">
                  Organized by: {evt.organizer_name}
                </span>

                <button
                  onClick={() => handleToggleRsvp(evt.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                    evt.is_registered
                      ? 'bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/40'
                      : 'bg-[#d9b978] text-[#101827] hover:bg-[#c9a968]'
                  }`}
                >
                  {evt.is_registered ? 'Registered ✓' : 'RSVP Free'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
