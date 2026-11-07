import { 
  Profile, 
  Match, 
  Message, 
  Confession, 
  CoupleSpace, 
  DatePlan, 
  Community, 
  CommunityPost, 
  CampusEvent, 
  CampusPoll, 
  AppNotification, 
  UserReport, 
  AuditLog, 
  VerificationRequest 
} from '../types';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('afterclass_user_id') : null;
  const res = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...(userId ? { 'x-user-id': userId } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Network response was not ok' }));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  getCurrentUser: () => request<{ user: Profile | null; isAdmin: boolean; unreadNotifications: number }>('/api/auth/me'),
  sendOtp: (email: string) => request<{ success: boolean; message: string; testCode?: string }>('/api/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  verifyOtp: (email: string, code: string) => request<{ success: boolean; verified: boolean; isNewUser: boolean; user?: Profile }>('/api/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  }),
  switchUser: (userId: string) => request<{ success: boolean; user: Profile }>('/api/auth/switch-user', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }),
  register: async (data: {
    fullName: string;
    displayName: string;
    email: string;
    dateOfBirth: string;
    branch: string;
    academicYear: string;
    rollNumber?: string;
    verificationMethod: string;
  }) => {
    const res = await request<{ success: boolean; user: Profile }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.user?.id) {
      localStorage.setItem('afterclass_user_id', res.user.id);
    }
    return res;
  },
  login: async (email: string) => {
    const res = await request<{ success: boolean; user: Profile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    if (res.user?.id) {
      localStorage.setItem('afterclass_user_id', res.user.id);
    }
    return res;
  },
  logout: async () => {
    localStorage.removeItem('afterclass_user_id');
    return request<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
  },

  // Profiles & Discovery
  getDiscoverProfiles: (params?: { branch?: string; year?: string; preference?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<{ profiles: (Profile & { compatibilityScore: number; isLiked?: boolean; matchBreakdown: any })[] }>(`/api/discover${q ? `?${q}` : ''}`);
  },
  updateProfile: (data: Partial<Profile>) => request<{ success: boolean; profile: Profile }>('/api/profiles/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Matches & Messaging
  likeProfile: (targetId: string) => request<{ success: boolean; isMutual: boolean; match?: Match }>('/api/matches/like', {
    method: 'POST',
    body: JSON.stringify({ targetId }),
  }),
  getMatches: () => request<{ matches: Match[] }>('/api/matches'),
  unmatch: (matchId: string) => request<{ success: boolean }>(`/api/matches/${matchId}/unmatch`, { method: 'POST' }),
  getMessages: (matchId: string) => request<{ messages: Message[]; otherProfile?: Profile }>(`/api/messages/${matchId}`),
  sendMessage: (matchId: string, content: string) => request<{ success: boolean; message: Message }>(`/api/messages/${matchId}`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  }),

  // Secret Admirer
  getSecretAdmirerStatus: () => request<{
    admirerCount: number;
    sentCount: number;
    sentTargetIds: string[];
    mutualCrushes: any[];
  }>('/api/secret-admirer'),
  expressSecretAdmirer: (targetId: string) => request<{ success: boolean; isMutual: boolean; alreadyExpressed?: boolean }>('/api/secret-admirer/express', {
    method: 'POST',
    body: JSON.stringify({ targetId }),
  }),
  consentSecretAdmirerReveal: (targetId: string) => request<{ success: boolean }>('/api/secret-admirer/consent-reveal', {
    method: 'POST',
    body: JSON.stringify({ targetId }),
  }),

  // Confessions
  getConfessions: (params?: { category?: string; search?: string; sort?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<{ confessions: Confession[] }>(`/api/confessions${q ? `?${q}` : ''}`);
  },
  submitConfession: (data: { content: string; category: string; contentWarning?: string }) => request<{ success: boolean; confession: Confession }>('/api/confessions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  reactConfession: (confessionId: string, reactionType: string) => request<{ success: boolean; likes_count: number; user_reaction?: string }>(`/api/confessions/${confessionId}/react`, {
    method: 'POST',
    body: JSON.stringify({ reactionType }),
  }),
  commentConfession: (confessionId: string, content: string) => request<{ success: boolean; comment: any }>(`/api/confessions/${confessionId}/comment`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  }),

  // Couples Corner
  getCoupleSpace: () => request<{
    hasSpace: boolean;
    space?: CoupleSpace;
    memories?: any[];
    notes?: any[];
    bucketList?: any[];
  }>('/api/couples/space'),
  invitePartner: (data: { partnerEmail: string; relationshipStartDate?: string; spaceName?: string }) => request<{ success: boolean; space: CoupleSpace }>('/api/couples/invite', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  addCoupleMemory: (data: { spaceId: string; title: string; memoryDate?: string; caption?: string; imageUrl?: string }) => request<{ success: boolean; memory: any }>('/api/couples/memories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  addCoupleNote: (data: { spaceId: string; title: string; content: string }) => request<{ success: boolean; note: any }>('/api/couples/notes', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  addCoupleBucketItem: (data: { spaceId: string; activity: string; targetDate?: string; notes?: string }) => request<{ success: boolean; item: any }>('/api/couples/bucket-list', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  toggleCoupleBucketItem: (id: string) => request<{ success: boolean; item: any }>(`/api/couples/bucket-list/${id}/toggle`, {
    method: 'PUT',
  }),

  // Date Planner
  getDatePlans: () => request<{ plans: DatePlan[] }>('/api/date-plans'),
  saveDatePlan: (data: Partial<DatePlan>) => request<{ success: boolean; plan: DatePlan }>('/api/date-plans', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Communities
  getCommunities: () => request<{ communities: Community[] }>('/api/communities'),
  getCommunityPosts: (communityId: string) => request<{ posts: CommunityPost[] }>(`/api/communities/${communityId}/posts`),
  createCommunityPost: (communityId: string, data: { title: string; content: string }) => request<{ success: boolean; post: CommunityPost }>(`/api/communities/${communityId}/posts`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  toggleJoinCommunity: (communityId: string) => request<{ success: boolean; is_member: boolean; members_count: number }>(`/api/communities/${communityId}/join`, {
    method: 'POST',
  }),

  // Campus Events
  getEvents: () => request<{ events: CampusEvent[] }>('/api/events'),
  toggleEventRsvp: (eventId: string) => request<{ success: boolean; is_registered: boolean; count: number }>(`/api/events/${eventId}/rsvp`, {
    method: 'POST',
  }),

  // Polls
  getPolls: () => request<{ polls: CampusPoll[] }>('/api/polls'),
  votePoll: (pollId: string, optionId: string) => request<{ success: boolean; poll: CampusPoll }>(`/api/polls/${pollId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ optionId }),
  }),

  // Notifications
  getNotifications: () => request<{ notifications: AppNotification[] }>('/api/notifications'),
  markAllNotificationsRead: () => request<{ success: boolean }>('/api/notifications/read-all', { method: 'PUT' }),

  // Reports
  submitReport: (data: { targetType: string; targetId: string; reason: string; details?: string }) => request<{ success: boolean; report: UserReport }>('/api/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Admin APIs
  getAdminOverview: () => request<{
    totalUsers: number;
    verifiedUsers: number;
    pendingVerifications: number;
    activeMatches: number;
    pendingConfessions: number;
    openReports: number;
    totalEvents: number;
    auditLogsCount: number;
  }>('/api/admin/overview'),
  getAdminUsers: () => request<{ users: Profile[] }>('/api/admin/users'),
  updateUserStatus: (userId: string, status: string) => request<{ success: boolean; user: Profile }>(`/api/admin/users/${userId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  getAdminVerifications: () => request<{ requests: VerificationRequest[] }>('/api/admin/verifications'),
  decideVerification: (requestId: string, decision: 'approved' | 'rejected', notes?: string) => request<{ success: boolean }>(`/api/admin/verifications/${requestId}/decision`, {
    method: 'PUT',
    body: JSON.stringify({ decision, notes }),
  }),
  getAdminConfessions: () => request<{ confessions: Confession[] }>('/api/admin/confessions'),
  decideConfession: (confessionId: string, decision: 'approved' | 'rejected' | 'hidden') => request<{ success: boolean }>(`/api/admin/confessions/${confessionId}/decision`, {
    method: 'PUT',
    body: JSON.stringify({ decision }),
  }),
  getAdminReports: () => request<{ reports: UserReport[] }>('/api/admin/reports'),
  resolveReport: (reportId: string, actionTaken: string) => request<{ success: boolean }>(`/api/admin/reports/${reportId}/resolve`, {
    method: 'PUT',
    body: JSON.stringify({ actionTaken }),
  }),
  getAdminAuditLogs: () => request<{ auditLogs: AuditLog[] }>('/api/admin/audit-logs'),

  // Gemini AI Assistant
  getAiAssistance: (mode: 'conversation_starters' | 'bio_helper' | 'date_idea' | 'personality_summary', context?: any) => request<any>('/api/gemini/assistant', {
    method: 'POST',
    body: JSON.stringify({ mode, context }),
  }),
};
