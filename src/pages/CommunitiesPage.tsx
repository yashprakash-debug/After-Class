import React, { useEffect, useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Music, 
  Camera, 
  Trophy, 
  Dumbbell, 
  Film, 
  Gamepad2, 
  Brain, 
  Cpu, 
  Zap, 
  Compass, 
  Coffee,
  Plus,
  MessageSquare,
  Heart,
  Send,
  X,
  Check,
  Flag
} from 'lucide-react';
import { api } from '../services/api';
import { Community, CommunityPost, Profile } from '../types';

interface CommunitiesPageProps {
  currentUser: Profile;
}

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Music,
  Camera,
  Trophy,
  Dumbbell,
  Film,
  Gamepad2,
  Brain,
  Cpu,
  Zap,
  Compass,
  Coffee,
  Users
};

export const CommunitiesPage: React.FC<CommunitiesPageProps> = ({ currentUser }) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [activeCommunity, setActiveCommunity] = useState<Community | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  // New Post Form
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  // Reporting Post
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState('Harassment or abusive content');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getCommunities();
        setCommunities(res.communities || []);
        if (res.communities && res.communities.length > 0) {
          selectCommunity(res.communities[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectCommunity = async (comm: Community) => {
    setActiveCommunity(comm);
    try {
      const res = await api.getCommunityPosts(comm.id);
      setPosts(res.posts || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleJoin = async (commId: string) => {
    try {
      const res = await api.toggleJoinCommunity(commId);
      setCommunities(prev => prev.map(c => c.id === commId ? {
        ...c,
        is_member: res.is_member,
        members_count: res.members_count
      } : c));
      if (activeCommunity?.id === commId) {
        setActiveCommunity(prev => prev ? {
          ...prev,
          is_member: res.is_member,
          members_count: res.members_count
        } : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommunity || !postTitle.trim() || !postContent.trim()) return;

    setSubmitting(true);
    setPostError(null);
    try {
      const res = await api.createCommunityPost(activeCommunity.id, {
        title: postTitle.trim(),
        content: postContent.trim()
      });
      setPosts(prev => [res.post, ...prev]);
      setShowNewPostModal(false);
      setPostTitle('');
      setPostContent('');
    } catch (err: any) {
      setPostError(err.message || 'Failed to submit post.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingPostId) return;
    try {
      await api.submitReport({
        targetType: 'community_post',
        targetId: reportingPostId,
        reason: reportReason,
        details: reportDetails
      });
      setReportSent(true);
      setTimeout(() => {
        setReportSent(false);
        setReportingPostId(null);
        setReportDetails('');
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-[#f3f4f6]">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#151a25] to-[#1d2636] border border-[#2b3548] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#d9b978] font-semibold mb-1">
            <Users className="w-4 h-4" />
            <span>Interest-Based Campus Circles</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#f3f4f6]">
            HBTU Communities
          </h1>
          <p className="text-xs sm:text-sm text-[#9ca3af] mt-1">
            Connect over hobbies, projects, games, and passions beyond engineering lectures.
          </p>
        </div>

        {activeCommunity && (
          <button
            onClick={() => setShowNewPostModal(true)}
            className="px-4 py-2.5 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Post in {activeCommunity.name}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 12 Communities Directory (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl bg-[#151a25] border border-[#2b3548] p-3 space-y-1 overflow-hidden">
          <div className="px-3 py-2 text-xs font-bold text-[#9ca3af] uppercase tracking-wider">
            All Campus Clubs ({communities.length})
          </div>

          <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
            {communities.map((comm) => {
              const Icon = ICON_MAP[comm.icon_name] || Users;
              const isSelected = activeCommunity?.id === comm.id;
              return (
                <button
                  key={comm.id}
                  onClick={() => selectCommunity(comm)}
                  className={`w-full p-3 rounded-xl text-left flex items-center justify-between gap-3 transition-colors ${
                    isSelected ? 'bg-[#1d2636] border border-[#d9b978]/40' : 'hover:bg-[#101827]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#d9b978] text-[#101827]' : 'bg-[#101827] text-[#d9b978]'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <h4 className="text-xs font-bold text-[#f3f4f6] truncate">{comm.name}</h4>
                      <span className="text-[10px] text-[#9ca3af]">{comm.members_count} members</span>
                    </div>
                  </div>

                  {comm.is_member && (
                    <span className="text-[10px] text-[#4ade80] font-semibold bg-[#4ade80]/10 px-2 py-0.5 rounded shrink-0">
                      Joined
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Community Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {activeCommunity ? (
            <>
              {/* Community Banner */}
              <div className="p-6 rounded-2xl bg-[#151a25] border border-[#2b3548] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#f3f4f6]">{activeCommunity.name}</h2>
                  <p className="text-xs text-[#9ca3af] mt-1 max-w-lg leading-relaxed">
                    {activeCommunity.description}
                  </p>
                </div>

                <button
                  onClick={() => handleToggleJoin(activeCommunity.id)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all shrink-0 ${
                    activeCommunity.is_member
                      ? 'border-[#f87171]/40 text-[#f87171] hover:bg-[#f87171]/10'
                      : 'bg-[#d9b978] text-[#101827] border-[#d9b978] hover:bg-[#c9a968]'
                  }`}
                >
                  {activeCommunity.is_member ? 'Leave Club' : 'Join Club'}
                </button>
              </div>

              {/* Posts Feed */}
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="p-10 rounded-2xl bg-[#151a25] border border-[#2b3548] text-center space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1d2636] text-[#d9b978] flex items-center justify-center mx-auto">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-semibold text-[#f3f4f6]">No discussion posts yet in {activeCommunity.name}.</h4>
                    <p className="text-xs text-[#9ca3af]">Be the first to share an idea, event, or question!</p>
                    <button
                      onClick={() => setShowNewPostModal(true)}
                      className="px-4 py-2 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] text-xs font-semibold rounded-xl inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Start Conversation</span>
                    </button>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className="p-5 rounded-2xl bg-[#151a25] border border-[#2b3548] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={post.author_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.author_name)}&backgroundColor=151a25&textColor=d9b978`}
                            alt={post.author_name}
                            className="w-8 h-8 rounded-full object-cover border border-[#2b3548]"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="text-xs font-semibold text-[#f3f4f6]">{post.author_name}</span>
                            <span className="text-[10px] text-[#9ca3af] block">{post.author_branch}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#9ca3af]">
                          {new Date(post.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-[#f3f4f6]">
                        {post.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#9ca3af] leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>

                      <div className="pt-2 border-t border-[#1d2636] flex items-center justify-between text-xs text-[#9ca3af]">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 text-[#e879a9]">
                            <Heart className="w-3.5 h-3.5 fill-current" />
                            <span>{post.likes_count}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{post.comments_count} replies</span>
                          </span>
                        </div>
                        <button
                          onClick={() => setReportingPostId(post.id)}
                          className="text-[11px] text-[#9ca3af] hover:text-[#f87171] transition-colors flex items-center gap-1 p-1"
                          title="Report post"
                        >
                          <Flag className="w-3 h-3" />
                          <span>Report</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-[#9ca3af]">
              Select a community from the directory to view discussions.
            </div>
          )}
        </div>
      </div>

      {/* NEW POST MODAL */}
      {showNewPostModal && activeCommunity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#151a25] border border-[#2b3548] p-6 space-y-4 shadow-2xl relative text-left">
            <button onClick={() => setShowNewPostModal(false)} className="absolute top-4 right-4 p-1.5 text-[#9ca3af]">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-[#f3f4f6]">Post to {activeCommunity.name}</h3>

            {postError && (
              <div className="p-2.5 rounded-xl bg-[#f87171]/10 border border-[#f87171]/30 text-xs text-[#f87171]">
                {postError}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">Title *</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Weekend study group / acoustic set"
                  required
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6] focus:outline-none focus:border-[#d9b978]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1">Content *</label>
                <textarea
                  rows={4}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share details with fellow club members..."
                  required
                  className="w-full px-3 py-2 bg-[#101827] border border-[#2b3548] rounded-xl text-xs text-[#f3f4f6] focus:outline-none focus:border-[#d9b978]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowNewPostModal(false)} className="px-4 py-2 text-xs text-[#9ca3af]">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-[#d9b978] text-[#101827] text-xs font-semibold rounded-xl disabled:opacity-50">
                  {submitting ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT POST MODAL */}
      {reportingPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#151a25] border border-[#f87171]/40 p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setReportingPostId(null)}
              className="absolute top-4 right-4 p-1.5 text-[#9ca3af] hover:text-[#f3f4f6]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-[#f87171]">
              <Flag className="w-5 h-5" />
              <h3 className="text-lg font-bold text-[#f3f4f6]">Report Discussion Post</h3>
            </div>

            <p className="text-xs text-[#9ca3af]">
              Help keep HBTU campus clubs safe and civil. Reports are reviewed promptly by moderators.
            </p>

            {reportSent ? (
              <div className="p-4 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/30 text-xs text-[#4ade80] text-center">
                Report submitted successfully. Thank you for maintaining community standards.
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
                    <option value="Harassment or abusive content">Harassment or abusive content</option>
                    <option value="Doxxing or personal contact sharing">Doxxing or personal contact sharing</option>
                    <option value="Spam or off-topic advertising">Spam or off-topic advertising</option>
                    <option value="Inappropriate language">Inappropriate language</option>
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
                    onClick={() => setReportingPostId(null)}
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
