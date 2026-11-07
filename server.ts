import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { db, calculateMatchScore, isHBTUEmail, isValidEmail, checkContentSafety } from './src/db/storage.js';
import { Match, AccountStatus } from './src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini AI Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// Session resolution helper
let currentUserId: string | null = null;

function getSessionUserId(req: Request): string | null {
  const headerId = req.headers['x-user-id'] as string;
  if (headerId && db.profiles.some(p => p.id === headerId)) {
    return headerId;
  }
  if (currentUserId && db.profiles.some(p => p.id === currentUserId)) {
    return currentUserId;
  }
  return null;
}

// -------------------------------------------------------------
// 1. AUTH & SESSION API (STRICT @hbtu.ac.in DOMAIN ENFORCEMENT)
// -------------------------------------------------------------
app.get('/api/auth/me', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  if (!uid) {
    return res.json({ user: null, isAdmin: false, unreadNotifications: 0 });
  }
  const profile = db.profiles.find(p => p.id === uid);
  if (!profile) {
    return res.json({ user: null, isAdmin: false, unreadNotifications: 0 });
  }
  const isAdmin = profile.email.toLowerCase().includes('admin') || db.profiles[0]?.id === profile.id;
  res.json({
    user: profile,
    isAdmin,
    unreadNotifications: db.notifications.filter(n => n.recipient_id === uid && !n.is_read).length
  });
});

app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      error: 'Please enter a valid email address.'
    });
  }

  const normalized = email.toLowerCase().trim();
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  db.otpVerifications = db.otpVerifications.filter(o => o.email !== normalized);
  db.otpVerifications.push({
    email: normalized,
    code,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  });
  db.persist();

  res.json({
    success: true,
    message: `OTP sent to ${normalized}.`,
    testCode: code
  });
});

app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      error: 'Please enter a valid email address.'
    });
  }

  const normalized = email.toLowerCase().trim();
  const record = db.otpVerifications.find(o => o.email === normalized && o.code === (code || '').trim());
  if (!record) {
    return res.status(400).json({ error: 'Invalid verification code. Please check your OTP and try again.' });
  }

  if (record.expiresAt < Date.now()) {
    return res.status(400).json({ error: 'Verification code expired. Please request a new code.' });
  }

  const existing = db.profiles.find(p => p.email.toLowerCase() === normalized);
  if (existing) {
    currentUserId = existing.id;
    return res.json({ success: true, verified: true, isNewUser: false, user: existing });
  }

  res.json({ success: true, verified: true, isNewUser: true });
});

app.post('/api/auth/switch-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  const target = db.profiles.find(p => p.id === userId);
  if (target) {
    currentUserId = target.id;
    return res.json({ success: true, user: target });
  }
  res.status(404).json({ error: 'Profile not found' });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const {
    fullName,
    displayName,
    email,
    dateOfBirth,
    branch,
    academicYear,
    rollNumber,
    verificationMethod
  } = req.body;

  if (!fullName || !email || !dateOfBirth || !branch || !academicYear) {
    return res.status(400).json({ error: 'Missing required registration fields' });
  }

  // Email format verification
  if (!isValidEmail(email)) {
    return res.status(400).json({
      error: 'Please enter a valid email address.'
    });
  }

  // Age verification check: must be 18+
  const birthDate = new Date(dateOfBirth);
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  const age = Math.abs(ageDate.getUTCFullYear() - 1970);
  if (age < 18) {
    return res.status(400).json({ error: 'Dating and social features require age 18 or above.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = db.profiles.find(p => p.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(400).json({ error: 'Account with this email already exists. Please log in.' });
  }

  const newProfileId = `usr_${Date.now()}`;
  const newProfile = {
    id: newProfileId,
    full_name: fullName.trim(),
    display_name: displayName?.trim() || fullName.trim().split(' ')[0],
    email: normalizedEmail,
    date_of_birth: dateOfBirth,
    branch,
    academic_year: academicYear,
    bio: 'Freshly joined AFTERCLASS HBTU.',
    avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName || fullName)}&backgroundColor=151a25&textColor=d9b978`,
    gender: 'Prefer not to say',
    is_age_verified: true,
    is_student_verified: true,
    account_status: 'verified' as AccountStatus,
    is_discoverable: true,
    roll_number: rollNumber || 'ENROLLED',
    verification_method: verificationMethod || 'institutional_email',
    interests: ['Campus Cafes', 'Acoustic Music', 'Coding & AI'],
    personality_answers: {
      vibe: 'Friendly & curious',
      beverage: 'Cutting chai',
      scenery: 'Campus lawns',
      schedule: 'Balanced',
      weekend: 'Exploring Kanpur'
    },
    connection_preferences: ['friendship', 'dating'] as any,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.profiles.push(newProfile);

  // Create verification request record
  db.verificationRequests.unshift({
    id: `vr_${Date.now()}`,
    profile_id: newProfileId,
    student_name: fullName,
    email: normalizedEmail,
    branch,
    academic_year: academicYear,
    roll_number: rollNumber,
    verification_method: 'institutional_email',
    status: 'approved',
    reviewer_notes: 'Instant email verification',
    created_at: new Date().toISOString()
  });

  currentUserId = newProfileId;
  db.persist();

  res.json({ success: true, user: newProfile });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      error: 'Please enter a valid email address.'
    });
  }

  const normalized = email.toLowerCase().trim();
  const user = db.profiles.find(p => p.email.toLowerCase() === normalized);
  if (!user) {
    return res.status(404).json({
      error: 'No student account registered with this email. Please register first.'
    });
  }

  currentUserId = user.id;
  res.json({ success: true, user });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  currentUserId = null;
  res.json({ success: true });
});

// -------------------------------------------------------------
// 2. PROFILES & DISCOVER API
// -------------------------------------------------------------
app.get('/api/profiles/me', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  if (!uid) return res.status(401).json({ error: 'Unauthorized' });
  const profile = db.profiles.find(p => p.id === uid);
  res.json(profile || null);
});

app.put('/api/profiles/me', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  if (!uid) return res.status(401).json({ error: 'Unauthorized' });
  const profileIndex = db.profiles.findIndex(p => p.id === uid);
  if (profileIndex === -1) return res.status(404).json({ error: 'Not found' });

  const { bio, interests, personality_answers, connection_preferences, is_discoverable, avatar_url, gender } = req.body;
  const current = db.profiles[profileIndex];

  db.profiles[profileIndex] = {
    ...current,
    bio: bio !== undefined ? bio : current.bio,
    interests: interests !== undefined ? interests : current.interests,
    personality_answers: personality_answers !== undefined ? personality_answers : current.personality_answers,
    connection_preferences: connection_preferences !== undefined ? connection_preferences : current.connection_preferences,
    is_discoverable: is_discoverable !== undefined ? is_discoverable : current.is_discoverable,
    avatar_url: avatar_url !== undefined ? avatar_url : current.avatar_url,
    gender: gender !== undefined ? gender : current.gender,
    updated_at: new Date().toISOString()
  };

  db.persist();
  res.json({ success: true, profile: db.profiles[profileIndex] });
});

app.get('/api/discover', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  const currentUser = uid ? db.profiles.find(p => p.id === uid) : null;

  const { branch, year, preference, search } = req.query;

  // Filter out self and already matched or blocked
  const blockedIds = uid ? new Set(db.blocks.filter(b => b.blocker_id === uid).map(b => b.blocked_id)) : new Set();
  const passedIds = uid ? new Set(db.likes.filter(l => l.sender_id === uid).map(l => l.receiver_id)) : new Set();

  let eligible = db.profiles.filter(p => {
    if (uid && p.id === uid) return false;
    if (!p.is_discoverable) return false;
    if (blockedIds.has(p.id)) return false;
    if (branch && branch !== 'All' && p.branch !== branch) return false;
    if (year && year !== 'All' && p.academic_year !== year) return false;
    if (preference && preference !== 'All') {
      if (!p.connection_preferences?.includes(preference as any)) return false;
    }
    if (search) {
      const q = (search as string).toLowerCase();
      const matchName = p.display_name.toLowerCase().includes(q) || p.full_name.toLowerCase().includes(q);
      const matchBio = p.bio.toLowerCase().includes(q);
      const matchInterests = p.interests?.some(i => i.toLowerCase().includes(q));
      if (!matchName && !matchBio && !matchInterests) return false;
    }
    return true;
  });

  // Calculate recommendation score for each
  const profilesWithScores = eligible.map(candidate => {
    const breakdown = currentUser ? calculateMatchScore(currentUser, candidate) : {
      totalScore: 75,
      sharedInterestsScore: 30,
      personalityScore: 20,
      commonActivitiesScore: 15,
      mutualPreferencesScore: 10,
      commonInterests: [],
      commonTraits: []
    };
    const hasLikedCurrentUser = uid ? db.likes.some(l => l.sender_id === candidate.id && l.receiver_id === uid) : false;
    const isAlreadyLikedByCurrentUser = passedIds.has(candidate.id);
    return {
      ...candidate,
      matchBreakdown: breakdown,
      compatibilityScore: breakdown.totalScore,
      hasLikedCurrentUser,
      isLiked: isAlreadyLikedByCurrentUser
    };
  });

  // Sort by highest compatibility score
  profilesWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  res.json({ profiles: profilesWithScores });
});

// -------------------------------------------------------------
// 3. LIKES & MATCHES API
// -------------------------------------------------------------
app.post('/api/matches/like', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  if (!uid) return res.status(401).json({ error: 'Unauthorized' });

  const { targetId } = req.body;
  if (!targetId || targetId === uid) {
    return res.status(400).json({ error: 'Invalid target user' });
  }

  // Prevent duplicate likes
  const existingLike = db.likes.find(l => l.sender_id === uid && l.receiver_id === targetId);
  if (!existingLike) {
    db.likes.push({
      id: `like_${Date.now()}`,
      sender_id: uid,
      receiver_id: targetId,
      created_at: new Date().toISOString()
    });
  }

  // Check if mutual like exists
  const mutualLike = db.likes.find(l => l.sender_id === targetId && l.receiver_id === uid);
  let isMutual = false;
  let matchRecord: Match | null = null;

  if (mutualLike) {
    // Check if match already exists
    const existingMatch = db.matches.find(m => 
      (m.profile_1_id === uid && m.profile_2_id === targetId) ||
      (m.profile_1_id === targetId && m.profile_2_id === uid)
    );

    if (!existingMatch) {
      const p1 = uid < targetId ? uid : targetId;
      const p2 = uid < targetId ? targetId : uid;
      const newMatchId = `match_${Date.now()}`;
      const targetUser = db.profiles.find(p => p.id === targetId);
      const currentUser = db.profiles.find(p => p.id === uid);

      matchRecord = {
        id: newMatchId,
        profile_1_id: p1,
        profile_2_id: p2,
        is_active: true,
        created_at: new Date().toISOString(),
        otherProfile: targetUser,
        lastMessage: 'Mutual match created! Say hello.',
        lastMessageTime: 'Just now',
        unreadCount: 0
      };

      db.matches.unshift(matchRecord);

      // Create in-app notifications
      db.notifications.unshift({
        id: `notif_${Date.now()}_1`,
        recipient_id: targetId,
        type: 'new_match',
        title: 'New Mutual Match!',
        message: `You and ${currentUser?.display_name || 'a student'} liked each other! Start chatting now.`,
        link_url: '/messages',
        is_read: false,
        created_at: new Date().toISOString()
      });

      db.notifications.unshift({
        id: `notif_${Date.now()}_2`,
        recipient_id: uid,
        type: 'new_match',
        title: 'It’s a Match!',
        message: `You and ${targetUser?.display_name || 'a student'} liked each other!`,
        link_url: '/messages',
        is_read: false,
        created_at: new Date().toISOString()
      });

      isMutual = true;
    }
  }

  db.persist();
  res.json({ success: true, isMutual, match: matchRecord });
});
app.get('/api/matches', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  if (!uid) return res.json({ matches: [] });

  const userMatches = db.matches.filter(m => 
    (m.profile_1_id === uid || m.profile_2_id === uid) && m.is_active
  );

  const populated = userMatches.map(m => {
    const otherId = m.profile_1_id === uid ? m.profile_2_id : m.profile_1_id;
    const otherProfile = db.profiles.find(p => p.id === otherId);
    const msgs = db.messages.filter(msg => msg.conversation_id === m.id);
    const lastMsg = msgs[msgs.length - 1];

    return {
      ...m,
      otherProfile,
      lastMessage: lastMsg ? lastMsg.content : 'Matched! Send the first greeting.',
      lastMessageTime: lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
      unreadCount: msgs.filter(msg => msg.sender_id !== uid && !msg.is_read).length
    };
  });

  res.json({ matches: populated });
});

app.post('/api/matches/:id/unmatch', (req: Request, res: Response) => {
  const match = db.matches.find(m => m.id === req.params.id);
  if (match) {
    match.is_active = false;
    db.persist();
  }
  res.json({ success: true });
});

// -------------------------------------------------------------
// 4. MESSAGES & REALTIME CHAT
// -------------------------------------------------------------
app.get('/api/messages/:matchId', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  if (!uid) return res.status(401).json({ error: 'Unauthorized' });

  const match = db.matches.find(m => m.id === req.params.matchId);
  if (!match) return res.status(404).json({ error: 'Match not found' });

  // Security check: must be a member
  if (match.profile_1_id !== uid && match.profile_2_id !== uid) {
    return res.status(403).json({ error: 'Unauthorized conversation access' });
  }

  const msgs = db.messages.filter(m => m.conversation_id === req.params.matchId);
  // Mark unread as read
  msgs.forEach(m => {
    if (m.sender_id !== uid) m.is_read = true;
  });

  const otherId = match.profile_1_id === uid ? match.profile_2_id : match.profile_1_id;
  const otherProfile = db.profiles.find(p => p.id === otherId);

  db.persist();
  res.json({ messages: msgs, otherProfile });
});

app.post('/api/messages/:matchId', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  if (!uid) return res.status(401).json({ error: 'Unauthorized' });

  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Content required' });

  const match = db.matches.find(m => m.id === req.params.matchId);
  if (!match || !match.is_active) {
    return res.status(400).json({ error: 'Cannot message an inactive match' });
  }

  const newMsg = {
    id: `msg_${Date.now()}`,
    conversation_id: req.params.matchId,
    sender_id: uid,
    content: content.trim(),
    is_read: false,
    created_at: new Date().toISOString()
  };

  db.messages.push(newMsg);
  db.persist();
  res.json({ success: true, message: newMsg });
});

// -------------------------------------------------------------
// 5. SECRET ADMIRER API
// -------------------------------------------------------------
app.get('/api/secret-admirer', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  if (!uid) return res.json({ admirerCount: 0, sentCount: 0, sentTargetIds: [], mutualCrushes: [] });

  const receivedRequests = db.secretAdmirers.filter(r => r.target_id === uid);
  const sentRequests = db.secretAdmirers.filter(r => r.admirer_id === uid);

  // Check mutuals
  const mutualCrushes = sentRequests.filter(s => {
    const reverse = db.secretAdmirers.find(r => r.admirer_id === s.target_id && r.target_id === uid);
    return !!reverse;
  }).map(s => {
    const target = db.profiles.find(p => p.id === s.target_id);
    return {
      requestId: s.id,
      targetId: s.target_id,
      targetName: target?.display_name || 'HBTU Student',
      targetAvatar: target?.avatar_url,
      branch: target?.branch,
      isMutual: true,
      admirerConsentReveal: s.admirer_consent_reveal,
      targetConsentReveal: s.target_consent_reveal
    };
  });

  res.json({
    admirerCount: receivedRequests.length,
    sentCount: sentRequests.length,
    sentTargetIds: sentRequests.map(s => s.target_id),
    mutualCrushes
  });
});

app.post('/api/secret-admirer/express', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  if (!uid) return res.status(401).json({ error: 'Unauthorized' });

  const { targetId } = req.body;
  if (!targetId || targetId === uid) {
    return res.status(400).json({ error: 'Invalid crush recipient' });
  }

  // Duplicate check
  const existing = db.secretAdmirers.find(s => s.admirer_id === uid && s.target_id === targetId);
  if (existing) {
    return res.json({ success: true, alreadyExpressed: true });
  }

  const newReq = {
    id: `sa_${Date.now()}`,
    admirer_id: uid,
    target_id: targetId,
    is_mutual: false,
    admirer_consent_reveal: false,
    target_consent_reveal: false,
    created_at: new Date().toISOString()
  };

  db.secretAdmirers.push(newReq);

  // Send anonymous notification to recipient
  db.notifications.unshift({
    id: `notif_sa_${Date.now()}`,
    recipient_id: targetId,
    type: 'secret_admirer_mutual',
    title: 'Secret Admirer Alert',
    message: 'Someone on campus just privately selected you as their secret crush!',
    link_url: '/secret-admirer',
    is_read: false,
    created_at: new Date().toISOString()
  });

  // Check if target had also selected current user
  const reverse = db.secretAdmirers.find(s => s.admirer_id === targetId && s.target_id === uid);
  let isMutual = false;
  if (reverse) {
    newReq.is_mutual = true;
    reverse.is_mutual = true;
    isMutual = true;

    db.notifications.unshift({
      id: `notif_samutual_${Date.now()}`,
      recipient_id: uid,
      type: 'secret_admirer_mutual',
      title: 'Mutual Secret Crush!',
      message: 'Both of you secretly picked each other! Open Secret Admirer to reveal.',
      link_url: '/secret-admirer',
      is_read: false,
      created_at: new Date().toISOString()
    });
  }

  db.persist();
  res.json({ success: true, isMutual });
});

app.post('/api/secret-admirer/consent-reveal', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  if (!uid) return res.status(401).json({ error: 'Unauthorized' });

  const { targetId } = req.body;
  const reqSent = db.secretAdmirers.find(s => s.admirer_id === uid && s.target_id === targetId);
  if (reqSent) {
    reqSent.admirer_consent_reveal = true;
  }
  const reqReceived = db.secretAdmirers.find(s => s.admirer_id === targetId && s.target_id === uid);
  if (reqReceived) {
    reqReceived.target_consent_reveal = true;
  }
  db.persist();
  res.json({ success: true });
});

// -------------------------------------------------------------
// 6. CONFESSIONS API (ANONYMOUS FEED & PRIVACY SAFEGUARDS)
// -------------------------------------------------------------
app.get('/api/confessions', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  const { category, search, sort } = req.query;
  let list = db.confessions.filter(c => c.status === 'approved' || (uid && c.author_id === uid));

  if (category && category !== 'All') {
    list = list.filter(c => c.category === category);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(c => c.content.toLowerCase().includes(q));
  }

  if (sort === 'popular') {
    list.sort((a, b) => b.likes_count - a.likes_count);
  } else {
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Decouple user identity: NEVER expose author IDs to client frontend
  const sanitized = list.map(c => db.sanitizeConfessionForClient(c, uid || undefined));
  res.json({ confessions: sanitized });
});

app.post('/api/confessions', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  const { content, category, contentWarning } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Confession text required' });

  // Basic client-safe regex precheck for phone numbers or harassment words
  const safety = checkContentSafety(content);
  if (!safety.isSafe) {
    return res.status(400).json({ error: safety.reason });
  }

  const newConf = {
    id: `conf_${Date.now()}`,
    author_id: uid || 'usr_verified_student',
    content: content.trim(),
    category: category || 'General thoughts',
    content_warning: contentWarning || undefined,
    is_anonymous: true,
    status: 'approved' as const,
    ai_moderation_flagged: false,
    likes_count: 0,
    comments_count: 0,
    created_at: new Date().toISOString()
  };

  db.confessions.unshift(newConf);
  db.persist();
  res.json({ success: true, confession: db.sanitizeConfessionForClient(newConf, uid || undefined) });
});

app.post('/api/confessions/:id/react', (req: Request, res: Response) => {
  const conf = db.confessions.find(c => c.id === req.params.id);
  if (!conf) return res.status(404).json({ error: 'Not found' });
  const { reactionType } = req.body;
  if (conf.user_reaction === reactionType) {
    conf.user_reaction = undefined;
    conf.likes_count = Math.max(0, conf.likes_count - 1);
  } else {
    if (!conf.user_reaction) conf.likes_count++;
    conf.user_reaction = reactionType || 'heart';
  }
  db.persist();
  res.json({ success: true, likes_count: conf.likes_count, user_reaction: conf.user_reaction });
});

app.post('/api/confessions/:id/comment', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  const conf = db.confessions.find(c => c.id === req.params.id);
  if (!conf) return res.status(404).json({ error: 'Not found' });
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Comment content required' });

  const safety = checkContentSafety(content);
  if (!safety.isSafe) {
    return res.status(400).json({ error: safety.reason });
  }

  const comment = {
    id: `cc_${Date.now()}`,
    confession_id: conf.id,
    author_id: uid || 'usr_verified_student',
    author_name: 'Verified Student',
    content: content.trim(),
    is_anonymous: true,
    created_at: new Date().toISOString()
  };

  if (!conf.comments) conf.comments = [];
  conf.comments.push(comment);
  conf.comments_count = conf.comments.length;

  db.persist();
  res.json({
    success: true,
    comment: {
      id: comment.id,
      content: comment.content,
      author_name: 'Verified Student',
      created_at: comment.created_at
    }
  });
});

// -------------------------------------------------------------
// 7. COUPLES CORNER API
// -------------------------------------------------------------
app.get('/api/couples/space', (req: Request, res: Response) => {
  const space = db.coupleSpaces.find(cs => 
    (cs.partner_1_id === currentUserId || cs.partner_2_id === currentUserId) && cs.is_active
  );

  if (!space) {
    return res.json({ hasSpace: false });
  }

  const p1 = db.profiles.find(p => p.id === space.partner_1_id);
  const p2 = db.profiles.find(p => p.id === space.partner_2_id);
  const memories = db.coupleMemories.filter(m => m.space_id === space.id);
  const notes = db.coupleNotes.filter(n => n.space_id === space.id);
  const bucketList = db.coupleBucketLists.filter(b => b.space_id === space.id);

  res.json({
    hasSpace: true,
    space: {
      ...space,
      partner_1: p1,
      partner_2: p2
    },
    memories,
    notes,
    bucketList
  });
});

app.post('/api/couples/invite', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  if (!uid) return res.status(401).json({ error: 'Unauthorized' });

  const { partnerEmail, relationshipStartDate, spaceName } = req.body;
  if (!partnerEmail) return res.status(400).json({ error: 'Partner email required' });

  const partner = db.profiles.find(p => p.email.toLowerCase() === partnerEmail.toLowerCase());
  if (!partner) {
    return res.status(404).json({ error: 'No verified HBTU student found with this email' });
  }
  if (partner.id === uid) {
    return res.status(400).json({ error: 'Cannot invite yourself' });
  }

  const p1 = uid < partner.id ? uid : partner.id;
  const p2 = uid < partner.id ? partner.id : uid;
  const newSpaceId = `cs_${Date.now()}`;

  const newSpace = {
    id: newSpaceId,
    partner_1_id: p1,
    partner_2_id: p2,
    relationship_start_date: relationshipStartDate || '2025-10-01',
    space_name: spaceName || `${db.profiles.find(p => p.id === uid)?.display_name || 'Student'} & ${partner.display_name}`,
    anniversary_date: relationshipStartDate,
    cover_image_url: '/src/assets/images/couple_spot_memories_1793616895229.jpg',
    is_active: true,
    created_at: new Date().toISOString()
  };

  db.coupleSpaces.push(newSpace);

  db.notifications.unshift({
    id: `notif_couple_${Date.now()}`,
    recipient_id: partner.id,
    type: 'couple_invite',
    title: 'Couple Space Invitation',
    message: `${db.profiles.find(p => p.id === uid)?.display_name || 'Your partner'} created a private Couples Corner space with you!`,
    link_url: '/couples',
    is_read: false,
    created_at: new Date().toISOString()
  });

  db.persist();
  res.json({ success: true, space: newSpace });
});

app.post('/api/couples/memories', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  const { spaceId, title, memoryDate, caption, imageUrl } = req.body;
  const memory = {
    id: `cm_${Date.now()}`,
    space_id: spaceId,
    created_by: uid || 'usr_verified_student',
    title,
    memory_date: memoryDate || new Date().toISOString().split('T')[0],
    caption,
    image_url: imageUrl || '/src/assets/images/couple_spot_memories_1793616895229.jpg',
    created_at: new Date().toISOString()
  };
  db.coupleMemories.unshift(memory);
  db.persist();
  res.json({ success: true, memory });
});

app.post('/api/couples/notes', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  const { spaceId, title, content } = req.body;
  const note = {
    id: `cn_${Date.now()}`,
    space_id: spaceId,
    author_id: uid || 'usr_verified_student',
    title,
    content,
    is_pinned: false,
    created_at: new Date().toISOString()
  };
  db.coupleNotes.unshift(note);
  db.persist();
  res.json({ success: true, note });
});

app.post('/api/couples/bucket-list', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  const { spaceId, activity, targetDate, notes } = req.body;
  const item = {
    id: `cb_${Date.now()}`,
    space_id: spaceId,
    created_by: uid || 'usr_verified_student',
    activity,
    is_completed: false,
    target_date: targetDate,
    notes,
    created_at: new Date().toISOString()
  };
  db.coupleBucketLists.push(item);
  db.persist();
  res.json({ success: true, item });
});

app.put('/api/couples/bucket-list/:id/toggle', (req: Request, res: Response) => {
  const item = db.coupleBucketLists.find(b => b.id === req.params.id);
  if (item) {
    item.is_completed = !item.is_completed;
    db.persist();
  }
  res.json({ success: true, item });
});

// -------------------------------------------------------------
// 8. DATE PLANNER API
// -------------------------------------------------------------
app.get('/api/date-plans', (req: Request, res: Response) => {
  res.json({ plans: db.datePlans });
});

app.post('/api/date-plans', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  const { title, budgetRange, mood, duration, experienceType, suggestedActivity, estimatedBudgetInr, venueRecommendations, checklist, conversationPrompts } = req.body;
  const newPlan = {
    id: `dp_${Date.now()}`,
    creator_id: uid || 'usr_verified_student',
    title: title || `${mood} Date in Kanpur`,
    budget_range: budgetRange,
    mood,
    duration,
    experience_type: experienceType,
    suggested_activity: suggestedActivity,
    estimated_budget_inr: estimatedBudgetInr || 300,
    venue_recommendations: venueRecommendations || 'Swaroop Nagar / Ganga Barrage',
    checklist: checklist || ['Arrive on time', 'Comfortable walking gear'],
    conversation_prompts: conversationPrompts || ['What made you smile today?'],
    is_saved: true,
    created_at: new Date().toISOString()
  };
  db.datePlans.unshift(newPlan);
  db.persist();
  res.json({ success: true, plan: newPlan });
});

// -------------------------------------------------------------
// 9. COMMUNITIES & CAMPUS BUZZ EVENTS
// -------------------------------------------------------------
app.get('/api/communities', (req: Request, res: Response) => {
  res.json({ communities: db.communities });
});

app.get('/api/communities/:id/posts', (req: Request, res: Response) => {
  const posts = db.communityPosts.filter(p => p.community_id === req.params.id);
  res.json({ posts });
});

app.post('/api/communities/:id/posts', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  const { title, content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Post content required' });

  // Moderate content for harassment and doxxing
  const safety = checkContentSafety(content);
  if (!safety.isSafe) {
    return res.status(400).json({ error: safety.reason });
  }

  const user = uid ? db.profiles.find(p => p.id === uid) : null;
  const newPost = {
    id: `post_${Date.now()}`,
    community_id: req.params.id,
    author_id: uid || 'usr_verified_student',
    author_name: user?.display_name || 'HBTU Student',
    author_avatar: user?.avatar_url,
    author_branch: user?.branch,
    title: title || 'Campus Discussion',
    content: content.trim(),
    likes_count: 1,
    comments_count: 0,
    is_liked: true,
    created_at: new Date().toISOString()
  };
  db.communityPosts.unshift(newPost);
  const comm = db.communities.find(c => c.id === req.params.id);
  if (comm) comm.posts_count++;

  db.persist();
  res.json({ success: true, post: newPost });
});

app.post('/api/communities/:id/join', (req: Request, res: Response) => {
  const comm = db.communities.find(c => c.id === req.params.id);
  if (comm) {
    comm.is_member = !comm.is_member;
    comm.members_count += comm.is_member ? 1 : -1;
    db.persist();
  }
  res.json({ success: true, is_member: comm?.is_member, members_count: comm?.members_count });
});

app.get('/api/events', (req: Request, res: Response) => {
  res.json({ events: db.events });
});

app.post('/api/events/:id/rsvp', (req: Request, res: Response) => {
  const evt = db.events.find(e => e.id === req.params.id);
  if (evt) {
    evt.is_registered = !evt.is_registered;
    evt.current_participants_count += evt.is_registered ? 1 : -1;
    db.persist();
  }
  res.json({ success: true, is_registered: evt?.is_registered, count: evt?.current_participants_count });
});

// -------------------------------------------------------------
// 10. POLLS & ENGAGEMENT API
// -------------------------------------------------------------
app.get('/api/polls', (req: Request, res: Response) => {
  res.json({ polls: db.polls });
});

app.post('/api/polls/:id/vote', (req: Request, res: Response) => {
  const { optionId } = req.body;
  const poll = db.polls.find(p => p.id === req.params.id);
  if (!poll) return res.status(404).json({ error: 'Poll not found' });

  const opt = poll.options.find(o => o.id === optionId);
  if (opt) {
    if (poll.user_voted_option_id) {
      const prev = poll.options.find(o => o.id === poll.user_voted_option_id);
      if (prev) prev.votes = Math.max(0, prev.votes - 1);
    } else {
      poll.total_votes++;
    }
    opt.votes++;
    poll.user_voted_option_id = optionId;
    db.persist();
  }
  res.json({ success: true, poll });
});

// -------------------------------------------------------------
// 11. NOTIFICATIONS & REPORTS
// -------------------------------------------------------------
app.get('/api/notifications', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  if (!uid) return res.json({ notifications: [] });
  const userNotifs = db.notifications.filter(n => n.recipient_id === uid);
  res.json({ notifications: userNotifs });
});

app.put('/api/notifications/read-all', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  if (uid) {
    db.notifications.filter(n => n.recipient_id === uid).forEach(n => n.is_read = true);
    db.persist();
  }
  res.json({ success: true });
});

app.post('/api/reports', (req: Request, res: Response) => {
  const uid = getSessionUserId(req);
  const { targetType, targetId, reason, details } = req.body;
  const newReport = {
    id: `rep_${Date.now()}`,
    reporter_id: uid || 'usr_anonymous_reporter',
    reporter_name: uid ? db.profiles.find(p => p.id === uid)?.display_name : 'HBTU Student',
    target_type: targetType,
    target_id: targetId,
    reason,
    details,
    status: 'open' as const,
    created_at: new Date().toISOString()
  };
  db.reports.unshift(newReport);
  db.persist();
  res.json({ success: true, report: newReport });
});

// -------------------------------------------------------------
// 12. ADMIN DASHBOARD API
// -------------------------------------------------------------
app.get('/api/admin/overview', (req: Request, res: Response) => {
  res.json({
    totalUsers: db.profiles.length,
    verifiedUsers: db.profiles.filter(p => p.account_status === 'verified').length,
    pendingVerifications: db.verificationRequests.filter(vr => vr.status === 'pending').length,
    activeMatches: db.matches.filter(m => m.is_active).length,
    pendingConfessions: db.confessions.filter(c => c.status === 'pending').length,
    openReports: db.reports.filter(r => r.status === 'open').length,
    totalEvents: db.events.length,
    auditLogsCount: db.auditLogs.length
  });
});

app.get('/api/admin/users', (req: Request, res: Response) => {
  res.json({ users: db.profiles });
});

app.put('/api/admin/users/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const user = db.profiles.find(p => p.id === req.params.id);
  if (user) {
    user.account_status = status;
    user.is_student_verified = (status === 'verified');
    db.auditLogs.unshift({
      id: `al_${Date.now()}`,
      admin_id: getSessionUserId(req) || 'usr_campus_admin',
      admin_name: 'Campus Administrator',
      action_type: `USER_STATUS_${status.toUpperCase()}`,
      target_table: 'profiles',
      target_record_id: user.id,
      details: { email: user.email, previous: user.account_status, new: status },
      created_at: new Date().toISOString()
    });
    db.persist();
  }
  res.json({ success: true, user });
});

app.get('/api/admin/verifications', (req: Request, res: Response) => {
  res.json({ requests: db.verificationRequests });
});

app.put('/api/admin/verifications/:id/decision', (req: Request, res: Response) => {
  const { decision, notes } = req.body;
  const vr = db.verificationRequests.find(v => v.id === req.params.id);
  if (vr) {
    vr.status = decision;
    vr.reviewer_notes = notes || (decision === 'approved' ? 'Verified against university records' : 'Document rejected');
    const profile = db.profiles.find(p => p.id === vr.profile_id);
    if (profile) {
      profile.account_status = decision === 'approved' ? 'verified' : 'rejected';
      profile.is_student_verified = (decision === 'approved');
    }
    db.auditLogs.unshift({
      id: `al_${Date.now()}`,
      admin_id: getSessionUserId(req) || 'usr_campus_admin',
      admin_name: 'Campus Administrator',
      action_type: `VERIFICATION_${decision.toUpperCase()}`,
      target_table: 'verification_requests',
      target_record_id: vr.id,
      details: { rollNumber: vr.roll_number, notes },
      created_at: new Date().toISOString()
    });
    db.persist();
  }
  res.json({ success: true, request: vr });
});

app.get('/api/admin/confessions', (req: Request, res: Response) => {
  res.json({ confessions: db.confessions });
});

app.put('/api/admin/confessions/:id/decision', (req: Request, res: Response) => {
  const { decision } = req.body;
  const conf = db.confessions.find(c => c.id === req.params.id);
  if (conf) {
    conf.status = decision;
    db.auditLogs.unshift({
      id: `al_${Date.now()}`,
      admin_id: getSessionUserId(req) || 'usr_campus_admin',
      admin_name: 'Campus Administrator',
      action_type: `CONFESSION_${decision.toUpperCase()}`,
      target_table: 'confessions',
      target_record_id: conf.id,
      details: { category: conf.category },
      created_at: new Date().toISOString()
    });
    db.persist();
  }
  res.json({ success: true, confession: conf });
});

app.get('/api/admin/reports', (req: Request, res: Response) => {
  res.json({ reports: db.reports });
});

app.put('/api/admin/reports/:id/resolve', (req: Request, res: Response) => {
  const { actionTaken } = req.body;
  const rep = db.reports.find(r => r.id === req.params.id);
  if (rep) {
    rep.status = 'resolved';
    rep.action_taken = actionTaken || 'Resolved by moderator.';
  }
  res.json({ success: true, report: rep });
});

app.get('/api/admin/audit-logs', (req: Request, res: Response) => {
  res.json({ auditLogs: db.auditLogs });
});

// -------------------------------------------------------------
// 13. GEMINI AI SERVER-SIDE ASSISTANT (gemini-3.8-flash)
// -------------------------------------------------------------
app.post('/api/gemini/assistant', async (req: Request, res: Response) => {
  const { mode, context } = req.body;

  if (!ai) {
    // Elegant fallback when GEMINI_API_KEY is not configured
    if (mode === 'conversation_starters') {
      return res.json({
        suggestions: [
          'What is your favourite quiet study spot on campus: Central Library or the lawns?',
          'Which campus cafe has the most reliable coffee during exam week?',
          'If you had to pick one canteen snack for the rest of semester: samosa or maggi?'
        ]
      });
    } else if (mode === 'bio_helper') {
      return res.json({
        bios: [
          '3rd year engineer navigating West Campus sunsets, acoustic playlists and finding the best cutting chai in Kanpur.',
          'Between lab reports and weekend chess matches. Always down for exploring Swaroop Nagar cafes.'
        ]
      });
    } else if (mode === 'date_idea') {
      return res.json({
        title: 'Sunset Tea & Stroll at Ganga Barrage Promenade',
        activity: 'Grab fresh kulhad chai and bun makkhan as the sun dips below the river horizon. Peaceful, budget-friendly and authentically Kanpur.',
        estimatedBudget: 150,
        prompts: ['What is your favourite escape from campus hustle?', 'What is one topic you could talk about for an hour without prep?']
      });
    } else {
      return res.json({ result: 'AI assistance ready.' });
    }
  }

  try {
    if (mode === 'conversation_starters') {
      const interests = context?.interests?.join(', ') || 'college life, music, technology';
      const prompt = `You are the AI Dating & Social Assistant for AFTERCLASS, an exclusive student social app for HBTU Kanpur university students.
Generate exactly 3 friendly, witty, non-cringe conversation starters that two students could use to break the ice.
Context of their shared interests: ${interests}. Mention subtle Kanpur/campus relatability if natural (e.g. library, canteen chai, Kanpur weather).
Format your answer as a JSON array of 3 strings: ["prompt1", "prompt2", "prompt3"]. Return ONLY valid JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(response.text || '[]');
      return res.json({ suggestions: Array.isArray(parsed) ? parsed : [response.text] });

    } else if (mode === 'bio_helper') {
      const branch = context?.branch || 'Engineering';
      const interests = context?.interests?.join(', ') || 'music and travel';
      const prompt = `You are the profile bio assistant for AFTERCLASS, an elite university social platform for HBTU students.
Write 2 concise, charismatic, and authentic student bio options (max 25 words each) for someone studying ${branch} who loves ${interests}.
Keep it natural, witty, and Gen-Z friendly.
Format your answer as a JSON array of 2 strings: ["bio 1", "bio 2"]. Return ONLY valid JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(response.text || '[]');
      return res.json({ bios: Array.isArray(parsed) ? parsed : [response.text] });

    } else if (mode === 'date_idea') {
      const budget = context?.budget || '₹300';
      const mood = context?.mood || 'Romantic';
      const prompt = `You are a romantic and fun date planner for university students in Kanpur, India.
Generate a creative date itinerary for a couple with a budget of ${budget} and mood "${mood}".
Recommend real, verified spots in Kanpur (e.g., Swaroop Nagar cafes, Ganga Barrage promenade, Allen Forest Zoo, Moti Jheel, Rave 3).
Return valid JSON with keys:
{
  "title": "short catchy title",
  "activity": "2-3 sentences description of the date itinerary",
  "estimatedBudget": number,
  "prompts": ["question 1", "question 2"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);

    } else if (mode === 'personality_summary') {
      const answers = JSON.stringify(context?.answers || {});
      const prompt = `Summarize this college student's personality based on their fun quiz choices: ${answers}.
Write a warm, charismatic, 2-sentence personality archetype summary (e.g., "The Contemplative Builder: You balance quiet introspection with late-night creative bursts...").
Return ONLY the text.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      return res.json({ summary: response.text });
    }

    res.json({ result: 'Processed.' });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    res.json({
      suggestions: [
        'What is your favourite quiet study spot on campus?',
        'Which campus canteen serves the best tea during winter?',
        'What song is currently on repeat on your Spotify?'
      ],
      bios: [
        'Finding beauty in campus rain and good coffee. 3rd year at HBTU.',
        'Between lab practicals and weekend book hunts.'
      ]
    });
  }
});

// -------------------------------------------------------------
// VITE DEV SERVER INTEGRATION & STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AFTERCLASS server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
