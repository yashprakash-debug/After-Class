import React from 'react';
import { ShieldCheck, Lock, FileText, AlertCircle, Mail, MapPin } from 'lucide-react';

interface LegalPagesProps {
  page: 'privacy' | 'terms' | 'safety' | 'community-guidelines' | 'contact' | 'about' | 'how-it-works';
  onNavigate: (path: string) => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ page, onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-[#f3f4f6] space-y-8">
      {/* 1. PRIVACY POLICY */}
      {page === 'privacy' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548]">
            <span className="text-xs text-[#d9b978] font-bold uppercase tracking-wider block mb-1">Legal Document</span>
            <h1 className="text-3xl font-extrabold text-[#f3f4f6]">Privacy Policy</h1>
            <p className="text-xs text-[#9ca3af] mt-1">Effective Date: November 2026 · HBTU Student Network</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4 text-xs sm:text-sm text-[#9ca3af] leading-relaxed">
            <h3 className="text-base font-bold text-[#f3f4f6]">1. Information We Collect</h3>
            <p>
              AFTERCLASS collects only necessary student details required to establish campus verification and consensual connections: Full Name, Display Name, institutional or personal Email, Date of Birth (used strictly to verify that the user is 18 years or older), Branch, Academic Year, Roll Number, and voluntarily submitted interests and personality quiz selections.
            </p>

            <h3 className="text-base font-bold text-[#f3f4f6]">2. Double Consent & Confidentiality</h3>
            <p>
              Your romantic likes and secret admirer selections are completely private. No user is informed that you liked them unless both parties independently select each other. Unmatched users cannot access your contact or messages.
            </p>

            <h3 className="text-base font-bold text-[#f3f4f6]">3. Anonymous Confessions</h3>
            <p>
              Confession submissions are displayed without user names or profile links. However, for student community safety and prevention of threats, suicides, or harassment, submissions undergo automated regex/AI safety checks and manual moderation.
            </p>

            <h3 className="text-base font-bold text-[#f3f4f6]">4. Data Retention & Deletion</h3>
            <p>
              You maintain the absolute right to export all profile information in standard JSON format or request immediate account erasure from your Settings menu at any time.
            </p>
          </div>
        </div>
      )}

      {/* 2. TERMS OF SERVICE */}
      {page === 'terms' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548]">
            <span className="text-xs text-[#d9b978] font-bold uppercase tracking-wider block mb-1">User Agreement</span>
            <h1 className="text-3xl font-extrabold text-[#f3f4f6]">Terms of Service</h1>
            <p className="text-xs text-[#9ca3af] mt-1">Harcourt Butler Technical University Kanpur Independent Campus Initiative</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4 text-xs sm:text-sm text-[#9ca3af] leading-relaxed">
            <h3 className="text-base font-bold text-[#f3f4f6]">1. Student Eligibility</h3>
            <p>
              Membership is exclusively open to verified students enrolled in undergraduate, postgraduate, or research programs at HBTU Kanpur. Romantic and dating capabilities strictly mandate that the student is at least 18 years of age.
            </p>

            <h3 className="text-base font-bold text-[#f3f4f6]">2. Independence from University Administration</h3>
            <p>
              AFTERCLASS is a student-created community software initiative and is not an official administrative wing or sponsored registrar department of Harcourt Butler Technical University. Official university trademarks are respected and not infringed.
            </p>

            <h3 className="text-base font-bold text-[#f3f4f6]">3. Account Suspensions & Violations</h3>
            <p>
              Accounts involved in doxxing, harassment, non-consensual sharing of communications, commercial coaching solicitations, or hate speech are subject to immediate suspension by student moderators.
            </p>
          </div>
        </div>
      )}

      {/* 3. SAFETY GUIDELINES */}
      {page === 'safety' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548]">
            <span className="text-xs text-[#4ade80] font-bold uppercase tracking-wider block mb-1">Campus Safety</span>
            <h1 className="text-3xl font-extrabold text-[#f3f4f6]">Safety & Verification Guidelines</h1>
            <p className="text-xs text-[#9ca3af] mt-1">Ensuring a respectful, secure campus environment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-2">
              <ShieldCheck className="w-6 h-6 text-[#4ade80]" />
              <h4 className="text-base font-bold text-[#f3f4f6]">Verified Identity</h4>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                Every student account is tied to an official institutional email (@hbtu.ac.in) or verified enrollment document reviewed by authorized student moderators.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-2">
              <Lock className="w-6 h-6 text-[#d9b978]" />
              <h4 className="text-base font-bold text-[#f3f4f6]">Zero Stalking / Doxxing</h4>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                Personal addresses, room numbers, and phone numbers are never published. Users can block or report any profile with a single tap.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-2">
              <AlertCircle className="w-6 h-6 text-[#e879a9]" />
              <h4 className="text-base font-bold text-[#f3f4f6]">Meeting in Public Spaces</h4>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                When planning a first meeting, always choose well-lit, populated campus hubs like the Library Lawn, Old Sports Ground, or Swaroop Nagar cafes.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-2">
              <ShieldCheck className="w-6 h-6 text-[#d9b978]" />
              <h4 className="text-base font-bold text-[#f3f4f6]">Double-Opt-In Dating</h4>
              <p className="text-xs text-[#9ca3af] leading-relaxed">
                Nobody can message you unless you have mutually liked their profile. No unsolicited DMs, no pressure.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. COMMUNITY GUIDELINES */}
      {page === 'community-guidelines' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548]">
            <span className="text-xs text-[#d9b978] font-bold uppercase tracking-wider block mb-1">Code of Conduct</span>
            <h1 className="text-3xl font-extrabold text-[#f3f4f6]">Community Guidelines</h1>
            <p className="text-xs text-[#9ca3af] mt-1">Our shared commitment to kindness and respect</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4 text-xs sm:text-sm text-[#9ca3af] leading-relaxed">
            <h4 className="font-bold text-[#f3f4f6]">Rule 1: Respect Consent Always</h4>
            <p>No means no. Unmatching or blocking is a permanent boundary that must be respected across campus.</p>

            <h4 className="font-bold text-[#f3f4f6]">Rule 2: No Impersonation</h4>
            <p>Creating profiles pretending to be another student, professor, or campus official results in immediate permanent ban.</p>

            <h4 className="font-bold text-[#f3f4f6]">Rule 3: Keep Confessions Constructive</h4>
            <p>Do not post slander, unsubstantiated allegations, or private bedroom details about other people.</p>

            <h4 className="font-bold text-[#f3f4f6]">Rule 4: Inclusive Environment</h4>
            <p>Discrimination based on branch, hostel, caste, religion, or gender identity has zero place on AFTERCLASS.</p>
          </div>
        </div>
      )}

      {/* 5. CONTACT & REPORTING */}
      {page === 'contact' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548]">
            <span className="text-xs text-[#e879a9] font-bold uppercase tracking-wider block mb-1">Support</span>
            <h1 className="text-3xl font-extrabold text-[#f3f4f6]">Contact Safety Team</h1>
            <p className="text-xs text-[#9ca3af] mt-1">We are here to assist with any safety, technical, or verification concern</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-2">
              <Mail className="w-5 h-5 text-[#d9b978]" />
              <h4 className="text-sm font-bold text-[#f3f4f6]">Direct Safety Email</h4>
              <p className="text-xs text-[#9ca3af]">yashprakash26707@gmail.com</p>
              <p className="text-[11px] text-[#9ca3af]">Replies within 24 hours from lead student administrator.</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-2">
              <MapPin className="w-5 h-5 text-[#e879a9]" />
              <h4 className="text-sm font-bold text-[#f3f4f6]">Campus Location</h4>
              <p className="text-xs text-[#9ca3af]">Harcourt Butler Technical University (HBTU)</p>
              <p className="text-[11px] text-[#9ca3af]">Nawabganj, Kanpur, Uttar Pradesh 208002</p>
            </div>
          </div>
        </div>
      )}

      {/* 6. HOW IT WORKS */}
      {page === 'how-it-works' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548]">
            <span className="text-xs text-[#d9b978] font-bold uppercase tracking-wider block mb-1">Overview</span>
            <h1 className="text-3xl font-extrabold text-[#f3f4f6]">How AFTERCLASS Works</h1>
            <p className="text-xs text-[#9ca3af] mt-1">Your guide to discovering meaningful connections on campus</p>
          </div>

          <div className="space-y-4">
            {[
              { step: '01', title: 'Register with HBTU Credentials', desc: 'Sign up using your student email or upload student credentials for human administrator review. Dating capabilities require verified age 18+.' },
              { step: '02', title: 'Curate Your Campus Vibe', desc: 'Select your hobbies, music preferences, and take the fun campus personality quiz.' },
              { step: '03', title: 'Discover & Double-Opt-In', desc: 'Browse fellow students with transparent compatibility scoring. Mutual likes unlock real-time encrypted messaging.' },
              { step: '04', title: 'Engage Beyond Classrooms', desc: 'Participate in 12 interest clubs, read anonymous campus confessions, plan verified Kanpur dates, and join campus buzz mixers.' }
            ].map(item => (
              <div key={item.step} className="p-5 rounded-2xl bg-[#151a25] border border-[#2b3548] flex items-start gap-4">
                <span className="font-mono text-xl font-bold text-[#d9b978] shrink-0">{item.step}</span>
                <div>
                  <h4 className="text-base font-bold text-[#f3f4f6]">{item.title}</h4>
                  <p className="text-xs text-[#9ca3af] mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. ABOUT */}
      {page === 'about' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548]">
            <span className="text-xs text-[#d9b978] font-bold uppercase tracking-wider block mb-1">Our Mission</span>
            <h1 className="text-3xl font-extrabold text-[#f3f4f6]">Beyond classrooms. Beyond connections.</h1>
            <p className="text-xs text-[#9ca3af] mt-1">An independent student-created campus social platform</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4 text-xs sm:text-sm text-[#9ca3af] leading-relaxed">
            <p>
              Engineering universities are renowned for intense academic schedules, lab experiments, and competitive examinations. Yet the most enduring memories of college life happen after classes: late-night hostel debates, guitar chords on library lawns, shared cutting chai during monsoon showers, and lifelong bonds.
            </p>
            <p>
              AFTERCLASS was conceived by HBTU students to bridge the gap between academic rigour and genuine social discovery. We believe in privacy first, mutual consent, transparent matching, and an inclusive campus space for singles, couples, and friends alike.
            </p>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-[#1d2636] flex justify-between">
        <button
          onClick={() => onNavigate('/')}
          className="text-xs text-[#d9b978] hover:underline font-semibold"
        >
          ← Return to Landing Page
        </button>
      </div>
    </div>
  );
};
