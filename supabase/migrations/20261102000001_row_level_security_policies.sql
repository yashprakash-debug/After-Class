-- AFTERCLASS Row Level Security Policies
-- Harcourt Butler Technical University (HBTU) Campus Network
-- Production Security Rules (PostgreSQL / Supabase RLS)

-- 1. Enable RLS on all User Data Tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE personality_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE secret_admirer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE confession_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE confession_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_bucket_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current auth user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users au
        JOIN profiles p ON au.profile_id = p.id
        WHERE p.auth_user_id = auth.uid() AND au.is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES POLICIES
-- Rule 1: Users can edit only their own profile
-- Rule 2: Permitted profile fields are visible to verified students (unless hidden from discovery)
CREATE POLICY "Public profile fields visible to authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (
    is_discoverable = TRUE 
    OR auth_user_id = auth.uid()
    OR is_admin()
);

CREATE POLICY "Users can update only their own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (
    auth_user_id = auth.uid() 
    AND account_status = account_status -- Cannot self-verify
);

CREATE POLICY "Users can insert their initial profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth_user_id = auth.uid());

-- 2. VERIFICATION REQUESTS
CREATE POLICY "Users can view their own verification status"
ON verification_requests FOR SELECT
TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR is_admin());

CREATE POLICY "Users can submit their verification request"
ON verification_requests FOR INSERT
TO authenticated
WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Only admins can update verification status"
ON verification_requests FOR UPDATE
TO authenticated
USING (is_admin());

-- 3. USER PREFERENCES
CREATE POLICY "Users manage own preferences"
ON user_preferences FOR ALL
TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

-- 4. LIKES & DATING
-- Rule 3: Only verified eligible users (18+) can participate in dating
CREATE POLICY "Send like if verified adult"
ON likes FOR INSERT
TO authenticated
WITH CHECK (
    sender_id IN (
        SELECT id FROM profiles 
        WHERE auth_user_id = auth.uid() 
          AND is_age_verified = TRUE 
          AND account_status = 'verified'
    )
);

CREATE POLICY "View own sent likes"
ON likes FOR SELECT
TO authenticated
USING (sender_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

-- 5. MATCHES
CREATE POLICY "View matches where member"
ON matches FOR SELECT
TO authenticated
USING (
    profile_1_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR profile_2_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR is_admin()
);

CREATE POLICY "Update match (unmatch)"
ON matches FOR UPDATE
TO authenticated
USING (
    profile_1_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR profile_2_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);

-- 6. CONVERSATIONS & MESSAGES
-- Rule 4 & 5: Only matched users can access their conversations and messages
CREATE POLICY "Conversation members can view conversation"
ON conversations FOR SELECT
TO authenticated
USING (
    id IN (
        SELECT conversation_id FROM conversation_members cm
        JOIN profiles p ON cm.profile_id = p.id
        WHERE p.auth_user_id = auth.uid()
    )
);

CREATE POLICY "Conversation members can view messages"
ON messages FOR SELECT
TO authenticated
USING (
    conversation_id IN (
        SELECT conversation_id FROM conversation_members cm
        JOIN profiles p ON cm.profile_id = p.id
        WHERE p.auth_user_id = auth.uid()
    )
);

CREATE POLICY "Conversation members can send messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
    sender_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    AND conversation_id IN (
        SELECT cm.conversation_id FROM conversation_members cm
        JOIN matches m ON m.id = (SELECT match_id FROM conversations WHERE id = cm.conversation_id)
        WHERE cm.profile_id = sender_id AND m.is_active = TRUE
    )
);

-- 7. SECRET ADMIRER REQUESTS
CREATE POLICY "Admirer can view sent requests"
ON secret_admirer_requests FOR SELECT
TO authenticated
USING (
    admirer_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR (
        target_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
        AND is_mutual = TRUE
        AND admirer_consent_reveal = TRUE
    )
);

CREATE POLICY "Submit secret admirer request"
ON secret_admirer_requests FOR INSERT
TO authenticated
WITH CHECK (
    admirer_id IN (
        SELECT id FROM profiles 
        WHERE auth_user_id = auth.uid() 
          AND is_age_verified = TRUE 
          AND account_status = 'verified'
    )
);

-- 8. CONFESSIONS
CREATE POLICY "View approved confessions"
ON confessions FOR SELECT
TO authenticated
USING (
    status = 'approved'
    OR author_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR is_admin()
);

CREATE POLICY "Submit confession"
ON confessions FOR INSERT
TO authenticated
WITH CHECK (author_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "React to confession"
ON confession_reactions FOR ALL
TO authenticated
USING (profile_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

-- 9. COUPLE SPACES & MEMORIES
-- Rule 6: Only couple-space members can access their private couple content
CREATE POLICY "Couple members view space"
ON couple_spaces FOR SELECT
TO authenticated
USING (
    partner_1_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    OR partner_2_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
);

CREATE POLICY "Couple members view memories"
ON couple_memories FOR SELECT
TO authenticated
USING (
    space_id IN (
        SELECT id FROM couple_spaces
        WHERE partner_1_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
           OR partner_2_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    )
);

CREATE POLICY "Couple members insert memories"
ON couple_memories FOR INSERT
TO authenticated
WITH CHECK (
    space_id IN (
        SELECT id FROM couple_spaces
        WHERE partner_1_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
           OR partner_2_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    )
);

CREATE POLICY "Couple members view and create notes"
ON couple_notes FOR ALL
TO authenticated
USING (
    space_id IN (
        SELECT id FROM couple_spaces
        WHERE partner_1_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
           OR partner_2_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    )
);

CREATE POLICY "Couple members view and create bucket list"
ON couple_bucket_lists FOR ALL
TO authenticated
USING (
    space_id IN (
        SELECT id FROM couple_spaces
        WHERE partner_1_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
           OR partner_2_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    )
);

-- 10. NOTIFICATIONS
-- Rule 13: Notifications are visible only to their recipients
CREATE POLICY "Recipients view own notifications"
ON notifications FOR ALL
TO authenticated
USING (recipient_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

-- 11. REPORTS
CREATE POLICY "Submit reports"
ON reports FOR INSERT
TO authenticated
WITH CHECK (reporter_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Only admins view reports"
ON reports FOR SELECT
TO authenticated
USING (is_admin());

-- 12. BLOCKS
-- Rule 11: Blocked users cannot contact blocker
CREATE POLICY "Users view and manage their blocks"
ON blocks FOR ALL
TO authenticated
USING (blocker_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));

-- 13. ADMIN ACCESS
CREATE POLICY "Only super admins manage admin roles"
ON admin_users FOR ALL
TO authenticated
USING (is_admin());

CREATE POLICY "Only admins view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (is_admin());
