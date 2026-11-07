import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  Heart, 
  Lock, 
  Calendar, 
  Image as ImageIcon, 
  FileText, 
  CheckSquare, 
  Plus, 
  X, 
  Clock, 
  Coffee, 
  MapPin,
  Trash2,
  CheckCircle2,
  Pin
} from 'lucide-react';
import { api } from '../services/api';
import { CoupleSpace, CoupleMemory, CoupleNote, CoupleBucketItem, Profile } from '../types';

interface CouplesCornerProps {
  currentUser: Profile;
}

export const CouplesCornerPage: React.FC<CouplesCornerProps> = ({ currentUser }) => {
  const [hasSpace, setHasSpace] = useState(false);
  const [space, setSpace] = useState<CoupleSpace | null>(null);
  const [memories, setMemories] = useState<CoupleMemory[]>([]);
  const [notes, setNotes] = useState<CoupleNote[]>([]);
  const [bucketList, setBucketList] = useState<CoupleBucketItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: story, memories, notes, countdown, bucket, quiz
  const [activeTab, setActiveTab] = useState<'memories' | 'notes' | 'bucket' | 'countdown' | 'quiz'>('memories');

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStartDate, setInviteStartDate] = useState('2025-11-15');
  const [inviteSpaceName, setInviteSpaceName] = useState('');

  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false);
  const [memoryTitle, setMemoryTitle] = useState('');
  const [memoryDate, setMemoryDate] = useState(new Date().toISOString().split('T')[0]);
  const [memoryCaption, setMemoryCaption] = useState('');

  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const [showAddBucketModal, setShowAddBucketModal] = useState(false);
  const [bucketActivity, setBucketActivity] = useState('');
  const [bucketDate, setBucketDate] = useState('');
  const [bucketNotes, setBucketNotes] = useState('');

  // Daily Quiz Question
  const [quizAnswer, setQuizAnswer] = useState('');
  const [savedQuizAnswer, setSavedQuizAnswer] = useState<string | null>(null);

  const loadCoupleSpace = async () => {
    try {
      const res = await api.getCoupleSpace();
      setHasSpace(res.hasSpace);
      if (res.hasSpace && res.space) {
        setSpace(res.space);
        setMemories(res.memories || []);
        setNotes(res.notes || []);
        setBucketList(res.bucketList || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupleSpace();
  }, []);

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.invitePartner({
        partnerEmail: inviteEmail.trim(),
        relationshipStartDate: inviteStartDate,
        spaceName: inviteSpaceName.trim() || undefined
      });
      setShowInviteModal(false);
      loadCoupleSpace();
    } catch (err: any) {
      alert(err.message || 'Invitation failed. Ensure partner email belongs to a verified student.');
    }
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!space || !memoryTitle.trim()) return;
    try {
      const res = await api.addCoupleMemory({
        spaceId: space.id,
        title: memoryTitle.trim(),
        memoryDate,
        caption: memoryCaption.trim(),
        imageUrl: '/src/assets/images/couple_spot_memories_1793616895229.jpg'
      });
      setMemories(prev => [res.memory, ...prev]);
      setShowAddMemoryModal(false);
      setMemoryTitle('');
      setMemoryCaption('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!space || !noteContent.trim()) return;
    try {
      const res = await api.addCoupleNote({
        spaceId: space.id,
        title: noteTitle.trim(),
        content: noteContent.trim()
      });
      setNotes(prev => [res.note, ...prev]);
      setShowAddNoteModal(false);
      setNoteTitle('');
      setNoteContent('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBucketItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!space || !bucketActivity.trim()) return;
    try {
      const res = await api.addCoupleBucketItem({
        spaceId: space.id,
        activity: bucketActivity.trim(),
        targetDate: bucketDate || undefined,
        notes: bucketNotes.trim() || undefined
      });
      setBucketList(prev => [...prev, res.item]);
      setShowAddBucketModal(false);
      setBucketActivity('');
      setBucketDate('');
      setBucketNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBucket = async (id: string) => {
    try {
      const res = await api.toggleCoupleBucketItem(id);
      setBucketList(prev => prev.map(b => b.id === id ? res.item : b));
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate days together
  const startDate = space?.relationship_start_date ? new Date(space.relationship_start_date) : null;
  const daysTogether = startDate ? Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  // Next Anniversary
  let daysToAnniversary = 0;
  if (startDate) {
    const nextAnniv = new Date(new Date().getFullYear(), startDate.getMonth(), startDate.getDate());
    if (nextAnniv.getTime() < Date.now()) {
      nextAnniv.setFullYear(nextAnniv.getFullYear() + 1);
    }
    daysToAnniversary = Math.ceil((nextAnniv.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-xs text-[#9ca3af] animate-pulse">
        Loading encrypted couple space...
      </div>
    );
  }

  if (!hasSpace || !space) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6 text-[#f3f4f6]">
        <div className="w-16 h-16 rounded-2xl bg-[#e879a9]/10 text-[#e879a9] border border-[#e879a9]/30 flex items-center justify-center mx-auto shadow-xl">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#f3f4f6]">
            Couples Corner
          </h1>
          <p className="text-sm text-[#9ca3af] max-w-lg mx-auto leading-relaxed">
            A private shared digital space exclusively for consenting university couples. Preserve memories, love notes, milestones, and bucket lists together.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] max-w-md mx-auto text-left space-y-3 text-xs text-[#9ca3af]">
          <div className="flex items-center gap-2 text-[#f3f4f6] font-semibold text-sm">
            <Lock className="w-4 h-4 text-[#d9b978]" />
            <span>Strict Privacy Guarantee</span>
          </div>
          <p>
            • Only you and your verified partner can access your couple space.
            <br />• Protected by Row Level Security (RLS).
            <br />• Your relationship status is never displayed publicly without explicit consent.
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-6 py-3.5 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] font-semibold text-sm rounded-xl transition-all shadow-lg active:scale-95"
        >
          Create Couple Space & Invite Partner
        </button>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-[#151a25] border border-[#2b3548] p-6 space-y-4 shadow-2xl relative text-left">
              <button
                onClick={() => setShowInviteModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9ca3af] hover:text-[#f3f4f6]"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-[#f3f4f6]">Create Your Shared Space</h3>
              <form onSubmit={handleCreateSpace} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                    Partner's Email *
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="e.g. partner@example.com or student@hbtu.ac.in"
                    required
                    className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6] focus:outline-none focus:border-[#d9b978]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                    Space Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={inviteSpaceName}
                    onChange={(e) => setInviteSpaceName(e.target.value)}
                    placeholder="e.g. Yash & Ananya"
                    className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6] focus:outline-none focus:border-[#d9b978]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                    Relationship Start Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={inviteStartDate}
                    onChange={(e) => setInviteStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6] focus:outline-none focus:border-[#d9b978]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-xs text-[#9ca3af]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#d9b978] text-[#101827] text-xs font-semibold rounded-xl"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ACTIVE COUPLE SPACE VIEW
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[#f3f4f6]">
      {/* Couple Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-[#2b3548] bg-[#151a25] shadow-2xl">
        <div className="h-44 sm:h-52 w-full relative">
          <img
            src="/src/assets/images/couple_spot_memories_1793616895229.jpg"
            alt="Couple memories cafe header"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#151a25] via-[#151a25]/60 to-transparent" />
        </div>

        <div className="p-6 sm:p-8 relative -mt-16 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#e879a9] font-semibold">
              <Heart className="w-4 h-4 fill-current" />
              <span>Private Shared Space</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f3f4f6]">
              {space.space_name}
            </h1>
            <p className="text-xs text-[#9ca3af]">
              {space.partner_1?.display_name} & {space.partner_2?.display_name} · Together since {space.relationship_start_date ? new Date(space.relationship_start_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '2025'}
            </p>
          </div>

          {/* Days Together Counter */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#101827]/80 backdrop-blur-md rounded-2xl border border-[#2b3548] text-center min-w-[110px]">
              <span className="text-2xl font-mono font-bold text-[#d9b978]">{daysTogether}</span>
              <span className="text-[10px] text-[#9ca3af] block">Days Together</span>
            </div>
            <div className="p-3 bg-[#101827]/80 backdrop-blur-md rounded-2xl border border-[#2b3548] text-center min-w-[110px]">
              <span className="text-2xl font-mono font-bold text-[#e879a9]">{daysToAnniversary}</span>
              <span className="text-[10px] text-[#9ca3af] block">Days to Anniversary</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1d2636] pb-2 overflow-x-auto text-xs">
        {[
          { id: 'memories', label: 'Shared Memories', icon: ImageIcon },
          { id: 'notes', label: 'Love Notes', icon: FileText },
          { id: 'bucket', label: 'Bucket List', icon: CheckSquare },
          { id: 'countdown', label: 'Countdowns', icon: Clock },
          { id: 'quiz', label: 'Daily Couple Question', icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#1d2636] text-[#d9b978] font-bold border border-[#2b3548]'
                  : 'text-[#9ca3af] hover:text-[#f3f4f6]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. SHARED MEMORIES */}
      {activeTab === 'memories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#f3f4f6]">Shared Memories</h3>
              <p className="text-xs text-[#9ca3af]">A private photographic journal of your favorite moments</p>
            </div>
            <button
              onClick={() => setShowAddMemoryModal(true)}
              className="px-4 py-2 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Memory</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {memories.map(mem => (
              <div key={mem.id} className="rounded-2xl bg-[#151a25] border border-[#2b3548] overflow-hidden group">
                <div className="h-44 bg-[#101827] overflow-hidden relative">
                  <img
                    src={mem.image_url || '/src/assets/images/couple_spot_memories_1793616895229.jpg'}
                    alt={mem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-[#f3f4f6] backdrop-blur-md font-mono">
                    {new Date(mem.memory_date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="text-sm font-semibold text-[#f3f4f6]">{mem.title}</h4>
                  <p className="text-xs text-[#9ca3af] leading-relaxed line-clamp-2">
                    {mem.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. LOVE NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#f3f4f6]">Love Notes & Letters</h3>
              <p className="text-xs text-[#9ca3af]">Personal messages, reminders and little appreciation notes</p>
            </div>
            <button
              onClick={() => setShowAddNoteModal(true)}
              className="px-4 py-2 bg-[#e879a9] hover:bg-[#d86898] text-[#101827] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Write a Note</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {notes.map(note => (
              <div key={note.id} className="p-5 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-3 relative">
                {note.is_pinned && (
                  <Pin className="w-3.5 h-3.5 text-[#d9b978] absolute top-4 right-4 fill-current" />
                )}
                {note.title && <h4 className="text-sm font-bold text-[#f3f4f6] pr-6">{note.title}</h4>}
                <p className="text-xs text-[#f3f4f6] leading-relaxed whitespace-pre-wrap">
                  "{note.content}"
                </p>
                <div className="text-[10px] text-[#9ca3af] pt-2 border-t border-[#1d2636]">
                  {new Date(note.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. BUCKET LIST */}
      {activeTab === 'bucket' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#f3f4f6]">Our Couple Bucket List</h3>
              <p className="text-xs text-[#9ca3af]">Dreams, campus adventures, and Kanpur excursions to tick off together</p>
            </div>
            <button
              onClick={() => setShowAddBucketModal(true)}
              className="px-4 py-2 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Bucket Item</span>
            </button>
          </div>

          <div className="space-y-2">
            {bucketList.map(item => (
              <div
                key={item.id}
                onClick={() => handleToggleBucket(item.id)}
                className={`p-4 rounded-xl border flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                  item.is_completed
                    ? 'bg-[#151a25]/50 border-[#2b3548] opacity-75'
                    : 'bg-[#151a25] border-[#2b3548] hover:border-[#d9b978]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${item.is_completed ? 'bg-[#4ade80] border-[#4ade80] text-[#101827]' : 'border-[#9ca3af]'}`}>
                    {item.is_completed && <CheckCircle2 className="w-4 h-4 fill-current" />}
                  </div>
                  <div>
                    <span className={`text-sm ${item.is_completed ? 'line-through text-[#9ca3af]' : 'text-[#f3f4f6] font-medium'}`}>
                      {item.activity}
                    </span>
                    {item.notes && <p className="text-[11px] text-[#9ca3af]">{item.notes}</p>}
                  </div>
                </div>

                {item.target_date && (
                  <span className="text-[10px] text-[#d9b978] font-mono shrink-0">
                    Target: {new Date(item.target_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. COUNTDOWN */}
      {activeTab === 'countdown' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-[#f3f4f6]">Milestones & Countdowns</h3>
            <p className="text-xs text-[#9ca3af]">Upcoming relationship anniversaries and special campus milestones</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-2">
              <span className="text-xs text-[#e879a9] font-semibold">Annual Milestone</span>
              <h4 className="text-xl font-bold text-[#f3f4f6]">Relationship Anniversary</h4>
              <div className="text-3xl font-mono font-extrabold text-[#d9b978] pt-2">
                {daysToAnniversary} <span className="text-sm font-normal text-[#9ca3af]">days to go</span>
              </div>
              <p className="text-xs text-[#9ca3af]">
                Plan a special evening at Ganga Barrage or Swaroop Nagar!
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-2">
              <span className="text-xs text-[#4ade80] font-semibold">Journey Log</span>
              <h4 className="text-xl font-bold text-[#f3f4f6]">Total Days Together</h4>
              <div className="text-3xl font-mono font-extrabold text-[#f3f4f6] pt-2">
                {daysTogether} <span className="text-sm font-normal text-[#9ca3af]">days</span>
              </div>
              <p className="text-xs text-[#9ca3af]">
                Every semester milestone recorded in your private space.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. COUPLE QUIZ & DAILY QUESTION */}
      {activeTab === 'quiz' && (
        <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 text-xs text-[#d9b978] font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Today's Couple Prompt</span>
          </div>

          <h3 className="text-lg font-bold text-[#f3f4f6]">
            "What is your single happiest shared memory from this semester on campus?"
          </h3>

          {savedQuizAnswer ? (
            <div className="p-4 rounded-xl bg-[#101827] border border-[#4ade80]/30 space-y-2">
              <span className="text-xs text-[#4ade80] font-semibold">Your response recorded:</span>
              <p className="text-xs text-[#f3f4f6]">"{savedQuizAnswer}"</p>
              <span className="text-[10px] text-[#9ca3af] block pt-1">
                Waiting for partner’s response to reveal comparison!
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                rows={3}
                value={quizAnswer}
                onChange={(e) => setQuizAnswer(e.target.value)}
                placeholder="Share your honest answer here..."
                className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs sm:text-sm text-[#f3f4f6] placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#d9b978]"
              />
              <button
                onClick={() => {
                  if (quizAnswer.trim()) setSavedQuizAnswer(quizAnswer.trim());
                }}
                className="px-4 py-2 bg-[#d9b978] text-[#101827] text-xs font-semibold rounded-xl shadow-md"
              >
                Submit Today's Answer
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD MEMORY */}
      {showAddMemoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#151a25] border border-[#2b3548] p-6 space-y-4 shadow-2xl relative text-left">
            <button onClick={() => setShowAddMemoryModal(false)} className="absolute top-4 right-4 p-1.5 text-[#9ca3af]"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-[#f3f4f6]">Add a Shared Memory</h3>
            <form onSubmit={handleAddMemory} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">Memory Title *</label>
                <input
                  type="text"
                  value={memoryTitle}
                  onChange={(e) => setMemoryTitle(e.target.value)}
                  placeholder="e.g. Rainy evening at library lawn"
                  required
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">Date</label>
                <input
                  type="date"
                  value={memoryDate}
                  onChange={(e) => setMemoryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">Caption / Thoughts</label>
                <textarea
                  rows={3}
                  value={memoryCaption}
                  onChange={(e) => setMemoryCaption(e.target.value)}
                  placeholder="What made this moment special?"
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddMemoryModal(false)} className="px-4 py-2 text-xs text-[#9ca3af]">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#d9b978] text-[#101827] text-xs font-semibold rounded-xl">Save Memory</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NOTE */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#151a25] border border-[#2b3548] p-6 space-y-4 shadow-2xl relative text-left">
            <button onClick={() => setShowAddNoteModal(false)} className="absolute top-4 right-4 p-1.5 text-[#9ca3af]"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-[#f3f4f6]">Write a Love Note</h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">Title (Optional)</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Good luck for your practicals!"
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">Note Message *</label>
                <textarea
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write something sweet or encouraging..."
                  required
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddNoteModal(false)} className="px-4 py-2 text-xs text-[#9ca3af]">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#e879a9] text-[#101827] text-xs font-semibold rounded-xl">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD BUCKET LIST */}
      {showAddBucketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#151a25] border border-[#2b3548] p-6 space-y-4 shadow-2xl relative text-left">
            <button onClick={() => setShowAddBucketModal(false)} className="absolute top-4 right-4 p-1.5 text-[#9ca3af]"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold text-[#f3f4f6]">Add Bucket List Goal</h3>
            <form onSubmit={handleAddBucketItem} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">Activity Goal *</label>
                <input
                  type="text"
                  value={bucketActivity}
                  onChange={(e) => setBucketActivity(e.target.value)}
                  placeholder="e.g. Try Bithoor riverboat sunrise"
                  required
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">Target Date (Optional)</label>
                <input
                  type="date"
                  value={bucketDate}
                  onChange={(e) => setBucketDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={bucketNotes}
                  onChange={(e) => setBucketNotes(e.target.value)}
                  placeholder="e.g. Bring thermos with adrak chai"
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddBucketModal(false)} className="px-4 py-2 text-xs text-[#9ca3af]">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#d9b978] text-[#101827] text-xs font-semibold rounded-xl">Save Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
