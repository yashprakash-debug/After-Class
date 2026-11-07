import React, { useEffect, useState, useRef } from 'react';
import { 
  Heart, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  MoreVertical, 
  UserX, 
  Flag, 
  MessageSquare, 
  ArrowLeft,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { Match, Message, Profile } from '../types';

interface MatchesPageProps {
  currentUser: Profile;
  onNavigate: (path: string) => void;
}

export const MatchesPage: React.FC<MatchesPageProps> = ({ currentUser, onNavigate }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMatches = async () => {
    try {
      const res = await api.getMatches();
      setMatches(res.matches || []);
      if (res.matches && res.matches.length > 0 && !activeMatch) {
        selectMatch(res.matches[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const selectMatch = async (match: Match) => {
    setActiveMatch(match);
    setShowMenu(false);
    try {
      const res = await api.getMessages(match.id);
      setMessages(res.messages || []);
      scrollToBottom();

      // Fetch AI conversation starters for this specific match
      if (match.otherProfile) {
        setLoadingAi(true);
        api.getAiAssistance('conversation_starters', {
          interests: match.otherProfile.interests,
          branch: match.otherProfile.branch
        }).then(aiRes => {
          setAiSuggestions(aiRes.suggestions || []);
          setLoadingAi(false);
        }).catch(() => setLoadingAi(false));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeMatch) return;

    setSending(true);
    try {
      const res = await api.sendMessage(activeMatch.id, text.trim());
      if (res.success && res.message) {
        setMessages(prev => [...prev, res.message]);
        if (!textToSend) setInputText('');
        scrollToBottom();

        // Update last message in matches list
        setMatches(prev => prev.map(m => m.id === activeMatch.id ? {
          ...m,
          lastMessage: text.trim(),
          lastMessageTime: 'Just now'
        } : m));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleUnmatch = async () => {
    if (!activeMatch) return;
    if (!window.confirm(`Are you sure you want to unmatch with ${activeMatch.otherProfile?.display_name}? This cannot be undone.`)) return;

    try {
      await api.unmatch(activeMatch.id);
      setMatches(prev => prev.filter(m => m.id !== activeMatch.id));
      setActiveMatch(null);
      setMessages([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-[#f3f4f6]">
      <div className="rounded-2xl bg-[#151a25] border border-[#2b3548] overflow-hidden shadow-2xl h-[calc(100vh-140px)] min-h-[550px] grid grid-cols-1 md:grid-cols-12">
        
        {/* Left: Matches List (4 cols) */}
        <div className={`md:col-span-4 border-r border-[#1d2636] flex flex-col h-full ${activeMatch ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-[#1d2636] bg-[#101827]/40">
            <h2 className="text-base font-bold text-[#f3f4f6]">Active Matches</h2>
            <p className="text-xs text-[#9ca3af]">Consensual campus chats</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#1d2636]">
            {loading ? (
              <div className="p-6 text-center text-xs text-[#9ca3af] animate-pulse">
                Loading verified matches...
              </div>
            ) : matches.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#1d2636] text-[#e879a9] flex items-center justify-center mx-auto">
                  <Heart className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-[#f3f4f6]">No active matches yet</h4>
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  Head over to Discover and like students with common campus passions!
                </p>
                <button
                  onClick={() => onNavigate('/discover')}
                  className="px-4 py-2 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] text-xs font-semibold rounded-xl"
                >
                  Discover Students
                </button>
              </div>
            ) : (
              matches.map((m) => {
                const isSelected = activeMatch?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => selectMatch(m)}
                    className={`w-full p-4 text-left flex items-center gap-3 transition-colors ${
                      isSelected ? 'bg-[#1d2636]' : 'hover:bg-[#101827]/60'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={m.otherProfile?.avatar_url || 'https://placehold.co/100'}
                        alt={m.otherProfile?.display_name || 'Match'}
                        className="w-12 h-12 rounded-full object-cover border border-[#2b3548]"
                        referrerPolicy="no-referrer"
                      />
                      {m.unreadCount && m.unreadCount > 0 ? (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#e879a9] text-[#101827] text-[10px] font-bold flex items-center justify-center">
                          {m.unreadCount}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-semibold text-[#f3f4f6] truncate">
                          {m.otherProfile?.display_name}
                        </span>
                        <span className="text-[10px] text-[#9ca3af] font-mono">
                          {m.lastMessageTime || 'Recent'}
                        </span>
                      </div>
                      <p className="text-xs text-[#9ca3af] truncate">
                        {m.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Active Chat Area (8 cols) */}
        <div className={`md:col-span-8 flex flex-col h-full bg-[#101827]/30 ${!activeMatch ? 'hidden md:flex' : 'flex'}`}>
          {activeMatch ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 px-5 border-b border-[#1d2636] bg-[#151a25] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveMatch(null)}
                    className="md:hidden p-1.5 text-[#9ca3af] hover:text-[#f3f4f6]"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <img
                    src={activeMatch.otherProfile?.avatar_url || 'https://placehold.co/100'}
                    alt={activeMatch.otherProfile?.display_name || 'Match'}
                    className="w-10 h-10 rounded-full object-cover border border-[#d9b978]/40"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[#f3f4f6]">
                        {activeMatch.otherProfile?.full_name}
                      </span>
                      <span title="Verified HBTU Student">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" />
                      </span>
                    </div>
                    <span className="text-[11px] text-[#9ca3af]">
                      {activeMatch.otherProfile?.branch} · {activeMatch.otherProfile?.academic_year}
                    </span>
                  </div>
                </div>

                {/* Chat Options Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-2 rounded-xl text-[#9ca3af] hover:text-[#f3f4f6] hover:bg-[#1d2636] transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#151a25] border border-[#2b3548] p-1.5 shadow-2xl z-30 space-y-1">
                      <button
                        onClick={handleUnmatch}
                        className="w-full text-left px-3 py-2 text-xs text-[#f87171] hover:bg-[#1d2636] rounded-lg flex items-center gap-2"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Unmatch</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <p className="text-xs text-[#9ca3af]">
                      You matched with {activeMatch.otherProfile?.display_name}! Break the ice with a thoughtful message.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? 'bg-[#d9b978] text-[#101827] font-medium rounded-br-sm'
                              : 'bg-[#1d2636] text-[#f3f4f6] border border-[#2b3548] rounded-bl-sm'
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-[#9ca3af] px-1 mt-1 font-mono">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* AI Icebreaker suggestions toolbar */}
              {aiSuggestions.length > 0 && (
                <div className="px-4 py-2 bg-[#151a25]/60 border-t border-[#1d2636] flex items-center gap-2 overflow-x-auto text-[11px]">
                  <span className="flex items-center gap-1 text-[#d9b978] shrink-0 font-medium">
                    <Sparkles className="w-3 h-3" />
                    <span>Suggestions:</span>
                  </span>
                  {aiSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(suggestion)}
                      className="px-2.5 py-1 rounded-lg bg-[#101827] border border-[#2b3548] text-[#9ca3af] hover:text-[#f3f4f6] hover:border-[#d9b978] shrink-0 transition-colors truncate max-w-[240px]"
                    >
                      "{suggestion}"
                    </button>
                  ))}
                </div>
              )}

              {/* Input Form */}
              <div className="p-3 sm:p-4 bg-[#151a25] border-t border-[#1d2636]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${activeMatch.otherProfile?.display_name}...`}
                    className="flex-1 px-4 py-2.5 bg-[#101827] border border-[#2b3548] rounded-xl text-xs sm:text-sm text-[#f3f4f6] placeholder-[#9ca3af]/50 focus:outline-none focus:border-[#d9b978]"
                  />
                  <button
                    type="submit"
                    disabled={sending || !inputText.trim()}
                    className="p-2.5 bg-[#d9b978] hover:bg-[#c9a968] text-[#101827] rounded-xl font-bold transition-all disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#9ca3af] space-y-3">
              <MessageSquare className="w-12 h-12 text-[#2b3548]" />
              <h4 className="text-sm font-semibold text-[#f3f4f6]">Select a match to open private conversation</h4>
              <p className="text-xs max-w-xs">
                Encrypted and visible only to matched students. No public links.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
