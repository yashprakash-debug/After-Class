import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  Heart, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Search, 
  UserPlus, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';
import { Profile } from '../types';

interface SecretAdmirerPageProps {
  currentUser: Profile;
  onNavigate: (path: string) => void;
}

export const SecretAdmirerPage: React.FC<SecretAdmirerPageProps> = ({ currentUser, onNavigate }) => {
  const [admirerCount, setAdmirerCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [sentTargetIds, setSentTargetIds] = useState<string[]>([]);
  const [mutualCrushes, setMutualCrushes] = useState<any[]>([]);
  const [availableProfiles, setAvailableProfiles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTarget, setSelectedTarget] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      const [statusRes, discRes] = await Promise.all([
        api.getSecretAdmirerStatus(),
        api.getDiscoverProfiles()
      ]);
      setAdmirerCount(statusRes.admirerCount || 0);
      setSentCount(statusRes.sentCount || 0);
      setSentTargetIds(statusRes.sentTargetIds || []);
      setMutualCrushes(statusRes.mutualCrushes || []);
      setAvailableProfiles(discRes.profiles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleExpressCrush = async (target: any) => {
    try {
      const res = await api.expressSecretAdmirer(target.id);
      if (res.isMutual) {
        setActionSuccess(`Mutual crush unlocked! Both of you secretly selected each other.`);
      } else {
        setActionSuccess(`Your secret crush has been privately recorded. They will receive an anonymous notice.`);
      }
      loadStatus();
      setSelectedTarget(null);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConsentReveal = async (targetId: string) => {
    try {
      await api.consentSecretAdmirerReveal(targetId);
      setActionSuccess('Identity reveal consent granted! When both consent, full chat unlocks.');
      loadStatus();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCandidates = availableProfiles.filter(p => {
    if (p.id === currentUser.id) return false;
    if (sentTargetIds.includes(p.id)) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.display_name.toLowerCase().includes(q) || p.branch.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#f3f4f6]">
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#151a25] via-[#1d2636] to-[#151a25] border border-[#2b3548] p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-xs text-[#d9b978] font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Double-Consent Mutual Crush System</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#f3f4f6]">
          Secret Admirer
        </h1>
        <p className="text-xs sm:text-sm text-[#9ca3af] max-w-2xl leading-relaxed">
          Privately select students you are secretly fond of. Your identity is 100% confidential. If and only if they also pick you, a mutual spark is revealed!
        </p>

        {/* Stats Strip */}
        <div className="pt-4 border-t border-[#2b3548] grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-3 bg-[#101827]/60 rounded-xl border border-[#2b3548]">
            <span className="text-[10px] text-[#9ca3af] block">Your Secret Admirers</span>
            <span className="text-2xl font-bold font-mono text-[#e879a9]">{admirerCount}</span>
            <span className="text-[10px] text-[#9ca3af] block mt-0.5">Students secretly fond of you</span>
          </div>

          <div className="p-3 bg-[#101827]/60 rounded-xl border border-[#2b3548]">
            <span className="text-[10px] text-[#9ca3af] block">Crushes Expressed</span>
            <span className="text-2xl font-bold font-mono text-[#d9b978]">{sentCount}</span>
            <span className="text-[10px] text-[#9ca3af] block mt-0.5">Confidential selections</span>
          </div>

          <div className="p-3 bg-[#101827]/60 rounded-xl border border-[#2b3548] col-span-2 sm:col-span-1">
            <span className="text-[10px] text-[#9ca3af] block">Mutual Sparks</span>
            <span className="text-2xl font-bold font-mono text-[#4ade80]">{mutualCrushes.length}</span>
            <span className="text-[10px] text-[#9ca3af] block mt-0.5">Both selected each other</span>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/30 text-xs text-[#4ade80] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* MUTUAL CRUSH SECTION (If any) */}
      {mutualCrushes.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#151a25] border border-[#e879a9]/40 space-y-4">
          <div className="flex items-center gap-2 text-xs text-[#e879a9] font-bold">
            <Heart className="w-4 h-4 fill-current" />
            <span>Mutual Secret Crushes Unlocked!</span>
          </div>
          <p className="text-xs text-[#9ca3af]">
            Both of you privately picked each other! Give consent to reveal your full profile identity to start chatting.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {mutualCrushes.map((mc) => (
              <div key={mc.requestId} className="p-4 rounded-xl bg-[#101827] border border-[#2b3548] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#1d2636] border border-[#e879a9] flex items-center justify-center text-[#e879a9]">
                    <Heart className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#f3f4f6]">
                      {mc.admirerConsentReveal && mc.targetConsentReveal ? mc.targetName : 'Verified Student'}
                    </h4>
                    <span className="text-xs text-[#d9b978]">{mc.branch || 'HBTU Kanpur'}</span>
                  </div>
                </div>

                {mc.admirerConsentReveal && mc.targetConsentReveal ? (
                  <button
                    onClick={() => onNavigate('/matches')}
                    className="px-3.5 py-1.5 bg-[#d9b978] text-[#101827] text-xs font-bold rounded-lg shadow-sm"
                  >
                    Chat Now
                  </button>
                ) : (
                  <button
                    onClick={() => handleConsentReveal(mc.targetId)}
                    className="px-3.5 py-1.5 bg-[#e879a9] hover:bg-[#d86898] text-[#101827] text-xs font-bold rounded-lg shadow-sm"
                  >
                    Consent Reveal
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SELECT A SECRET CRUSH SEARCH & LIST */}
      <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[#f3f4f6]">Privately Pick a Campus Crush</h3>
          <p className="text-xs text-[#9ca3af] mt-0.5">
            Search for eligible verified students. They will only receive a message that an anonymous admirer exists.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-[#9ca3af] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name or branch..."
            className="w-full pl-10 pr-4 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs sm:text-sm text-[#f3f4f6] placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#d9b978]"
          />
        </div>

        {/* Candidate List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {filteredCandidates.map((student) => (
            <div
              key={student.id}
              className="p-3.5 rounded-xl bg-[#101827] border border-[#2b3548] flex items-center justify-between gap-3 hover:border-[#d9b978]/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={student.avatar_url || 'https://placehold.co/100'}
                  alt={student.display_name}
                  className="w-10 h-10 rounded-full object-cover border border-[#2b3548] shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="truncate">
                  <h4 className="text-xs font-semibold text-[#f3f4f6] truncate">{student.display_name}</h4>
                  <span className="text-[10px] text-[#9ca3af] truncate block">{student.branch.split(' ')[0]}</span>
                </div>
              </div>

              <button
                onClick={() => handleExpressCrush(student)}
                className="px-3 py-1.5 bg-[#1d2636] hover:bg-[#d9b978] hover:text-[#101827] text-xs font-medium text-[#d9b978] rounded-lg border border-[#2b3548] transition-all shrink-0 active:scale-95"
              >
                Crush
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
