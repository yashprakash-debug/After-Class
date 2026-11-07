import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Heart, 
  MessageSquareQuote, 
  Calendar, 
  Coffee, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Users, 
  Flame,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { Profile, Match, Confession, CampusEvent, CampusPoll } from '../types';

interface HomeDashboardProps {
  currentUser: Profile;
  onNavigate: (path: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ currentUser, onNavigate }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [polls, setPolls] = useState<CampusPoll[]>([]);
  const [suggestedProfiles, setSuggestedProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [mRes, cRes, eRes, pRes, dRes] = await Promise.all([
          api.getMatches(),
          api.getConfessions(),
          api.getEvents(),
          api.getPolls(),
          api.getDiscoverProfiles()
        ]);
        setMatches(mRes?.matches || []);
        setConfessions(cRes?.confessions?.slice(0, 3) || []);
        setEvents(eRes?.events?.slice(0, 3) || []);
        setPolls(pRes?.polls || []);
        setSuggestedProfiles(dRes?.profiles?.slice(0, 3) || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleVotePoll = async (pollId: string, optId: string) => {
    try {
      const res = await api.votePoll(pollId, optId);
      setPolls(prev => prev.map(p => p.id === pollId ? res.poll : p));
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate profile completion percentage
  let completedPoints = 0;
  if (currentUser.bio && currentUser.bio.length > 10) completedPoints += 25;
  if (currentUser.avatar_url) completedPoints += 25;
  if (currentUser.interests && currentUser.interests.length >= 3) completedPoints += 25;
  if (currentUser.personality_answers && Object.keys(currentUser.personality_answers).length >= 3) completedPoints += 25;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#f3f4f6]">
      {/* 1. WELCOME HERO & PROFILE COMPLETION BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-[#151a25] to-[#1d2636] border border-[#2b3548] p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#d9b978] font-medium mb-1">
              <span>HBTU Student Portal</span>
              <span aria-hidden="true">·</span>
              <span>{currentUser.branch}</span>
              <span aria-hidden="true">·</span>
              <span>{currentUser.academic_year}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#f3f4f6]">
              Hello, {currentUser.display_name}
            </h1>
            <p className="text-xs sm:text-sm text-[#9ca3af] mt-1 max-w-xl">
              Discover what’s happening beyond classrooms across West & East Campus today.
            </p>
          </div>

          {/* Profile Completion Widget */}
          <div className="bg-[#101827]/70 backdrop-blur-sm border border-[#2b3548] rounded-xl p-4 min-w-[240px]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-[#f3f4f6]">Profile Strength</span>
              <span className="font-mono text-[#d9b978] font-bold">{completedPoints}%</span>
            </div>
            <div className="w-full bg-[#151a25] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#d9b978] to-[#e879a9] h-full rounded-full transition-all duration-500" 
                style={{ width: `${completedPoints}%` }}
              />
            </div>
            {completedPoints < 100 && (
              <button
                onClick={() => onNavigate('/profile')}
                className="text-[11px] text-[#d9b978] hover:underline mt-2 flex items-center gap-1 font-medium"
              >
                <span>Add interests & personality traits</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. CORE DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Suggested Connections, Matches, Confessions */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* A. Suggested Connections (Calculated Compatibility) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#f3f4f6]">Suggested Connections</h2>
                <p className="text-xs text-[#9ca3af]">Based on shared interests and campus vibes</p>
              </div>
              <button
                onClick={() => onNavigate('/discover')}
                className="text-xs text-[#d9b978] font-semibold hover:underline flex items-center gap-1"
              >
                <span>Explore all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {suggestedProfiles.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#151a25] border border-[#2b3548] text-center space-y-2">
                <p className="text-sm font-semibold text-[#f3f4f6]">No student suggestions yet.</p>
                <p className="text-xs text-[#9ca3af]">Check back soon or explore campus peers in the Discover tab.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {suggestedProfiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="rounded-2xl bg-[#151a25] border border-[#2b3548] overflow-hidden hover:border-[#d9b978]/40 transition-colors flex flex-col justify-between"
                  >
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.display_name)}&backgroundColor=151a25&textColor=d9b978`}
                            alt={profile.display_name}
                            className="w-9 h-9 rounded-full object-cover border border-[#2b3548]"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="text-sm font-semibold text-[#f3f4f6] leading-none">{profile.display_name}</h4>
                            <span className="text-[10px] text-[#9ca3af]">{profile.branch?.split(' ')[0] || 'HBTU'}</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#d9b978] bg-[#1d2636] px-1.5 py-0.5 rounded">
                          {profile.compatibilityScore || 85}%
                        </span>
                      </div>

                      <p className="text-xs text-[#9ca3af] line-clamp-2 pt-1">
                        {profile.bio}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {profile.interests?.slice(0, 2).map((i: string) => (
                          <span key={i} className="text-[10px] text-[#f3f4f6]/70 px-1.5 py-0.5 rounded bg-[#101827]">
                            {i}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 border-t border-[#1d2636] bg-[#101827]/40 flex items-center justify-between">
                      <button
                        onClick={() => onNavigate('/discover')}
                        className="text-xs text-[#d9b978] hover:underline font-medium"
                      >
                        View profile
                      </button>
                      <button
                        onClick={() => onNavigate('/discover')}
                        className="p-1.5 rounded-lg bg-[#d9b978] text-[#101827] hover:bg-[#c9a968] transition-colors"
                        title="Connect"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* B. Active Mutual Matches */}
          {matches.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#f3f4f6]">Mutual Matches</h2>
                  <p className="text-xs text-[#9ca3af]">Students who mutually liked your profile</p>
                </div>
                <button
                  onClick={() => onNavigate('/matches')}
                  className="text-xs text-[#e879a9] font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Open chats</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {matches.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onNavigate('/matches')}
                    className="p-3.5 rounded-2xl bg-[#151a25] border border-[#2b3548] hover:border-[#e879a9]/40 cursor-pointer transition-colors flex items-center gap-3"
                  >
                    <img
                      src={m.otherProfile?.avatar_url || 'https://placehold.co/100'}
                      alt={m.otherProfile?.display_name || 'Match'}
                      className="w-11 h-11 rounded-full object-cover border border-[#e879a9]/30"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#f3f4f6] truncate">{m.otherProfile?.display_name}</span>
                        <span className="text-[10px] text-[#9ca3af]">{m.lastMessageTime}</span>
                      </div>
                      <p className="text-xs text-[#9ca3af] truncate mt-0.5">
                        {m.lastMessage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* C. Trending Approved Confessions */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#f3f4f6]">Campus Confessions</h2>
                <p className="text-xs text-[#9ca3af]">Approved stories and appreciation from HBTU peers</p>
              </div>
              <button
                onClick={() => onNavigate('/confessions')}
                className="text-xs text-[#d9b978] font-semibold hover:underline flex items-center gap-1"
              >
                <span>Read all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {confessions.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] text-center space-y-2">
                <p className="text-xs font-semibold text-[#f3f4f6]">No campus confessions posted yet.</p>
                <p className="text-[11px] text-[#9ca3af]">Be the first to share an anonymous thought with your campus peers!</p>
                <button
                  onClick={() => onNavigate('/confessions')}
                  className="text-xs text-[#e879a9] hover:underline font-semibold mt-1 inline-block"
                >
                  Post Anonymous Confession
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {confessions.map((conf) => (
                  <div
                    key={conf.id}
                    className="p-4 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-2 hover:border-[#2b3548]/80 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs text-[#9ca3af]">
                      <span className="text-[#e879a9] font-medium">{conf.category}</span>
                      <span>{new Date(conf.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#f3f4f6] leading-relaxed">
                      "{conf.content}"
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#9ca3af] pt-1">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-[#e879a9]" />
                        <span>{conf.likes_count}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquareQuote className="w-3.5 h-3.5 text-[#d9b978]" />
                        <span>{conf.comments_count}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Right Column (4 cols): Poll of the Day, Campus Buzz Events, Date Idea */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Daily Campus Poll */}
          {polls.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#d9b978]">
                <Flame className="w-4 h-4" />
                <span>Campus Question of the Day</span>
              </div>
              <h3 className="text-sm font-semibold text-[#f3f4f6]">
                {polls[0].question}
              </h3>

              <div className="space-y-2 pt-1">
                {polls[0].options.map((opt) => {
                  const isSelected = polls[0].user_voted_option_id === opt.id;
                  const pct = polls[0].total_votes > 0 ? Math.round((opt.votes / polls[0].total_votes) * 100) : 0;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleVotePoll(polls[0].id, opt.id)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all relative overflow-hidden ${
                        isSelected 
                          ? 'border-[#d9b978] bg-[#d9b978]/10 text-[#f3f4f6] font-medium' 
                          : 'border-[#2b3548] bg-[#101827] text-[#9ca3af] hover:border-[#d9b978]/40'
                      }`}
                    >
                      <div 
                        className="absolute inset-y-0 left-0 bg-[#d9b978]/10 pointer-events-none" 
                        style={{ width: `${pct}%` }}
                      />
                      <div className="flex items-center justify-between relative z-10">
                        <span className="truncate pr-2">{opt.text}</span>
                        <span className="font-mono text-[10px] shrink-0 font-bold">{pct}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="text-[10px] text-[#9ca3af] text-right">
                {polls[0].total_votes} votes recorded
              </div>
            </div>
          )}

          {/* Date Idea of the Day (Kanpur Verified) */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#151a25] to-[#1d2636] border border-[#2b3548] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#d9b978] font-semibold">
                <Coffee className="w-4 h-4" />
                <span>Date Idea of the Day</span>
              </div>
              <span className="text-[11px] text-[#4ade80] font-mono">₹100 Budget</span>
            </div>
            <h4 className="text-sm font-bold text-[#f3f4f6]">Sunset Promenade at Ganga Barrage</h4>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Evening breeze stroll along the river walkway followed by fresh kulhad chai and bun makkhan at the river stalls.
            </p>
            <button
              onClick={() => onNavigate('/date-planner')}
              className="text-xs text-[#d9b978] hover:underline font-semibold flex items-center gap-1 pt-1"
            >
              <span>Explore full Kanpur itinerary</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Upcoming Campus Buzz Events */}
          <div className="p-5 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#d9b978] font-semibold">
                <Calendar className="w-4 h-4" />
                <span>Campus Buzz Events</span>
              </div>
              <button
                onClick={() => onNavigate('/events')}
                className="text-xs text-[#9ca3af] hover:text-[#f3f4f6]"
              >
                All
              </button>
            </div>

            <div className="space-y-3">
              {events.map((evt) => (
                <div key={evt.id} className="p-3 rounded-xl bg-[#101827] border border-[#2b3548] space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#9ca3af]">
                    <span className="text-[#d9b978] font-medium">{evt.category}</span>
                    <span>{new Date(evt.event_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <h5 className="text-xs font-semibold text-[#f3f4f6] line-clamp-1">{evt.title}</h5>
                  <div className="flex items-center gap-1 text-[10px] text-[#9ca3af]">
                    <MapPin className="w-3 h-3 text-[#d9b978]" />
                    <span className="truncate">{evt.venue_meeting_point}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('/events')}
              className="w-full py-2 bg-[#1d2636] hover:bg-[#253247] text-xs font-semibold text-[#f3f4f6] rounded-xl border border-[#2b3548] transition-colors"
            >
              View & RSVP Events
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
