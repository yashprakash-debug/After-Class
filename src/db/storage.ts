import fs from 'fs';
import path from 'path';
import { 
  Profile, 
  Match, 
  Message, 
  Confession, 
  SecretAdmirerRequest, 
  CoupleSpace, 
  CoupleMemory, 
  CoupleNote, 
  CoupleBucketItem, 
  DatePlan, 
  Community, 
  CommunityPost, 
  CampusEvent, 
  CampusPoll, 
  AppNotification, 
  UserReport, 
  AuditLog, 
  VerificationRequest,
  MatchScoreBreakdown
} from '../types';

// Matching Algorithm Weights
// Shared interests: 40%
// Personality answers: 25%
// Common activities: 20%
// Mutual preferences: 15%
export function calculateMatchScore(profileA: Profile, profileB: Profile): MatchScoreBreakdown {
  const setA = new Set(profileA.interests || []);
  const commonInterests = (profileB.interests || []).filter(item => setA.has(item));
  const maxPossibleInterests = Math.max(setA.size, (profileB.interests || []).length, 1);
  const interestRatio = Math.min(commonInterests.length / Math.min(maxPossibleInterests, 5), 1.0);
  const sharedInterestsScore = Math.round(interestRatio * 40);

  const pA = profileA.personality_answers || {};
  const pB = profileB.personality_answers || {};
  const commonKeys = Object.keys(pA).filter(k => k in pB);
  let personalityMatches = 0;
  const commonTraits: string[] = [];
  commonKeys.forEach(k => {
    if (pA[k] === pB[k]) {
      personalityMatches++;
      commonTraits.push(`${k}: ${pA[k]}`);
    }
  });
  const personalityRatio = commonKeys.length > 0 ? personalityMatches / commonKeys.length : 0.5;
  const personalityScore = Math.round(personalityRatio * 25);

  const activityKeywords = ['Gaming', 'Fitness', 'Chess', 'Travel', 'Photography', 'Music', 'Movies', 'Sports'];
  const actA = (profileA.interests || []).filter(i => activityKeywords.some(kw => i.toLowerCase().includes(kw.toLowerCase())));
  const actB = (profileB.interests || []).filter(i => activityKeywords.some(kw => i.toLowerCase().includes(kw.toLowerCase())));
  const commonActs = actA.filter(i => actB.includes(i));
  const activityRatio = Math.min(commonActs.length / 2, 1.0);
  const commonActivitiesScore = Math.round(activityRatio * 20);

  const prefsA = new Set(profileA.connection_preferences || []);
  const mutualPrefs = (profileB.connection_preferences || []).filter(p => prefsA.has(p));
  const prefRatio = mutualPrefs.length > 0 ? 1.0 : 0.2;
  const mutualPreferencesScore = Math.round(prefRatio * 15);

  const totalScore = sharedInterestsScore + personalityScore + commonActivitiesScore + mutualPreferencesScore;

  return {
    totalScore: Math.min(Math.max(totalScore, 20), 98),
    sharedInterestsScore,
    personalityScore,
    commonActivitiesScore,
    mutualPreferencesScore,
    commonInterests,
    commonTraits
  };
}

// -------------------------------------------------------------
// STRICT DOMAIN & CONTENT MODERATION SAFEGUARDS
// -------------------------------------------------------------

export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.toLowerCase().trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

// Any valid email is accepted for login and registration
export function isHBTUEmail(email: string): boolean {
  return isValidEmail(email);
}

export interface ContentSafetyResult {
  isSafe: boolean;
  reason?: string;
}

export function checkContentSafety(text: string): ContentSafetyResult {
  if (!text || !text.trim()) {
    return { isSafe: true };
  }

  // 1. Phone number detection (10-digit Indian numbers, with or without +91 / dashes)
  const phoneRegex = /(?:\+91[\-\s]?)?[6-9]\d{9}\b|\b\d{5}[\-\s]?\d{5}\b/;
  if (phoneRegex.test(text)) {
    return {
      isSafe: false,
      reason: 'Sharing personal phone numbers is prohibited to protect campus safety and privacy.'
    };
  }

  // 2. Personal hostel room / residential address doxxing detection
  const addressDoxxingRegex = /\b(?:room\s*(?:no\.?|number)?\s*\d{1,4}|hostel\s*[1-9]\b|flat\s*no|house\s*no)\b/i;
  if (addressDoxxingRegex.test(text)) {
    return {
      isSafe: false,
      reason: 'Sharing specific hostel room numbers or private residential addresses is not permitted.'
    };
  }

  // 3. Severe abuse, harassment, or derogatory terms
  const abuseKeywords = ['mc', 'bc', 'chutiya', 'harami', 'slut', 'whore', 'kill yourself', 'doxx', 'leak'];
  const lower = text.toLowerCase();
  for (const word of abuseKeywords) {
    const wordPattern = new RegExp(`\\b${word}\\b`, 'i');
    if (wordPattern.test(lower)) {
      return {
        isSafe: false,
        reason: 'Post contains abusive language or harassment violating HBTU community guidelines.'
      };
    }
  }

  return { isSafe: true };
}

// -------------------------------------------------------------
// PERSISTENT DATABASE ENGINE (FLUSHED TO DISK)
// -------------------------------------------------------------

const DB_FILE_PATH = path.resolve(process.cwd(), 'data', 'afterclass_db.json');

interface StoredData {
  profiles: Profile[];
  verificationRequests: VerificationRequest[];
  likes: { id: string; sender_id: string; receiver_id: string; created_at: string }[];
  matches: Match[];
  messages: Message[];
  secretAdmirers: SecretAdmirerRequest[];
  confessions: Confession[];
  communities: Community[];
  communityPosts: CommunityPost[];
  coupleSpaces: CoupleSpace[];
  coupleMemories: CoupleMemory[];
  coupleNotes: CoupleNote[];
  coupleBucketLists: CoupleBucketItem[];
  datePlans: DatePlan[];
  events: CampusEvent[];
  polls: CampusPoll[];
  notifications: AppNotification[];
  reports: UserReport[];
  blocks: { blocker_id: string; blocked_id: string }[];
  auditLogs: AuditLog[];
  otpVerifications: { email: string; code: string; expiresAt: number }[];
}

export class DatabaseStore {
  profiles: Profile[] = [];
  verificationRequests: VerificationRequest[] = [];
  likes: { id: string; sender_id: string; receiver_id: string; created_at: string }[] = [];
  matches: Match[] = [];
  messages: Message[] = [];
  secretAdmirers: SecretAdmirerRequest[] = [];
  confessions: Confession[] = [];
  communities: Community[] = [];
  communityPosts: CommunityPost[] = [];
  coupleSpaces: CoupleSpace[] = [];
  coupleMemories: CoupleMemory[] = [];
  coupleNotes: CoupleNote[] = [];
  coupleBucketLists: CoupleBucketItem[] = [];
  datePlans: DatePlan[] = [];
  events: CampusEvent[] = [];
  polls: CampusPoll[] = [];
  notifications: AppNotification[] = [];
  reports: UserReport[] = [];
  blocks: { blocker_id: string; blocked_id: string }[] = [];
  auditLogs: AuditLog[] = [];
  otpVerifications: { email: string; code: string; expiresAt: number }[] = [];

  constructor() {
    this.initFromDisk();
  }

  private initFromDisk() {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const data: StoredData = JSON.parse(raw);
        this.profiles = data.profiles || [];
        this.verificationRequests = data.verificationRequests || [];
        this.likes = data.likes || [];
        this.matches = data.matches || [];
        this.messages = data.messages || [];
        this.secretAdmirers = data.secretAdmirers || [];
        this.confessions = data.confessions || [];
        this.communities = data.communities || this.defaultCommunities();
        this.communityPosts = data.communityPosts || [];
        this.coupleSpaces = data.coupleSpaces || [];
        this.coupleMemories = data.coupleMemories || [];
        this.coupleNotes = data.coupleNotes || [];
        this.coupleBucketLists = data.coupleBucketLists || [];
        this.datePlans = data.datePlans || [];
        this.events = data.events || [];
        this.polls = data.polls || [];
        this.notifications = data.notifications || [];
        this.reports = data.reports || [];
        this.blocks = data.blocks || [];
        this.auditLogs = data.auditLogs || [];
        this.otpVerifications = data.otpVerifications || [];
      } else {
        // Pure zero-state initialization: ZERO fake profiles, ZERO fake confessions, ZERO dummy posts!
        this.communities = this.defaultCommunities();
        this.persist();
      }
    } catch (err) {
      console.error('Error loading database from disk, starting clean:', err);
      this.communities = this.defaultCommunities();
    }
  }

  defaultCommunities(): Community[] {
    // Official campus club structures (empty of fake posts or synthetic users)
    return [
      { id: 'comm_01', name: 'Book Lovers', slug: 'book-lovers', description: 'Literature, classics, sci-fi and quiet reading circles on HBTU lawns.', icon_name: 'BookOpen', is_official: true, members_count: 0, posts_count: 0 },
      { id: 'comm_02', name: 'Music Addicts', slug: 'music-addicts', description: 'Jam sessions, indie discoveries, acoustic nights and campus musicians.', icon_name: 'Music', is_official: true, members_count: 0, posts_count: 0 },
      { id: 'comm_03', name: 'Photography Collective', slug: 'photography', description: 'Capturing Kanpur light, Ganga Barrage, Allen Forest, and campus architecture.', icon_name: 'Camera', is_official: true, members_count: 0, posts_count: 0 },
      { id: 'comm_04', name: 'Chess Guild', slug: 'chess', description: 'Rapid games, tactics puzzles, and campus tournament preparation.', icon_name: 'Trophy', is_official: true, members_count: 0, posts_count: 0 },
      { id: 'comm_05', name: 'Fitness & Athletics', slug: 'fitness', description: 'Gym logs, track runs around East Campus sports ground, and athletics.', icon_name: 'Dumbbell', is_official: true, members_count: 0, posts_count: 0 },
      { id: 'comm_06', name: 'Movie Club', slug: 'movies', description: 'Weekend screenings, cinema debates, and film review discussions.', icon_name: 'Film', is_official: true, members_count: 0, posts_count: 0 },
      { id: 'comm_07', name: 'Campus Gamers', slug: 'gaming', description: 'Valorant, CS2, strategy, and esports matches.', icon_name: 'Gamepad2', is_official: true, members_count: 0, posts_count: 0 },
      { id: 'comm_08', name: 'Philosophy & Deep Talks', slug: 'philosophy', description: 'Existentialism, ethics, life dilemmas, and campus debates.', icon_name: 'Brain', is_official: true, members_count: 0, posts_count: 0 },
      { id: 'comm_09', name: 'Tech & Builders', slug: 'technology', description: 'Open source, AI projects, hackathons, and real-world engineering.', icon_name: 'Cpu', is_official: true, members_count: 0, posts_count: 0 },
      { id: 'comm_10', name: 'HBTU Entrepreneurs', slug: 'entrepreneurship', description: 'Startup ideas, pitch practice, and finding student co-founders.', icon_name: 'Zap', is_official: true, members_count: 0, posts_count: 0 },
      { id: 'comm_11', name: 'Kanpur Explorers', slug: 'kanpur-explorers', description: 'Street food walks, Swaroop Nagar cafes, Bithoor heritage, and city gems.', icon_name: 'Compass', is_official: true, members_count: 0, posts_count: 0 },
      { id: 'comm_12', name: 'Introverts Club', slug: 'introverts-club', description: 'Low-energy social presence, quiet study buddies, zero social pressure.', icon_name: 'Coffee', is_official: true, members_count: 0, posts_count: 0 }
    ];
  }

  persist() {
    try {
      const data: StoredData = {
        profiles: this.profiles,
        verificationRequests: this.verificationRequests,
        likes: this.likes,
        matches: this.matches,
        messages: this.messages,
        secretAdmirers: this.secretAdmirers,
        confessions: this.confessions,
        communities: this.communities,
        communityPosts: this.communityPosts,
        coupleSpaces: this.coupleSpaces,
        coupleMemories: this.coupleMemories,
        coupleNotes: this.coupleNotes,
        coupleBucketLists: this.coupleBucketLists,
        datePlans: this.datePlans,
        events: this.events,
        polls: this.polls,
        notifications: this.notifications,
        reports: this.reports,
        blocks: this.blocks,
        auditLogs: this.auditLogs,
        otpVerifications: this.otpVerifications
      };
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database to disk:', err);
    }
  }

  // Decouple user identity for anonymous feeds: NEVER leak author IDs to client
  sanitizeConfessionForClient(confession: Confession, currentUserId?: string) {
    const isAuthor = currentUserId && confession.author_id === currentUserId;
    return {
      id: confession.id,
      content: confession.content,
      category: confession.category,
      content_warning: confession.content_warning,
      is_anonymous: true,
      author_badge: 'Verified HBTU Student',
      status: confession.status,
      ai_moderation_flagged: confession.ai_moderation_flagged,
      likes_count: confession.likes_count,
      comments_count: confession.comments_count,
      user_reaction: confession.user_reaction,
      created_at: confession.created_at,
      is_own_post: isAuthor,
      comments: (confession.comments || []).map(c => ({
        id: c.id,
        content: c.content,
        author_name: 'Verified Student',
        created_at: c.created_at
      }))
    };
  }
}

// Global Singleton for runtime instance
const globalRef = global as unknown as { __afterclass_db?: DatabaseStore };
export const db = globalRef.__afterclass_db || new DatabaseStore();
if (process.env.NODE_ENV !== 'production') {
  globalRef.__afterclass_db = db;
}
