import React, { useEffect, useState } from 'react';
import { 
  MessageSquareQuote, 
  Heart, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  Search, 
  Filter, 
  Plus, 
  X, 
  MessageCircle,
  Flag,
  Flame,
  Laugh,
  Check,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { Confession, ConfessionCategory, Profile } from '../types';

interface ConfessionsPageProps {
  currentUser: Profile;
}

const CATEGORIES: ('All' | ConfessionCategory)[] = [
  'All',
  'Crushes',
  'College life',
  'Appreciation',
  'Love',
  'Friendship',
  'Funny incidents',
  'Relationships',
  'Personal experiences',
  'General thoughts'
];

export const ConfessionsPage: React.FC<ConfessionsPageProps> = ({ currentUser }) => {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'All' | ConfessionCategory>('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'latest' | 'popular'>('latest');
  const [loading, setLoading] = useState(true);

  // New Confession Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ConfessionCategory>('Crushes');
  const [contentWarning, setContentWarning] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<string | null>(null);

  // Comment Modal / Inline Expansion
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);

  // Reporting State
  const [reportingConfessionId, setReportingConfessionId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Doxxing / Exposing Personal Phone Numbers');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSent, setReportSent] = useState(false);

  // Client-side auto-moderation check
  const phoneRegex = /(?:\+91[\-\s]?)?[6-9]\d{9}\b|\b\d{5}[\-\s]?\d{5}\b/;
  const addressDoxxRegex = /\b(?:room\s*(?:no\.?|number)?\s*\d{1,4}|hostel\s*[1-9]\b|flat\s*no|house\s*no)\b/i;
  const abuseWords = ['mc', 'bc', 'chutiya', 'harami', 'slut', 'whore', 'kill yourself', 'doxx', 'leak'];

  const hasPhoneDetected = phoneRegex.test(content);
  const hasDoxxDetected = addressDoxxRegex.test(content);
  const hasAbuseDetected = abuseWords.some(w => new RegExp(`\\b${w}\\b`, 'i').test(content.toLowerCase()));
  const isContentBlocked = hasPhoneDetected || hasDoxxDetected || hasAbuseDetected;

  const loadConfessions = async () => {
    setLoading(true);
    try {
      const res = await api.getConfessions({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search,
        sort
      });
      setConfessions(res.confessions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfessions();
  }, [selectedCategory, sort]);

  const handleReact = async (id: string, reaction: string) => {
    try {
      const res = await api.reactConfession(id, reaction);
      setConfessions(prev => prev.map(c => c.id === id ? {
        ...c,
        likes_count: res.likes_count,
        user_reaction: res.user_reaction
      } : c));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitConfession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (isContentBlocked) {
      setModalFeedback('Please remove prohibited personal contact details or abusive language before submitting.');
      return;
    }

    setSubmitting(true);
    setModalFeedback(null);
    try {
      const res = await api.submitConfession({
        content: content.trim(),
        category,
        contentWarning: contentWarning.trim() || undefined
      });

      setModalFeedback('Confession published successfully to anonymous feed!');
      setConfessions(prev => [res.confession, ...prev]);

      setTimeout(() => {
        setContent('');
        setContentWarning('');
        setModalFeedback(null);
        setIsModalOpen(false);
      }, 1200);
    } catch (err: any) {
      setModalFeedback(err.message || 'Submission rejected by safety moderation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddComment = async (confessionId: string) => {
    if (!commentInput.trim()) return;
    setCommentError(null);
    try {
      const res = await api.commentConfession(confessionId, commentInput.trim());
      setConfessions(prev => prev.map(c => {
        if (c.id === confessionId) {
          const list = c.comments || [];
          return {
            ...c,
            comments_count: c.comments_count + 1,
            comments: [...list, res.comment]
          };
        }
        return c;
      }));
      setCommentInput('');
    } catch (err: any) {
      setCommentError(err.message || 'Failed to post comment.');
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingConfessionId) return;

    try {
      await api.submitReport({
        targetType: 'confession',
        targetId: reportingConfessionId,
        reason: reportReason,
        details: reportDetails
      });
      setReportSent(true);
      setTimeout(() => {
        setReportSent(false);
        setReportingConfessionId(null);
        setReportDetails('');
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[#f3f4f6]">
      {/* Header & Post Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#151a25] to-[#1d2636] border border-[#2b3548]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#e879a9] font-semibold mb-1">
            <MessageSquareQuote className="w-4 h-4" />
            <span>Campus Storytelling Community</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f3f4f6]">
            HBTU Confessions
          </h1>
          <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
            Read and share genuine campus thoughts, crushes, and memories anonymously. Real identities are never exposed.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 bg-[#e879a9] hover:bg-[#d86898] text-[#101827] font-semibold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Write a Confession</span>
        </button>
      </div>

      {/* Filter and Category Pills */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 text-xs">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#d9b978] text-[#101827] font-bold shadow-sm'
                  : 'bg-[#151a25] text-[#9ca3af] hover:text-[#f3f4f6] border border-[#2b3548]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadConfessions()}
              placeholder="Search confessions..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#151a25] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6] placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#d9b978]"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#151a25] p-1 rounded-xl border border-[#2b3548] text-xs">
            <button
              onClick={() => setSort('latest')}
              className={`px-3 py-1 rounded-lg transition-colors ${sort === 'latest' ? 'bg-[#1d2636] text-[#d9b978] font-semibold' : 'text-[#9ca3af]'}`}
            >
              Latest
            </button>
            <button
              onClick={() => setSort('popular')}
              className={`px-3 py-1 rounded-lg transition-colors ${sort === 'popular' ? 'bg-[#1d2636] text-[#d9b978] font-semibold' : 'text-[#9ca3af]'}`}
            >
              Popular
            </button>
          </div>
        </div>
      </div>

      {/* Confessions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#9ca3af] animate-pulse">
            Loading campus confessions...
          </div>
        ) : confessions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#1d2636] text-[#e879a9] flex items-center justify-center mx-auto">
              <MessageSquareQuote className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-bold text-[#f3f4f6]">No posts yet. Be the first to start a conversation!</p>
              <p className="text-xs text-[#9ca3af] mt-1 max-w-sm mx-auto">
                Share a crush, an exam memory, or a heartfelt message. Your identity stays completely anonymous.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Share the First Confession</span>
            </button>
          </div>
        ) : (
          confessions.map((conf) => {
            const isCommentsOpen = expandedCommentsId === conf.id;
            return (
              <div
                key={conf.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-3 hover:border-[#2b3548]/90 transition-colors"
              >
                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-[#9ca3af]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#e879a9]">{conf.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[11px] text-[#9ca3af]">
                      {new Date(conf.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {conf.content_warning && (
                    <span className="text-[10px] text-[#d9b978] bg-[#d9b978]/10 px-2 py-0.5 rounded border border-[#d9b978]/30">
                      CW: {conf.content_warning}
                    </span>
                  )}
                </div>

                {/* Confession Body */}
                <p className="text-sm sm:text-base text-[#f3f4f6] leading-relaxed whitespace-pre-wrap">
                  "{conf.content}"
                </p>

                {/* Reaction Actions & Safety Options */}
                <div className="pt-2 border-t border-[#1d2636] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleReact(conf.id, 'heart')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-colors ${
                        conf.user_reaction === 'heart'
                          ? 'border-[#e879a9] bg-[#e879a9]/20 text-[#e879a9] font-bold'
                          : 'border-[#2b3548] bg-[#101827] text-[#9ca3af] hover:text-[#e879a9]'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{conf.likes_count}</span>
                    </button>

                    <button
                      onClick={() => setExpandedCommentsId(isCommentsOpen ? null : conf.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2b3548] bg-[#101827] text-xs text-[#9ca3af] hover:text-[#d9b978] transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{conf.comments_count} Comments</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[#9ca3af] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" />
                      <span>Verified HBTU Student</span>
                    </span>

                    {/* Report Post Trigger */}
                    <button
                      onClick={() => setReportingConfessionId(conf.id)}
                      className="text-[11px] text-[#9ca3af] hover:text-[#f87171] transition-colors flex items-center gap-1 p-1"
                      title="Report this confession"
                    >
                      <Flag className="w-3 h-3" />
                      <span className="hidden sm:inline">Report</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Anonymous Comments */}
                {isCommentsOpen && (
                  <div className="pt-4 border-t border-[#1d2636] space-y-3">
                    <h5 className="text-xs font-semibold text-[#9ca3af] uppercase tracking-wider">
                      Anonymous Comments ({conf.comments?.length || 0})
                    </h5>

                    {commentError && (
                      <div className="p-2.5 rounded-lg bg-[#f87171]/10 border border-[#f87171]/30 text-xs text-[#f87171]">
                        {commentError}
                      </div>
                    )}

                    {conf.comments && conf.comments.length > 0 ? (
                      <div className="space-y-2">
                        {conf.comments.map(c => (
                          <div key={c.id} className="p-3 rounded-xl bg-[#101827] border border-[#2b3548] text-xs space-y-1">
                            <div className="flex justify-between text-[10px] text-[#9ca3af]">
                              <span>{c.author_name || 'Verified Student'}</span>
                              <span>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-[#f3f4f6]">{c.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#9ca3af]">No comments yet. Leave the first reply!</p>
                    )}

                    {/* New Comment Input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(conf.id)}
                        placeholder="Add an anonymous reply..."
                        className="flex-1 px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6] placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#d9b978]"
                      />
                      <button
                        onClick={() => handleAddComment(conf.id)}
                        className="p-2 bg-[#d9b978] text-[#101827] hover:bg-[#c9a968] rounded-xl font-bold transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* SUBMISSION MODAL WITH AUTO-MODERATION CHECK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-[#151a25] border border-[#2b3548] p-6 space-y-4 shadow-2xl relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9ca3af] hover:text-[#f3f4f6]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-[#f3f4f6]">Share an Anonymous Confession</h3>
              <p className="text-xs text-[#9ca3af] mt-1">
                Your name, email, and user identity are completely decoupled. Posted as "Verified HBTU Student".
              </p>
            </div>

            {/* Live Moderation Warnings */}
            {hasPhoneDetected && (
              <div className="p-3 rounded-xl bg-[#f87171]/15 border border-[#f87171]/40 text-xs text-[#f87171] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Safety Rule:</strong> Personal phone numbers are detected. Do not share contact numbers in public confessions.
                </span>
              </div>
            )}

            {hasDoxxDetected && (
              <div className="p-3 rounded-xl bg-[#f87171]/15 border border-[#f87171]/40 text-xs text-[#f87171] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Anti-Doxxing Rule:</strong> Hostel room numbers or private addresses are detected. Specific locations are blocked for student privacy.
                </span>
              </div>
            )}

            {hasAbuseDetected && (
              <div className="p-3 rounded-xl bg-[#f87171]/15 border border-[#f87171]/40 text-xs text-[#f87171] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Community Guidelines:</strong> Abusive, harassing, or defamatory words are prohibited.
                </span>
              </div>
            )}

            {modalFeedback && (
              <div className={`p-3 rounded-xl text-xs ${
                modalFeedback.includes('successfully')
                  ? 'bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80]'
                  : 'bg-[#f87171]/10 border border-[#f87171]/30 text-[#f87171]'
              }`}>
                {modalFeedback}
              </div>
            )}

            <form onSubmit={handleSubmitConfession} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ConfessionCategory)}
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Confession Story *
                </label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share what happened after class, library moments, or unexpressed admiration..."
                  required
                  className={`w-full px-3 py-2.5 bg-[#101827] border rounded-xl text-xs sm:text-sm text-[#f3f4f6] placeholder-[#9ca3af]/40 focus:outline-none ${
                    isContentBlocked ? 'border-[#f87171]' : 'border-[#2b3548] focus:border-[#d9b978]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">
                  Content Warning (Optional)
                </label>
                <input
                  type="text"
                  value={contentWarning}
                  onChange={(e) => setContentWarning(e.target.value)}
                  placeholder="e.g. Exam stress, emotional"
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#101827] border border-[#2b3548] text-[11px] text-[#9ca3af] leading-relaxed">
                <span className="text-[#e879a9] font-semibold block mb-0.5">Campus Moderation Guard:</span>
                All posts pass through automated abuse and doxxing filters. Inappropriate posts are auto-rejected to ensure a safe space for all HBTU students.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#9ca3af] hover:text-[#f3f4f6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || isContentBlocked || !content.trim()}
                  className="px-5 py-2.5 bg-[#e879a9] hover:bg-[#d86898] text-[#101827] font-semibold text-xs rounded-xl transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Post Confession'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT CONFESSION MODAL */}
      {reportingConfessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#151a25] border border-[#f87171]/40 p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setReportingConfessionId(null)}
              className="absolute top-4 right-4 p-1.5 text-[#9ca3af] hover:text-[#f3f4f6]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#f87171]">
              <Flag className="w-5 h-5" />
              <h3 className="text-lg font-bold text-[#f3f4f6]">Report Confession</h3>
            </div>

            <p className="text-xs text-[#9ca3af]">
              Help keep HBTU campus conversations safe. Reports are audited confidentially by moderators.
            </p>

            {reportSent ? (
              <div className="p-4 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/30 text-xs text-[#4ade80] text-center">
                Report submitted successfully. Thank you for keeping our community safe.
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">Reason *</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
                  >
                    <option value="Doxxing / Exposing Personal Phone Numbers">Doxxing / Exposing Personal Phone Numbers</option>
                    <option value="Hostel Room / Address Exposure">Hostel Room / Address Exposure</option>
                    <option value="Harassment or Abusive Language">Harassment or Abusive Language</option>
                    <option value="Inappropriate / Obscene Content">Inappropriate / Obscene Content</option>
                    <option value="Commercial Spam">Commercial Spam</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#9ca3af] mb-1">Details (Optional)</label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide additional context for moderators..."
                    className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportingConfessionId(null)}
                    className="px-4 py-2 text-xs text-[#9ca3af]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#f87171] hover:bg-[#e06060] text-white text-xs font-semibold rounded-xl transition-colors"
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
