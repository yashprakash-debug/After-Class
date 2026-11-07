import React, { useState, useEffect } from 'react';
import { 
  Coffee, 
  Sparkles, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Bookmark, 
  Share2, 
  Compass, 
  IndianRupee,
  Calendar,
  ChevronRight,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import { DatePlan, Profile } from '../types';

interface DatePlannerPageProps {
  currentUser: Profile;
}

export const DatePlannerPage: React.FC<DatePlannerPageProps> = ({ currentUser }) => {
  const [budget, setBudget] = useState<'₹100' | '₹300' | '₹500' | '₹1,000+'>('₹300');
  const [mood, setMood] = useState<'Romantic' | 'Adventurous' | 'Peaceful' | 'Fun & Playful'>('Romantic');
  const [duration, setDuration] = useState<'1 hour' | '2 hours' | 'Half-day'>('2 hours');
  const [experience, setExperience] = useState<'Food & Cafe' | 'Movies & Chill' | 'Outdoor & Nature' | 'Campus Walk'>('Food & Cafe');
  
  const [currentPlan, setCurrentPlan] = useState<DatePlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<DatePlan[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    api.getDatePlans().then(res => setSavedPlans(res.plans || []));
  }, []);

  const handleGeneratePlan = async () => {
    setLoadingAi(true);
    setSaveSuccess(false);

    try {
      const res = await api.getAiAssistance('date_idea', {
        budget,
        mood,
        duration,
        experience
      });

      const generated: DatePlan = {
        id: `dp_${Date.now()}`,
        creator_id: currentUser.id,
        title: res.title || `${mood} Outing in Kanpur`,
        budget_range: budget,
        mood,
        duration,
        experience_type: experience,
        suggested_activity: res.activity || 'Enjoy a calm evening stroll near Ganga Barrage with kulhad chai and sunset views.',
        estimated_budget_inr: res.estimatedBudget || 250,
        venue_recommendations: 'Swaroop Nagar / Ganga Barrage / Allen Forest',
        checklist: [
          'Arrive 15 minutes before golden hour',
          'Phone battery charged for photos',
          'Cashless UPI ready'
        ],
        conversation_prompts: res.prompts || [
          'What is your favourite childhood memory from university or hometown?',
          'If you could pick one album to soundtrack this semester, which would it be?'
        ],
        is_saved: false,
        created_at: new Date().toISOString()
      };

      setCurrentPlan(generated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSavePlan = async () => {
    if (!currentPlan) return;
    try {
      const res = await api.saveDatePlan(currentPlan);
      setSavedPlans(prev => [res.plan, ...prev]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#f3f4f6]">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#151a25] via-[#1d2636] to-[#151a25] border border-[#2b3548] p-6 sm:p-8 space-y-2">
        <div className="flex items-center gap-2 text-xs text-[#d9b978] font-semibold">
          <MapPin className="w-4 h-4" />
          <span>Local Kanpur University Curation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#f3f4f6]">
          Student Date Planner
        </h1>
        <p className="text-xs sm:text-sm text-[#9ca3af] max-w-2xl leading-relaxed">
          Craft memorable itineraries tailored to your exact budget, mood, and schedule. Verified real spots across Kanpur with zero guesswork.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Configuration (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-6">
          <h3 className="text-base font-bold text-[#f3f4f6] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d9b978]" />
            <span>Plan Parameters</span>
          </h3>

          {/* 1. Budget Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">
              Budget Range
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['₹100', '₹300', '₹500', '₹1,000+'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBudget(b)}
                  className={`py-2 text-xs font-mono font-bold rounded-xl border transition-colors ${
                    budget === b
                      ? 'bg-[#d9b978] text-[#101827] border-[#d9b978]'
                      : 'bg-[#101827] text-[#9ca3af] border-[#2b3548] hover:text-[#f3f4f6]'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Mood */}
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">
              Atmosphere / Mood
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Romantic', 'Adventurous', 'Peaceful', 'Fun & Playful'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border text-left transition-colors ${
                    mood === m
                      ? 'bg-[#1d2636] border-[#e879a9] text-[#e879a9] font-semibold'
                      : 'bg-[#101827] border-[#2b3548] text-[#9ca3af] hover:text-[#f3f4f6]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Duration */}
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">
              Time Commitment
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['1 hour', '2 hours', 'Half-day'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`py-2 text-xs font-medium rounded-xl border transition-colors ${
                    duration === d
                      ? 'bg-[#1d2636] border-[#d9b978] text-[#d9b978] font-semibold'
                      : 'bg-[#101827] border-[#2b3548] text-[#9ca3af]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Experience Type */}
          <div>
            <label className="block text-xs font-semibold text-[#9ca3af] uppercase tracking-wider mb-2">
              Experience Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Food & Cafe', 'Outdoor & Nature', 'Movies & Chill', 'Campus Walk'] as const).map((e) => (
                <button
                  key={e}
                  onClick={() => setExperience(e)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border text-left transition-colors ${
                    experience === e
                      ? 'bg-[#1d2636] border-[#4ade80] text-[#4ade80] font-semibold'
                      : 'bg-[#101827] border-[#2b3548] text-[#9ca3af]'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGeneratePlan}
            disabled={loadingAi}
            className="w-full py-3 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] font-semibold text-sm rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {loadingAi ? 'Curating Kanpur Itinerary...' : 'Generate Date Itinerary'}
          </button>
        </div>

        {/* Right Column: Generated Output & Saved Itineraries (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Generated Plan Card */}
          {currentPlan ? (
            <div className="p-6 rounded-2xl bg-[#151a25] border border-[#d9b978] space-y-5 shadow-2xl relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#d9b978] font-mono">
                    <span>Est. Cost: ₹{currentPlan.estimated_budget_inr}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentPlan.duration}</span>
                    <span aria-hidden="true">·</span>
                    <span>{currentPlan.mood}</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#f3f4f6] mt-1">
                    {currentPlan.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#9ca3af] mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#e879a9]" />
                    <span>{currentPlan.venue_recommendations}</span>
                  </div>
                </div>

                <button
                  onClick={handleSavePlan}
                  className="px-3.5 py-1.5 bg-[#d9b978] text-[#101827] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  <span>{saveSuccess ? 'Saved!' : 'Save Plan'}</span>
                </button>
              </div>

              {/* Activity Description */}
              <div className="p-4 rounded-xl bg-[#101827] border border-[#2b3548] space-y-1">
                <span className="text-[10px] text-[#9ca3af] uppercase font-bold tracking-wider block">
                  Suggested Itinerary
                </span>
                <p className="text-xs sm:text-sm text-[#f3f4f6] leading-relaxed">
                  {currentPlan.suggested_activity}
                </p>
              </div>

              {/* Checklist & Prompts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Preparation Checklist */}
                <div className="p-4 rounded-xl bg-[#101827] border border-[#2b3548] space-y-2">
                  <span className="text-[10px] text-[#d9b978] uppercase font-bold tracking-wider block">
                    Preparation Checklist
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#9ca3af]">
                    {currentPlan.checklist.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Conversation Prompts */}
                <div className="p-4 rounded-xl bg-[#101827] border border-[#2b3548] space-y-2">
                  <span className="text-[10px] text-[#e879a9] uppercase font-bold tracking-wider block">
                    Conversation Prompts
                  </span>
                  <ul className="space-y-1.5 text-xs text-[#9ca3af]">
                    {currentPlan.conversation_prompts.map((prompt, idx) => (
                      <li key={idx} className="italic">
                        "{prompt}"
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#151a25] border border-[#2b3548] text-center space-y-3">
              <Coffee className="w-10 h-10 text-[#2b3548] mx-auto" />
              <h4 className="text-sm font-semibold text-[#f3f4f6]">Configure your budget & mood on the left</h4>
              <p className="text-xs text-[#9ca3af] max-w-sm mx-auto">
                Click "Generate Date Itinerary" to get authentic, budget-friendly date ideas curated for Kanpur university students.
              </p>
            </div>
          )}

          {/* Saved Date Plans */}
          {savedPlans.length > 0 && (
            <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4">
              <h4 className="text-sm font-bold text-[#f3f4f6]">Saved Itineraries</h4>
              <div className="space-y-3">
                {savedPlans.map(plan => (
                  <div key={plan.id} className="p-4 rounded-xl bg-[#101827] border border-[#2b3548] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#f3f4f6]">{plan.title}</span>
                      <span className="text-[10px] font-mono text-[#d9b978] bg-[#1d2636] px-2 py-0.5 rounded">
                        {plan.budget_range} · {plan.mood}
                      </span>
                    </div>
                    <p className="text-xs text-[#9ca3af] line-clamp-2">
                      {plan.suggested_activity}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#9ca3af] pt-1">
                      <span>Venue: {plan.venue_recommendations}</span>
                      <button
                        onClick={() => setCurrentPlan(plan)}
                        className="text-[#d9b978] hover:underline font-medium"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
