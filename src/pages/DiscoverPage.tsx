import React, { useEffect, useState } from 'react';
import { 
  Heart, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Filter, 
  Search, 
  UserPlus, 
  MoreVertical, 
  Flag, 
  Ban, 
  CheckCircle2, 
  Info,
  ChevronRight,
  Coffee,
  Compass
} from 'lucide-react';
import { api } from '../services/api';
import { Profile, Match } from '../types';

interface DiscoverPageProps {
  currentUser: Profile;
  onNavigate: (path: string) => void;
}

export const DiscoverPage: React.FC<DiscoverPageProps> = ({ currentUser, onNavigate }) => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedPreference, setSelectedPreference] = useState('All');

  // Modals
  const [selectedProfileModal, setSelectedProfileModal] = useState<any | null>(null);
  const [mutualMatchModal, setMutualMatchModal] = useState<{ match: Match; profile: any } | null>(null);
  const [reportModalProfile, setReportModalProfile] = useState<any | null>(null);
  const [reportReason, setReportReason] = useState('Inappropriate content');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSent, setReportSent] = useState(false);

  // AI Icebreaker Suggestions
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [loadingIcebreakers, setLoadingIcebreakers] = useState(false);

  const branches = [
    'All',
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics Engineering',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Chemical Engineering',
    'Civil Engineering',
    'Biochemical Engineering'
  ];

  const years = ['All', '1st Year', '2nd Year', '3rd Year', 'Final Year'];
  const preferences = ['All', 'dating', 'friendship', 'study_partner', 'activity_partner'];

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const res = await api.getDiscoverProfiles({
        branch: selectedBranch,
        year: selectedYear,
        preference: selectedPreference,
        search
      });
      setProfiles(res.profiles || []);
      setCurrentIndex(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [selectedBranch, selectedYear, selectedPreference]);

  const handleLike = async (profile: any) => {
    try {
      const res = await api.likeProfile(profile.id);
      if (res.isMutual && res.match) {
        setMutualMatchModal({ match: res.match, profile });
        // Request Gemini conversation starters for this match
        setLoadingIcebreakers(true);
        api.getAiAssistance('conversation_starters', {
          interests: profile.interests,
          branch: profile.branch
        }).then(aiRes => {
          setIcebreakers(aiRes.suggestions || []);
          setLoadingIcebreakers(false);
        }).catch(() => setLoadingIcebreakers(false));
      }
      // Update local card status
      setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, isLiked: true } : p));
      setCurrentIndex(prev => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePass = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalProfile) return;
    try {
      await api.submitReport({
        targetType: 'profile',
        targetId: reportModalProfile.id,
        reason: reportReason,
        details: reportDetails
      });
      setReportSent(true);
      setTimeout(() => {
        setReportSent(false);
        setReportModalProfile(null);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const currentCard = profiles[currentIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[#f3f4f6]">
      {/* Top Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-[#151a25] border border-[#2b3548]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#9ca3af] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadProfiles()}
            placeholder="Search by student name, bio, or interest (e.g. Chess, Coding)..."
            className="w-full pl-10 pr-4 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs sm:text-sm text-[#f3f4f6] placeholder-[#9ca3af]/60 focus:outline-none focus:border-[#d9b978]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6] focus:outline-none focus:border-[#d9b978]"
          >
            {branches.map(b => (
              <option key={b} value={b}>{b === 'All' ? 'All Branches' : b.split(' ')[0]}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6] focus:outline-none focus:border-[#d9b978]"
          >
            {years.map(y => (
              <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>
            ))}
          </select>

          <select
            value={selectedPreference}
            onChange={(e) => setSelectedPreference(e.target.value)}
            className="px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6] focus:outline-none focus:border-[#d9b978]"
          >
            <option value="All">All Connections</option>
            <option value="dating">Dating</option>
            <option value="friendship">Friendship</option>
            <option value="study_partner">Study Partner</option>
            <option value="activity_partner">Activity Partner</option>
          </select>
        </div>
      </div>

      {/* Main Discovery Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive Discovery Card (8 cols) */}
        <div className="lg:col-span-8 flex flex-col items-center">
          {loading ? (
            <div className="w-full max-w-lg h-96 rounded-2xl bg-[#151a25] border border-[#2b3548] animate-pulse flex items-center justify-center text-xs text-[#9ca3af]">
              Scanning campus profiles & compatibility weights...
            </div>
          ) : currentCard ? (
            <div className="w-full max-w-md rounded-3xl bg-[#151a25] border border-[#2b3548] overflow-hidden shadow-2xl relative">
              {/* Photo & Scrim */}
              <div className="relative h-96 w-full bg-[#101827]">
                <img
                  src={currentCard.avatar_url || 'https://placehold.co/400x500'}
                  alt={currentCard.display_name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#151a25] via-[#151a25]/30 to-transparent" />

                {/* Top Floating Match Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="text-xs font-mono font-extrabold text-[#101827] bg-[#d9b978] px-2.5 py-1 rounded-full shadow-md">
                    {currentCard.compatibilityScore}% Compatibility
                  </span>
                  {currentCard.hasLikedCurrentUser && (
                    <span className="text-xs font-semibold text-[#101827] bg-[#e879a9] px-2.5 py-1 rounded-full shadow-md animate-pulse">
                      Liked You!
                    </span>
                  )}
                </div>

                {/* More / Flag trigger */}
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setReportModalProfile(currentCard)}
                    className="p-2 rounded-full bg-black/40 text-[#9ca3af] hover:text-[#f3f4f6] backdrop-blur-md transition-colors"
                    title="Report or block"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>

                {/* Identity overlay on photo bottom */}
                <div className="absolute bottom-4 left-4 right-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold text-[#f3f4f6]">
                      {currentCard.display_name}
                    </h2>
                    {currentCard.is_student_verified && (
                      <span title="Verified HBTU Student">
                        <ShieldCheck className="w-5 h-5 text-[#4ade80]" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#d9b978]">
                    <span>{currentCard.branch}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentCard.academic_year}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                {/* Bio */}
                <p className="text-sm text-[#f3f4f6] leading-relaxed">
                  "{currentCard.bio}"
                </p>

                {/* Interests Chips */}
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#9ca3af] block mb-2">
                    Interests & Activities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentCard.interests?.map((interest: string) => {
                      const isCommon = currentUser.interests?.includes(interest);
                      return (
                        <span
                          key={interest}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                            isCommon
                              ? 'bg-[#d9b978]/20 border-[#d9b978] text-[#d9b978] font-medium'
                              : 'bg-[#101827] border-[#2b3548] text-[#f3f4f6]/80'
                          }`}
                        >
                          {interest} {isCommon && '★'}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Personality Vibe Answers */}
                {currentCard.personality_answers && Object.keys(currentCard.personality_answers).length > 0 && (
                  <div className="p-3.5 rounded-xl bg-[#101827] border border-[#2b3548] space-y-2 text-xs">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#9ca3af] block">
                      Campus Personality Traits
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs text-[#9ca3af]">
                      {Object.entries(currentCard.personality_answers).map(([key, val]) => (
                        <div key={key} className="space-y-0.5">
                          <span className="text-[10px] text-[#9ca3af]/70 capitalize">{key}:</span>
                          <p className="text-[#f3f4f6] font-medium truncate">{val as string}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendation Weights Breakdown preview */}
                <div className="pt-2 border-t border-[#2b3548] flex items-center justify-between text-xs text-[#9ca3af]">
                  <span>Common Interests: {currentCard.matchBreakdown?.commonInterests?.length || 0} shared</span>
                  <button
                    onClick={() => setSelectedProfileModal(currentCard)}
                    className="text-[#d9b978] hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Full breakdown</span>
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Action Controls: Pass, Like, View */}
                <div className="pt-4 border-t border-[#2b3548] flex items-center justify-center gap-6">
                  {/* Pass */}
                  <button
                    onClick={handlePass}
                    className="w-14 h-14 rounded-full bg-[#101827] border border-[#2b3548] text-[#9ca3af] hover:text-[#f87171] hover:border-[#f87171]/40 flex items-center justify-center transition-all shadow-md active:scale-95"
                    title="Pass for now"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {/* View Details */}
                  <button
                    onClick={() => setSelectedProfileModal(currentCard)}
                    className="w-12 h-12 rounded-full bg-[#101827] border border-[#2b3548] text-[#d9b978] hover:bg-[#d9b978]/10 flex items-center justify-center transition-all shadow-md active:scale-95"
                    title="Inspect Profile"
                  >
                    <Info className="w-5 h-5" />
                  </button>

                  {/* Like */}
                  <button
                    onClick={() => handleLike(currentCard)}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-[#d9b978] to-[#e879a9] text-[#101827] flex items-center justify-center transition-all shadow-lg shadow-[#d9b978]/20 hover:scale-105 active:scale-95 font-bold"
                    title="Like Profile"
                  >
                    <Heart className="w-6 h-6 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="w-full max-w-md p-10 rounded-2xl bg-[#151a25] border border-[#2b3548] text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#1d2636] text-[#d9b978] flex items-center justify-center mx-auto">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#f3f4f6]">No students found matching this filter</h3>
              <p className="text-xs text-[#9ca3af] max-w-xs mx-auto">
                No verified HBTU profiles match your current branch or year filter. Try resetting your search filters or inviting your batchmates.
              </p>
              <button
                onClick={() => {
                  setSelectedBranch('All');
                  setSelectedYear('All');
                  setSelectedPreference('All');
                  setSearch('');
                  loadProfiles();
                }}
                className="px-4 py-2 bg-[#d9b978] text-[#101827] text-xs font-semibold rounded-xl"
              >
                Show All HBTU Students
              </button>
            </div>
          ) : (
            <div className="w-full max-w-md p-10 rounded-2xl bg-[#151a25] border border-[#2b3548] text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#1d2636] text-[#d9b978] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#f3f4f6]">You’ve explored all campus profiles!</h3>
              <p className="text-xs text-[#9ca3af] max-w-xs mx-auto">
                You’ve reviewed all discoverable HBTU students matching your active filters. Check back later or adjust your branch & year filters.
              </p>
              <button
                onClick={() => {
                  setSelectedBranch('All');
                  setSelectedYear('All');
                  setSelectedPreference('All');
                  setSearch('');
                  setCurrentIndex(0);
                }}
                className="px-4 py-2 bg-[#d9b978] text-[#101827] text-xs font-semibold rounded-xl"
              >
                Reset Discovery Filters
              </button>
            </div>
          )}
        </div>

        {/* Right: Recommendation Algorithm Explanation & Active Filters (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4">
            <div className="flex items-center gap-2 text-xs text-[#d9b978] font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Matching Algorithm Breakdown</span>
            </div>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              We never rank students by superficial attractiveness. Connections are recommended using a weighted, transparent formula:
            </p>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#f3f4f6]">Shared Interests & Passions</span>
                  <span className="font-mono text-[#d9b978] font-bold">40%</span>
                </div>
                <div className="w-full bg-[#101827] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#d9b978] h-full w-[40%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#f3f4f6]">Personality Quiz Alignment</span>
                  <span className="font-mono text-[#d9b978] font-bold">25%</span>
                </div>
                <div className="w-full bg-[#101827] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#d9b978] h-full w-[25%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#f3f4f6]">Common Campus Activities</span>
                  <span className="font-mono text-[#d9b978] font-bold">20%</span>
                </div>
                <div className="w-full bg-[#101827] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#d9b978] h-full w-[20%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#f3f4f6]">Mutual Connection Intent</span>
                  <span className="font-mono text-[#d9b978] font-bold">15%</span>
                </div>
                <div className="w-full bg-[#101827] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#d9b978] h-full w-[15%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Safety & Consent Reminder */}
          <div className="p-4 rounded-xl bg-[#1d2636]/40 border border-[#2b3548] text-xs text-[#9ca3af] space-y-1.5">
            <span className="font-semibold text-[#f3f4f6] block">Privacy & Double Consent:</span>
            <p>
              Sending a like is completely confidential. A match and conversation are only unlocked when both students independently express mutual interest.
            </p>
          </div>
        </div>
      </div>

      {/* MODAL 1: MUTUAL MATCH CELEBRATION */}
      {mutualMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-[#151a25] border border-[#d9b978] p-6 text-center space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-[#e879a9]/20 text-[#e879a9] flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7 fill-current animate-bounce" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest font-extrabold text-[#d9b978]">
                It’s a Mutual Match!
              </span>
              <h2 className="text-2xl font-extrabold text-[#f3f4f6] mt-1">
                You and {mutualMatchModal.profile.display_name} liked each other!
              </h2>
              <p className="text-xs text-[#9ca3af] mt-1">
                Both of you independently connected. Messaging is now open!
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 py-2">
              <img
                src={currentUser.avatar_url || 'https://placehold.co/100'}
                alt={currentUser.display_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#d9b978]"
                referrerPolicy="no-referrer"
              />
              <Heart className="w-6 h-6 text-[#e879a9] fill-current" />
              <img
                src={mutualMatchModal.profile.avatar_url || 'https://placehold.co/100'}
                alt={mutualMatchModal.profile.display_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#d9b978]"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* AI Icebreaker Suggestions */}
            <div className="text-left bg-[#101827] p-4 rounded-2xl border border-[#2b3548] space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-[#d9b978] font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gemini AI Conversation Starters:</span>
              </div>
              {loadingIcebreakers ? (
                <div className="text-[11px] text-[#9ca3af] animate-pulse">Generating personalized icebreakers...</div>
              ) : (
                <ul className="space-y-1.5 text-xs text-[#f3f4f6]">
                  {icebreakers.slice(0, 2).map((starter, i) => (
                    <li key={i} className="p-2 rounded bg-[#151a25] border border-[#2b3548]/60 text-[11px]">
                      "{starter}"
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setMutualMatchModal(null);
                  onNavigate('/matches');
                }}
                className="w-full py-3 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] font-bold text-sm rounded-xl transition-all shadow-md"
              >
                Start Chatting
              </button>
              <button
                onClick={() => setMutualMatchModal(null)}
                className="w-full py-2.5 text-xs text-[#9ca3af] hover:text-[#f3f4f6]"
              >
                Keep Exploring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FULL PROFILE INSPECTION */}
      {selectedProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-[#151a25] border border-[#2b3548] p-6 space-y-5 shadow-2xl relative my-8">
            <button
              onClick={() => setSelectedProfileModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#1d2636]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <img
                src={selectedProfileModal.avatar_url || 'https://placehold.co/100'}
                alt={selectedProfileModal.display_name}
                className="w-16 h-16 rounded-full object-cover border border-[#2b3548]"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-[#f3f4f6]">{selectedProfileModal.full_name}</h3>
                  <ShieldCheck className="w-4 h-4 text-[#4ade80]" />
                </div>
                <p className="text-xs text-[#d9b978]">{selectedProfileModal.branch} · {selectedProfileModal.academic_year}</p>
                <p className="text-xs text-[#9ca3af]">Looking for: {selectedProfileModal.connection_preferences?.join(', ')}</p>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider block mb-1">About</span>
              <p className="text-sm text-[#f3f4f6] leading-relaxed bg-[#101827] p-3 rounded-xl border border-[#2b3548]">
                {selectedProfileModal.bio}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider block mb-1">Compatibility Breakdown</span>
              <div className="p-3 bg-[#101827] rounded-xl border border-[#2b3548] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#9ca3af]">Overall Score</span>
                  <span className="font-mono text-[#d9b978] font-bold">{selectedProfileModal.compatibilityScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9ca3af]">Interests Alignment (40%)</span>
                  <span>{selectedProfileModal.matchBreakdown?.sharedInterestsScore || 0}/40</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9ca3af]">Personality Similarity (25%)</span>
                  <span>{selectedProfileModal.matchBreakdown?.personalityScore || 0}/25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9ca3af]">Campus Activities (20%)</span>
                  <span>{selectedProfileModal.matchBreakdown?.commonActivitiesScore || 0}/20</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  handleLike(selectedProfileModal);
                  setSelectedProfileModal(null);
                }}
                className="flex-1 py-2.5 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] font-semibold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>Like Profile</span>
              </button>
              <button
                onClick={() => setSelectedProfileModal(null)}
                className="px-4 py-2.5 bg-[#1d2636] hover:bg-[#253247] text-xs font-medium text-[#f3f4f6] rounded-xl border border-[#2b3548]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REPORT & BLOCK */}
      {reportModalProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#151a25] border border-[#f87171]/40 p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-[#f3f4f6]">
              Report {reportModalProfile.display_name}
            </h3>
            <p className="text-xs text-[#9ca3af]">
              Reports are confidentially audited by campus safety officers. Help maintain a harassment-free space for HBTU students.
            </p>

            {reportSent ? (
              <div className="p-4 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/30 text-xs text-[#4ade80] text-center">
                Report submitted successfully. Our safety team will review this promptly.
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">Reason for report</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
                  >
                    <option value="Inappropriate content">Inappropriate / Obscene content</option>
                    <option value="Impersonation / Fake Student">Impersonation / Fake Student</option>
                    <option value="Harassment or bullying">Harassment or bullying</option>
                    <option value="Commercial spam">Commercial spam or solicitations</option>
                    <option value="Doxxing or private info">Doxxing or exposing personal info</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">Additional details (Optional)</label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide context for the moderator..."
                    className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalProfile(null)}
                    className="px-4 py-2 text-xs text-[#9ca3af] hover:text-[#f3f4f6]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#f87171] hover:bg-[#e06060] text-white text-xs font-semibold rounded-xl"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
