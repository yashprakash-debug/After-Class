import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  Save, 
  CheckCircle2, 
  Tag, 
  HelpCircle,
  Eye,
  Sliders,
  Camera,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { Profile, ConnectionPreference } from '../types';

interface ProfilePageProps {
  currentUser: Profile;
  onUpdateUser: (updated: Profile) => void;
  onNavigate: (path: string) => void;
}

const ALL_INTERESTS = [
  'Coding & AI',
  'Robotics',
  'Acoustic Music',
  'Indie Cinema',
  'Classic Literature',
  'Photography',
  'Competitive Gaming',
  'Fitness & Gym',
  'Chess',
  'Travel & Roadtrips',
  'Street Food & Cafes',
  'Philosophy & Debates',
  'Cricket & Football',
  'Startups & Innovation'
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ currentUser, onUpdateUser, onNavigate }) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [displayName, setDisplayName] = useState(currentUser.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url || '');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(currentUser.interests || []);
  const [personalityAnswers, setPersonalityAnswers] = useState<Record<string, string>>(currentUser.personality_answers || {
    vibe: 'Introvert with select people',
    beverage: 'Cutting chai',
    scenery: 'Quiet mountains',
    schedule: 'Night owl',
    weekend: 'Spontaneous plans'
  });
  const [connectionPrefs, setConnectionPrefs] = useState<ConnectionPreference[]>(currentUser.connection_preferences || ['dating', 'friendship']);
  const [isDiscoverable, setIsDiscoverable] = useState(currentUser.is_discoverable ?? true);
  
  const [saving, setSaving] = useState(false);
  const [aiPersonalitySummary, setAiPersonalitySummary] = useState<string | null>(null);
  const [loadingAiSummary, setLoadingAiSummary] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const togglePref = (pref: ConnectionPreference) => {
    setConnectionPrefs(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const handleGenerateAiPersonality = async () => {
    setLoadingAiSummary(true);
    try {
      const res = await api.getAiAssistance('personality_summary', { answers: personalityAnswers });
      setAiPersonalitySummary(res.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAiSummary(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await api.updateProfile({
        display_name: displayName,
        bio,
        avatar_url: avatarUrl,
        interests: selectedInterests,
        personality_answers: personalityAnswers,
        connection_preferences: connectionPrefs,
        is_discoverable: isDiscoverable
      });
      onUpdateUser(res.profile);
      setFeedback('Profile successfully updated!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[#f3f4f6]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#151a25] border border-[#2b3548]">
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl || 'https://placehold.co/100'}
            alt={displayName}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#d9b978]"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#f3f4f6]">{currentUser.full_name}</h1>
              {currentUser.is_student_verified && (
                <span title="Verified Student">
                  <ShieldCheck className="w-5 h-5 text-[#4ade80]" />
                </span>
              )}
            </div>
            <p className="text-xs text-[#d9b978]">{currentUser.branch} · {currentUser.academic_year}</p>
            <p className="text-[11px] text-[#9ca3af]">Roll No: {currentUser.roll_number || '210101099'}</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/30 text-xs text-[#4ade80] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Step Tabs for Multi-Step Onboarding Editor */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 border-b border-[#1d2636] pb-3 text-xs">
        {[
          { step: 1, label: 'Basic Info' },
          { step: 2, label: 'Interests' },
          { step: 3, label: 'Personality' },
          { step: 4, label: 'Preferences' },
          { step: 5, label: 'Visibility' },
          { step: 6, label: 'Card Preview' }
        ].map(item => (
          <button
            key={item.step}
            onClick={() => setActiveStep(item.step)}
            className={`py-2 px-3 rounded-xl whitespace-nowrap transition-colors ${
              activeStep === item.step
                ? 'bg-[#1d2636] text-[#d9b978] font-bold border border-[#2b3548]'
                : 'text-[#9ca3af] hover:text-[#f3f4f6]'
            }`}
          >
            {item.step}. {item.label}
          </button>
        ))}
      </div>

      {/* STEP CONTENT CONTAINER */}
      <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-6">
        {/* Step 1: Basic Info */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#f3f4f6]">Step 1: Basic Profile Details</h3>
            
            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs sm:text-sm text-[#f3f4f6] focus:outline-none focus:border-[#d9b978]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1">Avatar Image URL</label>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs sm:text-sm text-[#f3f4f6] focus:outline-none focus:border-[#d9b978]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#9ca3af] mb-1">Bio / Campus Intro</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#101827] border border-[#2b3548] rounded-xl text-xs sm:text-sm text-[#f3f4f6] focus:outline-none focus:border-[#d9b978]"
              />
              <p className="text-[11px] text-[#9ca3af] mt-1">
                Tip: Mention your favorite hangout spot (e.g., Central Library, Swaroop Nagar, or Hostel Quad).
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Interests */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#f3f4f6]">Step 2: Campus Interests & Activities</h3>
            <p className="text-xs text-[#9ca3af]">Select all that apply. Accounts for 40% of the recommendation algorithm.</p>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {ALL_INTERESTS.map(interest => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3.5 py-2 rounded-xl text-xs border transition-colors ${
                      isSelected
                        ? 'bg-[#d9b978] text-[#101827] border-[#d9b978] font-bold shadow-sm'
                        : 'bg-[#101827] text-[#9ca3af] border-[#2b3548] hover:text-[#f3f4f6]'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Personality */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#f3f4f6]">Step 3: Personality Archetype</h3>
            <p className="text-xs text-[#9ca3af]">Quick answers to help fellow students feel your vibe.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">Social Energy</label>
                <select
                  value={personalityAnswers.vibe || 'Introvert with select people'}
                  onChange={(e) => setPersonalityAnswers(prev => ({ ...prev, vibe: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
                >
                  <option value="Introvert with select people">Introvert with select people</option>
                  <option value="Extroverted explorer">Extroverted explorer</option>
                  <option value="Ambivert with high curiosity">Ambivert with high curiosity</option>
                  <option value="Deep conversationalist">Deep conversationalist</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">Campus Fuel</label>
                <select
                  value={personalityAnswers.beverage || 'Cutting chai'}
                  onChange={(e) => setPersonalityAnswers(prev => ({ ...prev, beverage: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
                >
                  <option value="Cutting chai">Cutting chai</option>
                  <option value="Hot coffee">Hot coffee</option>
                  <option value="Cold brew / iced coffee">Cold brew / iced coffee</option>
                  <option value="Green tea">Green tea</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">Natural Scenery</label>
                <select
                  value={personalityAnswers.scenery || 'Quiet mountains'}
                  onChange={(e) => setPersonalityAnswers(prev => ({ ...prev, scenery: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
                >
                  <option value="Quiet mountains">Quiet mountains</option>
                  <option value="Sunny beaches">Sunny beaches</option>
                  <option value="Misty river ghats">Misty river ghats</option>
                  <option value="Forest trails">Forest trails</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">Study Rhythm</label>
                <select
                  value={personalityAnswers.schedule || 'Night owl'}
                  onChange={(e) => setPersonalityAnswers(prev => ({ ...prev, schedule: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
                >
                  <option value="Night owl">Night owl (Hostel 1 AM)</option>
                  <option value="Early bird">Early bird (6 AM Library)</option>
                  <option value="Deadline driven">Deadline driven sprinter</option>
                </select>
              </div>
            </div>

            {/* AI Summary Generator */}
            <div className="pt-3 border-t border-[#1d2636]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#d9b978] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini AI Personality Summary</span>
                </span>
                <button
                  type="button"
                  onClick={handleGenerateAiPersonality}
                  disabled={loadingAiSummary}
                  className="text-xs text-[#d9b978] hover:underline font-medium"
                >
                  {loadingAiSummary ? 'Analyzing...' : 'Generate Summary'}
                </button>
              </div>

              {aiPersonalitySummary && (
                <div className="p-3.5 mt-2 rounded-xl bg-[#101827] border border-[#d9b978]/40 text-xs text-[#f3f4f6] leading-relaxed italic">
                  "{aiPersonalitySummary}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Connection Preferences */}
        {activeStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#f3f4f6]">Step 4: Connection Intentions</h3>
            <p className="text-xs text-[#9ca3af]">What are you open to exploring on campus?</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { id: 'dating' as const, label: 'Dating (Age 18+ Verified)', desc: 'Romantic discovery with double-opt-in matching.' },
                { id: 'friendship' as const, label: 'Friendship', desc: 'Expand your campus circle across branches.' },
                { id: 'study_partner' as const, label: 'Study Partner', desc: 'Lab collaboration, exam prep, and hackathons.' },
                { id: 'activity_partner' as const, label: 'Activity Partner', desc: 'Gym buddy, sports, chess, or photo walks.' }
              ].map(item => {
                const isSelected = connectionPrefs.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => togglePref(item.id)}
                    className={`p-4 rounded-xl border text-left transition-colors ${
                      isSelected
                        ? 'bg-[#1d2636] border-[#d9b978] text-[#f3f4f6]'
                        : 'bg-[#101827] border-[#2b3548] text-[#9ca3af] hover:text-[#f3f4f6]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold">{item.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#d9b978]" />}
                    </div>
                    <p className="text-xs text-[#9ca3af]">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Profile Visibility */}
        {activeStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#f3f4f6]">Step 5: Discovery Visibility</h3>
            
            <div className="p-4 rounded-xl bg-[#101827] border border-[#2b3548] flex items-center justify-between gap-4">
              <div>
                <span className="text-sm font-semibold text-[#f3f4f6] block">
                  Show profile in Discover feed
                </span>
                <p className="text-xs text-[#9ca3af]">
                  When disabled, your card is hidden from discovery feeds. Existing matches remain active.
                </p>
              </div>

              <input
                type="checkbox"
                checked={isDiscoverable}
                onChange={(e) => setIsDiscoverable(e.target.checked)}
                className="w-5 h-5 accent-[#d9b978] rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Step 6: Confirmation Card Preview */}
        {activeStep === 6 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#f3f4f6]">Step 6: Live Card Preview</h3>
            <p className="text-xs text-[#9ca3af]">How your profile card appears to fellow HBTU students:</p>

            <div className="max-w-sm mx-auto rounded-3xl bg-[#101827] border border-[#2b3548] overflow-hidden shadow-2xl">
              <div className="h-64 bg-[#151a25] relative">
                <img
                  src={avatarUrl || 'https://placehold.co/400x500'}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101827] to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xl font-bold text-[#f3f4f6]">{displayName}</h4>
                    {currentUser.is_student_verified && (
                      <ShieldCheck className="w-4 h-4 text-[#4ade80]" />
                    )}
                  </div>
                  <span className="text-xs text-[#d9b978]">{currentUser.branch} · {currentUser.academic_year}</span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <p className="text-xs text-[#f3f4f6] italic">"{bio || 'No bio written yet.'}"</p>
                <div className="flex flex-wrap gap-1">
                  {selectedInterests.map(i => (
                    <span key={i} className="text-[10px] text-[#9ca3af] px-2 py-0.5 rounded bg-[#151a25] border border-[#2b3548]">
                      {i}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next / Back Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1d2636]">
          {activeStep > 1 ? (
            <button
              onClick={() => setActiveStep(prev => prev - 1)}
              className="px-4 py-2 text-xs text-[#9ca3af] hover:text-[#f3f4f6]"
            >
              Back
            </button>
          ) : <div />}

          {activeStep < 6 ? (
            <button
              onClick={() => setActiveStep(prev => prev + 1)}
              className="px-5 py-2 bg-[#1d2636] hover:bg-[#253247] text-xs font-semibold text-[#d9b978] rounded-xl border border-[#2b3548]"
            >
              Continue to Step {activeStep + 1}
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] text-xs font-bold rounded-xl shadow-md"
            >
              Save & Publish Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
