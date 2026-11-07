-- AFTERCLASS Database Migration: Initial Schema (37 Tables)
-- Harcourt Butler Technical University (HBTU) Campus Network
-- Generated for PostgreSQL / Supabase

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    display_name VARCHAR(60) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    date_of_birth DATE NOT NULL,
    branch VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL, -- '1st Year', '2nd Year', '3rd Year', 'Final Year', 'M.Tech / PhD'
    bio TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    gender VARCHAR(40) DEFAULT 'Prefer not to say',
    is_age_verified BOOLEAN DEFAULT FALSE,
    is_student_verified BOOLEAN DEFAULT FALSE,
    account_status VARCHAR(30) DEFAULT 'pending_verification', -- 'pending_verification', 'verified', 'rejected', 'suspended', 'deactivated'
    is_discoverable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_branch ON profiles(branch);

-- 2. VERIFICATION_REQUESTS
CREATE TABLE IF NOT EXISTS verification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    verification_method VARCHAR(50) NOT NULL, -- 'institutional_email', 'student_id_card', 'fee_receipt', 'roll_number'
    document_url TEXT DEFAULT '',
    roll_number VARCHAR(50),
    status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    reviewer_notes TEXT,
    reviewed_by UUID,
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_verif_status ON verification_requests(status);

-- 3. USER_PREFERENCES
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    looking_for_dating BOOLEAN DEFAULT FALSE,
    looking_for_friendship BOOLEAN DEFAULT TRUE,
    looking_for_study_partner BOOLEAN DEFAULT FALSE,
    looking_for_activity_partner BOOLEAN DEFAULT FALSE,
    preferred_years TEXT[] DEFAULT ARRAY[]::TEXT[],
    preferred_branches TEXT[] DEFAULT ARRAY[]::TEXT[],
    notify_matches BOOLEAN DEFAULT TRUE,
    notify_messages BOOLEAN DEFAULT TRUE,
    notify_events BOOLEAN DEFAULT TRUE,
    notify_confessions BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INTERESTS
CREATE TABLE IF NOT EXISTS interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(60) NOT NULL UNIQUE,
    category VARCHAR(60) NOT NULL,
    icon_name VARCHAR(50) DEFAULT 'Tag',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USER_INTERESTS
CREATE TABLE IF NOT EXISTS user_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    interest_id UUID NOT NULL REFERENCES interests(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, interest_id)
);
CREATE INDEX IF NOT EXISTS idx_user_interests_prof ON user_interests(profile_id);

-- 6. PERSONALITY_ANSWERS
CREATE TABLE IF NOT EXISTS personality_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    question_key VARCHAR(100) NOT NULL,
    answer_value VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, question_key)
);

-- 7. LIKES
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id),
    CONSTRAINT check_cannot_like_self CHECK (sender_id != receiver_id)
);
CREATE INDEX IF NOT EXISTS idx_likes_receiver ON likes(receiver_id);
CREATE INDEX IF NOT EXISTS idx_likes_sender ON likes(sender_id);

-- 8. MATCHES
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    profile_2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    unmatched_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_1_id, profile_2_id),
    CONSTRAINT check_match_order CHECK (profile_1_id < profile_2_id)
);
CREATE INDEX IF NOT EXISTS idx_matches_p1 ON matches(profile_1_id);
CREATE INDEX IF NOT EXISTS idx_matches_p2 ON matches(profile_2_id);

-- 9. CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
    last_message_text TEXT DEFAULT '',
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CONVERSATION_MEMBERS
CREATE TABLE IF NOT EXISTS conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    is_muted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, profile_id)
);

-- 11. MESSAGES
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at ASC);

-- 12. SECRET_ADMIRER_REQUESTS
CREATE TABLE IF NOT EXISTS secret_admirer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admirer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_mutual BOOLEAN DEFAULT FALSE,
    admirer_consent_reveal BOOLEAN DEFAULT FALSE,
    target_consent_reveal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(admirer_id, target_id),
    CONSTRAINT check_admirer_not_self CHECK (admirer_id != target_id)
);
CREATE INDEX IF NOT EXISTS idx_secret_admirer_target ON secret_admirer_requests(target_id);

-- 13. CONFESSIONS
CREATE TABLE IF NOT EXISTS confessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    category VARCHAR(60) NOT NULL, -- 'Crushes', 'Love', 'Friendship', 'College life', 'Funny incidents', 'Appreciation', 'Relationships', 'Personal experiences', 'General thoughts'
    content_warning VARCHAR(100),
    is_anonymous BOOLEAN DEFAULT TRUE,
    status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'hidden'
    ai_moderation_flagged BOOLEAN DEFAULT FALSE,
    ai_moderation_reason TEXT,
    moderated_by UUID,
    moderated_at TIMESTAMPTZ,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_confessions_status ON confessions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_confessions_category ON confessions(category);

-- 14. CONFESSION_REACTIONS
CREATE TABLE IF NOT EXISTS confession_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    confession_id UUID NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reaction_type VARCHAR(30) NOT NULL DEFAULT 'heart', -- 'heart', 'relatable', 'hug', 'laugh', 'fire'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(confession_id, profile_id)
);

-- 15. CONFESSION_COMMENTS
CREATE TABLE IF NOT EXISTS confession_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    confession_id UUID NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_confession_comments_conf ON confession_comments(confession_id, created_at ASC);

-- 16. COMMUNITIES
CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon_name VARCHAR(50) DEFAULT 'Users',
    cover_image_url TEXT,
    is_official BOOLEAN DEFAULT TRUE,
    members_count INT DEFAULT 0,
    posts_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. COMMUNITY_MEMBERS
CREATE TABLE IF NOT EXISTS community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(30) DEFAULT 'member', -- 'member', 'moderator', 'admin'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(community_id, profile_id)
);

-- 18. COMMUNITY_POSTS
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comm_posts_comm ON community_posts(community_id, created_at DESC);

-- 19. COMMUNITY_COMMENTS
CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. COUPLE_SPACES
CREATE TABLE IF NOT EXISTS couple_spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_1_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    partner_2_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    relationship_start_date DATE,
    space_name VARCHAR(100) DEFAULT 'Our Space',
    anniversary_date DATE,
    cover_image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(partner_1_id, partner_2_id),
    CONSTRAINT check_partners_diff CHECK (partner_1_id < partner_2_id)
);

-- 21. COUPLE_MEMBERS
CREATE TABLE IF NOT EXISTS couple_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID NOT NULL REFERENCES couple_spaces(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    nickname VARCHAR(60),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(space_id, profile_id)
);

-- 22. COUPLE_INVITATIONS
CREATE TABLE IF NOT EXISTS couple_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    invite_code VARCHAR(32) NOT NULL UNIQUE,
    status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'expired'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. COUPLE_MEMORIES
CREATE TABLE IF NOT EXISTS couple_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID NOT NULL REFERENCES couple_spaces(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    memory_date DATE NOT NULL,
    caption TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. COUPLE_NOTES
CREATE TABLE IF NOT EXISTS couple_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID NOT NULL REFERENCES couple_spaces(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(150),
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. COUPLE_BUCKET_LISTS
CREATE TABLE IF NOT EXISTS couple_bucket_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID NOT NULL REFERENCES couple_spaces(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    activity VARCHAR(200) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    target_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. DATE_PLANS
CREATE TABLE IF NOT EXISTS date_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    budget_range VARCHAR(50) NOT NULL, -- '₹100', '₹300', '₹500', '₹1,000+'
    mood VARCHAR(50) NOT NULL, -- 'Romantic', 'Adventurous', 'Peaceful', 'Fun & Playful'
    duration VARCHAR(50) NOT NULL, -- '1 hour', '2 hours', 'Half-day'
    experience_type VARCHAR(50) NOT NULL, -- 'Food & Cafe', 'Movies & Chill', 'Outdoor & Nature', 'Campus Walk'
    suggested_activity TEXT NOT NULL,
    estimated_budget_inr INT NOT NULL,
    venue_recommendations TEXT,
    checklist TEXT[] DEFAULT ARRAY[]::TEXT[],
    conversation_prompts TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_saved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. EVENTS
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(60) NOT NULL, -- 'Social Mixers', 'Movie Nights', 'Coffee Meetups', 'Photography Walks', 'Chess Meetups', 'Singles Events', 'Community Activities'
    event_date TIMESTAMPTZ NOT NULL,
    venue_meeting_point VARCHAR(200) NOT NULL,
    max_participants INT DEFAULT 50,
    current_participants_count INT DEFAULT 0,
    image_url TEXT,
    status VARCHAR(30) DEFAULT 'published', -- 'draft', 'pending_approval', 'published', 'cancelled'
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 28. EVENT_REGISTRATIONS
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'registered', -- 'registered', 'waitlisted', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, profile_id)
);

-- 29. POLLS
CREATE TABLE IF NOT EXISTS polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    category VARCHAR(60) DEFAULT 'Campus Life',
    expires_at TIMESTAMPTZ NOT NULL,
    total_votes INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'active', -- 'active', 'closed', 'flagged'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 30. POLL_OPTIONS
CREATE TABLE IF NOT EXISTS poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_text VARCHAR(150) NOT NULL,
    votes_count INT DEFAULT 0
);

-- 31. POLL_VOTES
CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(poll_id, profile_id)
);

-- 32. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'new_match', 'new_message', 'secret_admirer_mutual', 'confession_approved', 'couple_invite', 'event_reminder'
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read, created_at DESC);

-- 33. REPORTS
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_type VARCHAR(40) NOT NULL, -- 'profile', 'confession', 'community_post', 'poll', 'message'
    target_id UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    details TEXT,
    status VARCHAR(30) DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'dismissed'
    action_taken TEXT,
    resolved_by UUID,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 34. BLOCKS
CREATE TABLE IF NOT EXISTS blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(blocker_id, blocked_id),
    CONSTRAINT check_cannot_block_self CHECK (blocker_id != blocked_id)
);

-- 35. ADMIN_USERS
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    role VARCHAR(40) NOT NULL, -- 'super_admin', 'moderator', 'event_manager', 'content_manager'
    is_active BOOLEAN DEFAULT TRUE,
    granted_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 36. MODERATION_ACTIONS
CREATE TABLE IF NOT EXISTS moderation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moderator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_type VARCHAR(40) NOT NULL,
    target_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'approved', 'rejected', 'suspended', 'content_removed'
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 37. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action_type VARCHAR(60) NOT NULL,
    target_table VARCHAR(60) NOT NULL,
    target_record_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SEED DATA: HBTU Interests, Personality Questions, and Communities
INSERT INTO interests (name, category, icon_name) VALUES
('Coding & AI', 'Technology', 'Cpu'),
('Robotics', 'Technology', 'Bot'),
('Acoustic Music', 'Arts & Culture', 'Music'),
('Indie Cinema', 'Entertainment', 'Film'),
('Classic Literature', 'Literature', 'BookOpen'),
('Photography', 'Creative', 'Camera'),
('Competitive Gaming', 'Entertainment', 'Gamepad2'),
('Fitness & Gym', 'Wellness', 'Dumbbell'),
('Chess', 'Strategy', 'Trophy'),
('Travel & Roadtrips', 'Lifestyle', 'Compass'),
('Street Food & Cafes', 'Food', 'Utensils'),
('Philosophy & Debates', 'Intellectual', 'Brain'),
('Cricket & Football', 'Sports', 'Activity'),
('Startups & Innovation', 'Business', 'Zap')
ON CONFLICT (name) DO NOTHING;

INSERT INTO communities (name, slug, description, icon_name) VALUES
('Book Lovers', 'book-lovers', 'Fiction, classics, philosophy and quiet reading meetups across HBTU campus.', 'BookOpen'),
('Music Addicts', 'music-addicts', 'Jam sessions, indie playlist exchanges, guitar chords, and hostel rooftop acoustic nights.', 'Music'),
('Photography Collective', 'photography', 'Capturing Kanpur light, Ganga Barrage dawns, Allen Forest walks, and campus architecture.', 'Camera'),
('Chess Guild', 'chess', 'Rapid games, tournament prep, and chess puzzle challenges under the campus trees.', 'Trophy'),
('Fitness & Athletics', 'fitness', 'Gym accountability, morning track runs, workout routines, and sports nutrition.', 'Dumbbell'),
('Movie Club', 'movies', 'Film screenings, dissecting cinema classics, weekend marathons, and review discussions.', 'Film'),
('Campus Gamers', 'gaming', 'Esports, casual LANs, strategy, fighting games, and late night sessions.', 'Gamepad2'),
('Philosophy & Deep Talks', 'philosophy', 'Meaningful questions on life, ethics, existentialism, and campus debates.', 'Brain'),
('Tech & Builders', 'technology', 'Open source, AI projects, hackathons, and building real campus utilities.', 'Cpu'),
('HBTU Entrepreneurs', 'entrepreneurship', 'Startup ideas, pitch deck practice, funding discussions, and co-founder matching.', 'Zap'),
('Kanpur Explorers', 'kanpur-explorers', 'Discovering hidden cafes, street food in Swaroop Nagar, and historical gems of Kanpur.', 'Compass'),
('Introverts Club', 'introverts-club', 'Low-energy social presence, quiet study buddies, no pressure to perform.', 'Coffee')
ON CONFLICT (name) DO NOTHING;
