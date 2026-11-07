// AFTERCLASS TypeScript Domain Models

export type AcademicYear = '1st Year' | '2nd Year' | '3rd Year' | 'Final Year' | 'M.Tech / PhD';

export type AccountStatus = 'pending_verification' | 'verified' | 'rejected' | 'suspended' | 'deactivated';

export type VerificationMethod = 'institutional_email' | 'student_id_card' | 'fee_receipt' | 'roll_number';

export type ConnectionPreference = 'dating' | 'friendship' | 'study_partner' | 'activity_partner' | 'social';

export type ConfessionCategory = 
  | 'Crushes' 
  | 'Love' 
  | 'Friendship' 
  | 'College life' 
  | 'Funny incidents' 
  | 'Appreciation' 
  | 'Relationships' 
  | 'Personal experiences' 
  | 'General thoughts';

export type EventCategory = 
  | 'Social Mixers' 
  | 'Movie Nights' 
  | 'Coffee Meetups' 
  | 'Photography Walks' 
  | 'Chess Meetups' 
  | 'Singles Events' 
  | 'Valentine Events' 
  | 'Community Activities';

export type AdminRole = 'super_admin' | 'moderator' | 'event_manager' | 'content_manager';

export interface Profile {
  id: string;
  auth_user_id?: string;
  full_name: string;
  display_name: string;
  email: string;
  date_of_birth: string; // YYYY-MM-DD
  branch: string; // e.g., 'Computer Science & Engineering', 'Information Technology', 'Mechanical Engineering'
  academic_year: AcademicYear;
  bio: string;
  avatar_url: string;
  gender: string;
  is_age_verified: boolean;
  is_student_verified: boolean;
  account_status: AccountStatus;
  is_discoverable: boolean;
  roll_number?: string;
  verification_method?: VerificationMethod;
  interests: string[];
  personality_answers: Record<string, string>;
  connection_preferences: ConnectionPreference[];
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  profile_id: string;
  looking_for_dating: boolean;
  looking_for_friendship: boolean;
  looking_for_study_partner: boolean;
  looking_for_activity_partner: boolean;
  preferred_years: AcademicYear[];
  preferred_branches: string[];
  notify_matches: boolean;
  notify_messages: boolean;
  notify_events: boolean;
  notify_confessions: boolean;
}

export interface MatchScoreBreakdown {
  totalScore: number;
  sharedInterestsScore: number; // 40%
  personalityScore: number;     // 25%
  commonActivitiesScore: number;// 20%
  mutualPreferencesScore: number;// 15%
  commonInterests: string[];
  commonTraits: string[];
}

export interface Match {
  id: string;
  profile_1_id: string;
  profile_2_id: string;
  is_active: boolean;
  created_at: string;
  otherProfile?: Profile;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface SecretAdmirerRequest {
  id: string;
  admirer_id: string;
  target_id: string;
  is_mutual: boolean;
  admirer_consent_reveal: boolean;
  target_consent_reveal: boolean;
  created_at: string;
}

export interface Confession {
  id: string;
  author_id: string;
  content: string;
  category: ConfessionCategory;
  content_warning?: string;
  is_anonymous: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  ai_moderation_flagged: boolean;
  ai_moderation_reason?: string;
  likes_count: number;
  comments_count: number;
  user_reaction?: string;
  comments?: ConfessionComment[];
  created_at: string;
}

export interface ConfessionComment {
  id: string;
  confession_id: string;
  author_id: string;
  author_name: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
}

export interface CoupleSpace {
  id: string;
  partner_1_id: string;
  partner_2_id: string;
  relationship_start_date?: string;
  space_name: string;
  anniversary_date?: string;
  cover_image_url?: string;
  is_active: boolean;
  partner_1?: Profile;
  partner_2?: Profile;
  created_at: string;
}

export interface CoupleMemory {
  id: string;
  space_id: string;
  created_by: string;
  title: string;
  memory_date: string;
  caption?: string;
  image_url?: string;
  created_at: string;
}

export interface CoupleNote {
  id: string;
  space_id: string;
  author_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

export interface CoupleBucketItem {
  id: string;
  space_id: string;
  created_by: string;
  activity: string;
  is_completed: boolean;
  target_date?: string;
  notes?: string;
  created_at: string;
}

export interface CoupleQuizAnswer {
  questionId: string;
  question: string;
  partner1Answer?: string;
  partner2Answer?: string;
}

export interface DatePlan {
  id: string;
  creator_id: string;
  title: string;
  budget_range: '₹100' | '₹300' | '₹500' | '₹1,000+';
  mood: 'Romantic' | 'Adventurous' | 'Peaceful' | 'Fun & Playful';
  duration: '1 hour' | '2 hours' | 'Half-day';
  experience_type: 'Food & Cafe' | 'Movies & Chill' | 'Outdoor & Nature' | 'Campus Walk';
  suggested_activity: string;
  estimated_budget_inr: number;
  venue_recommendations: string;
  checklist: string[];
  conversation_prompts: string[];
  is_saved: boolean;
  created_at: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  cover_image_url?: string;
  is_official: boolean;
  members_count: number;
  posts_count: number;
  is_member?: boolean;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  author_branch?: string;
  title: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  is_liked?: boolean;
  comments?: CommunityComment[];
  created_at: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface CampusEvent {
  id: string;
  organizer_id: string;
  organizer_name: string;
  title: string;
  description: string;
  category: EventCategory;
  event_date: string;
  venue_meeting_point: string;
  max_participants: number;
  current_participants_count: number;
  image_url?: string;
  status: 'published' | 'cancelled' | 'pending_approval';
  is_registered?: boolean;
  created_at: string;
}

export interface CampusPoll {
  id: string;
  creator_id: string;
  question: string;
  category: string;
  expires_at: string;
  total_votes: number;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
  user_voted_option_id?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  recipient_id: string;
  type: 'new_match' | 'new_message' | 'secret_admirer_mutual' | 'confession_approved' | 'couple_invite' | 'event_reminder';
  title: string;
  message: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface UserReport {
  id: string;
  reporter_id: string;
  reporter_name?: string;
  target_type: 'profile' | 'confession' | 'community_post' | 'message';
  target_id: string;
  target_summary?: string;
  reason: string;
  details?: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  action_taken?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action_type: string;
  target_table: string;
  target_record_id: string;
  details: Record<string, any>;
  created_at: string;
}

export interface VerificationRequest {
  id: string;
  profile_id: string;
  student_name: string;
  email: string;
  branch: string;
  academic_year: string;
  roll_number?: string;
  verification_method: VerificationMethod;
  document_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewer_notes?: string;
  created_at: string;
}
