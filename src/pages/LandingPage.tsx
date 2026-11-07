import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Heart, 
  Users, 
  MessageSquareQuote, 
  Compass, 
  Calendar, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  MapPin, 
  Flame, 
  Coffee 
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onExplore: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onExplore }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Who can join AFTERCLASS?',
      a: 'AFTERCLASS is strictly restricted to verified students currently enrolled at Harcourt Butler Technical University (HBTU), Kanpur. Verification occurs via institutional @hbtu.ac.in emails or manual student ID/roll number document validation by student administrators.'
    },
    {
      q: 'How does the dating age restriction work?',
      a: 'All dating and romantic discovery features are strictly locked to students who are verified to be 18 years of age or older. DOB is encrypted and never exposed publicly.'
    },
    {
      q: 'What is the Couples Corner?',
      a: 'Couples Corner is a private, double-consensual encrypted digital space for university couples to track their relationship milestones, private memories, love notes, anniversary countdowns, and bucket lists.'
    },
    {
      q: 'Are confessions really anonymous?',
      a: 'Yes. To other students, your confession is completely anonymous with no profile links. However, for campus safety, posts pass through an automated safety filter and moderation queue to prevent bullying, doxxing, or posting phone numbers.'
    },
    {
      q: 'How does the matching algorithm work?',
      a: 'Our transparent recommendation score evaluates 4 key factors: Shared Interests (40%), Personality Answers (25%), Common Campus Activities (20%), and Mutual Connection Preferences (15%). No arbitrary attractiveness rankings.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#101827] text-[#f3f4f6]">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-[#1d2636]">
        {/* Ambient atmospheric backdrop */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-[#d9b978]/30 blur-3xl" />
          <div className="absolute top-1/2 right-10 w-96 h-96 rounded-full bg-[#e879a9]/20 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs text-[#d9b978] tracking-wide">
                <span>Harcourt Butler Technical University</span>
                <span aria-hidden="true">·</span>
                <span>Verified Campus Network</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#f3f4f6] leading-[1.15] text-balance">
                Your college life deserves more <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d9b978] via-[#e879a9] to-[#d9b978]">connections</span>.
              </h1>

              <p className="text-base sm:text-lg text-[#9ca3af] max-w-2xl leading-relaxed">
                Meet new people, discover meaningful connections, share stories, and create memories beyond the classroom. Exclusively for verified HBTU students.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-6 py-3.5 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] font-semibold text-sm sm:text-base rounded-xl transition-all shadow-lg shadow-[#d9b978]/10 flex items-center gap-2 active:scale-[0.98]"
                >
                  <span>Join AFTERCLASS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onExplore('/discover')}
                  className="px-6 py-3.5 bg-[#1d2636] hover:bg-[#253247] text-[#f3f4f6] font-medium text-sm sm:text-base rounded-xl border border-[#2b3548] transition-colors"
                >
                  Explore the experience
                </button>
              </div>

              {/* Key Trust Signals */}
              <div className="pt-6 border-t border-[#1d2636] flex flex-wrap items-center gap-6 text-xs text-[#9ca3af]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#4ade80]" />
                  <span>Enrolment Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#d9b978]" />
                  <span>Double-Opt-In Dating (18+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#e879a9]" />
                  <span>Zero Commercial Ads</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#2b3548] bg-[#151a25] shadow-2xl">
                <img
                  src="/src/assets/images/hero_campus_social_1793616893562.jpg"
                  alt="HBTU students walking on campus during golden hour"
                  className="w-full h-72 sm:h-80 object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101827] via-transparent to-transparent opacity-90" />
                
                {/* Feature Interface Showcase Card */}
                <div className="p-5 relative z-10 -mt-16 bg-[#151a25]/95 backdrop-blur-md border-t border-[#2b3548]">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-bold text-base text-[#f3f4f6]">Campus Match Interface</span>
                        <ShieldCheck className="w-4 h-4 text-[#4ade80]" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#9ca3af] mt-0.5">
                        <span>HBTU Engineering</span>
                        <span aria-hidden="true">·</span>
                        <span>Verified Student</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-[#d9b978] font-bold">4-Pillar Score</span>
                      <p className="text-[10px] text-[#4ade80]">Double-Opt-In Dating</p>
                    </div>
                  </div>

                  <p className="text-xs text-[#9ca3af] mt-3 line-clamp-2">
                    Connect over shared academic branches, campus passions, and Kanpur cafe explorations. Zero superficial ranking algorithms.
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {['Verified Student Profile', 'Interest Alignment', 'Double Consent 18+'].map(tag => (
                      <span key={tag} className="text-[11px] text-[#f3f4f6]/80 px-2 py-0.5 rounded bg-[#1d2636] border border-[#2b3548]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE FOUR PILLARS */}
      <section className="py-16 border-b border-[#1d2636]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f3f4f6]">
              A complete campus social ecosystem
            </h2>
            <p className="text-sm sm:text-base text-[#9ca3af] mt-2">
              AFTERCLASS unites four distinct student needs into one respectful, privacy-first university space.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: Singles & Dating */}
            <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] hover:border-[#d9b978]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#d9b978]/10 text-[#d9b978] flex items-center justify-center mb-4">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#f3f4f6]">Singles & Dating (18+)</h3>
              <p className="text-xs text-[#9ca3af] mt-2 leading-relaxed">
                Mutual double-opt-in matching. No one knows you liked them unless feelings are mutual. Transparent compatibility breakdown.
              </p>
            </div>

            {/* Pillar 2: Friendship & Study */}
            <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] hover:border-[#d9b978]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#4ade80]/10 text-[#4ade80] flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#f3f4f6]">Campus Connections</h3>
              <p className="text-xs text-[#9ca3af] mt-2 leading-relaxed">
                Find study partners in your branch, gym buddies for the East Campus track, or peers who love the same niche books.
              </p>
            </div>

            {/* Pillar 3: Anonymous Confessions */}
            <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] hover:border-[#e879a9]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#e879a9]/10 text-[#e879a9] flex items-center justify-center mb-4">
                <MessageSquareQuote className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#f3f4f6]">Confessions Wall</h3>
              <p className="text-xs text-[#9ca3af] mt-2 leading-relaxed">
                Campus crushes, relatable hostel mess incidents, and heartfelt appreciation posts with automated safety screening.
              </p>
            </div>

            {/* Pillar 4: Couples Corner */}
            <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] hover:border-[#d9b978]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#d9b978]/10 text-[#d9b978] flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-[#f3f4f6]">Couples Corner</h3>
              <p className="text-xs text-[#9ca3af] mt-2 leading-relaxed">
                A private shared sanctuary for consenting couples. Shared photo memories, love notes, anniversary countdowns, and bucket lists.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURE HIGHLIGHTS */}
      <section className="py-16 border-b border-[#1d2636] bg-[#151a25]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Confession visual */}
            <div className="relative rounded-2xl overflow-hidden border border-[#2b3548] bg-[#151a25]">
              <img
                src="/src/assets/images/confession_envelope_mood_1793616895238.jpg"
                alt="Stationery letter with wax seal"
                className="w-full h-72 sm:h-80 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-5 bg-[#151a25]">
                <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-2">
                  <span className="text-[#e879a9] font-medium">Category: Campus Crushes</span>
                  <span>Approved & Verified Safe</span>
                </div>
                <p className="text-sm text-[#f3f4f6] italic">
                  "Library gratitude, canteen memories, and unsaid appreciation between lectures. Identity strictly decoupled and protected by safety filters."
                </p>
              </div>
            </div>

            {/* Confession details */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs text-[#e879a9] font-semibold">
                <MessageSquareQuote className="w-4 h-4" />
                <span>Anonymous Campus Storytelling</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f3f4f6]">
                Share your unsaid words. Safely.
              </h2>
              <p className="text-sm text-[#9ca3af] leading-relaxed">
                University life is filled with fleeting moments, late-night hostel thoughts, and unexpressed gratitude. Our moderated confession board allows students to post without fear of judgment, while strictly prohibiting bullying, phone numbers, and doxxing.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onExplore('/confessions')}
                  className="px-5 py-2.5 bg-[#1d2636] hover:bg-[#253247] text-[#d9b978] text-sm font-semibold rounded-xl border border-[#2b3548] transition-colors"
                >
                  Read Campus Confessions
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DATE PLANNER FOR KANPUR */}
      <section className="py-16 border-b border-[#1d2636]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs text-[#d9b978] font-semibold">
                <MapPin className="w-4 h-4" />
                <span>Local Kanpur Curation</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f3f4f6]">
                Interactive Student Date Planner
              </h2>
              <p className="text-sm text-[#9ca3af] leading-relaxed">
                No awkward guessing. Select your budget (₹100, ₹300, ₹500, or ₹1,000+), desired mood, and duration. Get curated itineraries for real Kanpur spots—from sunset promenades at Ganga Barrage to quiet Swaroop Nagar cafes and Allen Forest morning walks.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onExplore('/date-planner')}
                  className="px-5 py-2.5 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] text-sm font-semibold rounded-xl transition-all"
                >
                  Try the Date Planner
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-[#2b3548] bg-[#151a25]">
              <img
                src="/src/assets/images/couple_spot_memories_1793616895229.jpg"
                alt="Artisan coffee and journal in cozy cafe"
                className="w-full h-72 sm:h-80 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="p-5 bg-[#151a25]">
                <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-1">
                  <span className="text-[#d9b978] font-semibold">Budget: ₹300 · Romantic</span>
                  <span>Swaroop Nagar, Kanpur</span>
                </div>
                <h4 className="text-sm font-semibold text-[#f3f4f6]">Boutique Coffee & Bookstore Date</h4>
                <p className="text-xs text-[#9ca3af] mt-1">
                  Includes preparation checklist, conversational prompts, and estimated expense breakdowns.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ SECTION */}
      <section className="py-16 border-b border-[#1d2636] bg-[#151a25]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f3f4f6]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#9ca3af] mt-2">
              Everything you need to know about safety, verification, and privacy on AFTERCLASS.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-[#2b3548] bg-[#151a25] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="text-sm sm:text-base font-semibold text-[#f3f4f6]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#d9b978] transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-[#9ca3af] leading-relaxed border-t border-[#1d2636] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION & FOOTER */}
      <section className="py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#f3f4f6]">
            Ready to discover what lies beyond the classroom?
          </h2>
          <p className="text-sm sm:text-base text-[#9ca3af] mt-3">
            Join hundreds of verified HBTU Kanpur students today. Simple, respectful, and safe.
          </p>
          <div className="pt-6">
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-8 py-3.5 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] font-semibold text-base rounded-xl transition-all shadow-xl active:scale-[0.98]"
            >
              Get Started with HBTU Email
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1d2636] py-10 bg-[#0d131f] text-xs text-[#9ca3af]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="font-heading font-extrabold text-sm text-[#f3f4f6]">
              AFTER<span className="text-[#d9b978]">CLASS</span>
            </div>
            <p className="text-[11px] text-[#9ca3af]">
              Beyond classrooms. Beyond connections. An independent student initiative for HBTU Kanpur.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
            <button onClick={() => onExplore('/privacy')} className="hover:text-[#f3f4f6]">Privacy Policy</button>
            <button onClick={() => onExplore('/terms')} className="hover:text-[#f3f4f6]">Terms of Service</button>
            <button onClick={() => onExplore('/safety')} className="hover:text-[#f3f4f6]">Safety Guidelines</button>
            <button onClick={() => onExplore('/community-guidelines')} className="hover:text-[#f3f4f6]">Community Code</button>
            <button onClick={() => onExplore('/contact')} className="hover:text-[#f3f4f6]">Contact Safety Team</button>
          </div>

          <div className="text-[11px] text-[#9ca3af]">
            © {new Date().getFullYear()} AFTERCLASS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
