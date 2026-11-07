# AFTERCLASS — Beyond Classrooms. Beyond Connections.
### Exclusive Campus Social Networking & Dating Web Application for HBTU Kanpur Students

---

## 1. Product Overview

**AFTERCLASS** is an independent, student-created campus social platform architected exclusively for verified students of **Harcourt Butler Technical University (HBTU), Kanpur**.

The platform combines four essential social pillars:
1. **Singles & Dating (18+)**: Mutual double-opt-in matching with a transparent recommendation algorithm (40% shared interests, 25% personality quiz answers, 20% campus activities, 15% mutual preferences).
2. **Campus Connections**: Inter-branch friendship, study partnerships, and gym/activity buddy discovery.
3. **Anonymous Confessions**: Safe, moderated campus storytelling with real-time regex & AI moderation assistance to prohibit phone numbers, doxxing, or harassment.
4. **Couples Corner**: Double-consensual private digital space for university couples to track relationship milestones, shared memories, love notes, anniversary countdowns, and bucket lists.
5. **Campus Buzz & Date Planner**: Curated Kanpur itineraries (budget in INR ₹100, ₹300, ₹500, ₹1,000+) featuring verified local spots like Swaroop Nagar cafes, Ganga Barrage promenade, Allen Forest Zoo, and Moti Jheel.

---

## 2. Technology Stack

- **Frontend**: React 19 + TypeScript, Tailwind CSS v4, Lucide Icons, Mobile-first responsive layout adhering to WCAG AA contrast standards.
- **Backend**: Node.js & Express server (`server.ts`) with Vite middleware mounting for development, REST APIs for all 37 database entities.
- **Database Migrations & Schema**:
  - `supabase/migrations/20261102000000_create_afterclass_schema.sql` (All 37 PostgreSQL tables with UUID primary keys, indexes, foreign keys, and seed data)
  - `supabase/migrations/20261102000001_row_level_security_policies.sql` (Strict RLS policies matching Section 23 security rules)
  - `supabase/migrations/20261102000002_storage_buckets_setup.sql` (Storage buckets: `profile-images`, `couple-memories`, `event-images`, `confession-media`)
- **AI Integrations**: Server-side Gemini 3.8 Flash (`@google/genai`) for dating icebreaker suggestions, profile bio generation, local Kanpur date itineraries, and personality archetype summaries.

---

## 3. Brand Identity & Design System

- **Midnight Navy**: `#101827` (Primary background canvas)
- **Deep Charcoal**: `#151A25` (Surface and secondary container background)
- **Card Background**: `#1D2636` (Interactive elevation surface)
- **Soft Rose**: `#E879A9` (Romantic accents, mutual likes, notifications)
- **Champagne Gold**: `#D9B978` (Primary brand accent, wordmark, verified badges)
- **Cloud White**: `#F3F4F6` (High-contrast typography)
- **Muted Gray**: `#9CA3AF` (Secondary metadata text)
- **Success Green**: `#4ADE80` (Verified student status)
- **Error Red**: `#F87171` (Security warnings and reports)

Typography:
- Headings: `Manrope`
- Body: `Inter`
- Numerals: Tabular monospace figures

---

## 4. Database Schema (37 Tables)

1. `profiles`: HBTU student accounts, DOB (18+ verified), branch, year, bio, roll number, verification status.
2. `verification_requests`: Enrolment proof, roll number audits, reviewer notes.
3. `user_preferences`: Dating/friendship intents, preferred branches/years, notification preferences.
4. `interests`: Global catalog of 14 campus hobbies & engineering passions.
5. `user_interests`: Association table mapping students to interests.
6. `personality_answers`: Quiz answers (introvert/extrovert, chai/coffee, mountains/beaches, night owl/early bird).
7. `likes`: Unilateral confidential like records (sender != receiver).
8. `matches`: Mutual matches created when both parties like each other.
9. `conversations`: Private conversation record linked to mutual match.
10. `conversation_members`: Access membership list for conversations.
11. `messages`: Real-time text messaging between matched participants.
12. `secret_admirer_requests`: Confidential crush selections and double-consent reveal flags.
13. `confessions`: Anonymous campus stories with category, content warning, and AI moderation flags.
14. `confession_reactions`: Reactions (heart, relatable, hug, laugh, fire).
15. `confession_comments`: Anonymous comments on approved confessions.
16. `communities`: 12 HBTU interest clubs (Book Lovers, Music Addicts, Photography, Chess, Fitness, etc.).
17. `community_members`: Student membership in clubs.
18. `community_posts`: Discussion threads within communities.
19. `community_comments`: Replies to community discussions.
20. `couple_spaces`: Encrypted couple partnership space with anniversary dates.
21. `couple_members`: Consenting partners in the couple space.
22. `couple_invitations`: Partner invitation codes and status.
23. `couple_memories`: Private couple photo journal entries.
24. `couple_notes`: Love notes and pinned letters.
25. `couple_bucket_lists`: Shared relationship goals and completed checklists.
26. `date_plans`: Saved Kanpur date itineraries with budgets (₹100, ₹300, ₹500, ₹1000+).
27. `events`: Campus Buzz mixers, open mics, chess championships, and photo walks.
28. `event_registrations`: Live RSVP counters and attendee registry.
29. `polls`: Campus Question of the Day and voting polls.
30. `poll_options`: Choices for daily campus polls.
31. `poll_votes`: Individual student vote tracking to prevent duplicate ballots.
32. `notifications`: In-app notification center for matches, chats, and events.
33. `reports`: Abuse and community safety violation tickets.
34. `blocks`: Unilateral student block records preventing contact.
35. `admin_users`: Administrative roles (Super Admin, Moderator, Event Manager).
36. `moderation_actions`: Log of confession approvals/rejections and user suspensions.
37. `audit_logs`: Immutable security audit log recording administrator ID, action, and timestamp.

---

## 5. Security & Row Level Security (RLS)

- **Rule 1**: Students can only edit their own profile fields.
- **Rule 2**: Age 18+ is strictly verified prior to permitting dating participation.
- **Rule 3**: Conversations and messages are restricted solely to matched participants.
- **Rule 4**: Couple spaces are accessible only by the two consenting partners.
- **Rule 5**: Administration routes are protected server-side and restricted to authorized super admin emails.
- **Rule 6**: Storage buckets enforce strict MIME type limits, size caps (5MB to 10MB), and private bucket access for couple memories.

---

## 6. How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (.env)
cp .env.example .env
# Set your GEMINI_API_KEY (injected automatically in AI Studio)

# 3. Start development server
npm run dev

# 4. Access application
# Open http://localhost:3000 in your browser
```

---

## 7. Testing Instructions

1. **Authentication & Student Verification**:
   - Register a new account with an `@hbtu.ac.in` email to test automated verification.
   - Test age enforcement by attempting to enter a birthdate under 18.
2. **Discovery & Matching Algorithm**:
   - Navigate to `/discover`. Filter by branch, year, or search for "Chess".
   - Notice the transparent compatibility score breakdown (40% interests, 25% personality, 20% activities, 15% preferences).
   - Click "Like". Use the persona switcher at the bottom to log in as the target student (e.g., Ananya) and like back to trigger the Mutual Match celebration and Gemini AI icebreakers.
3. **Private Messaging**:
   - Navigate to `/matches`. Open chat, send real-time messages, and test conversation starter suggestions.
4. **Anonymous Confessions**:
   - Navigate to `/confessions`. Filter by category (e.g. "Crushes", "College life"). Submit a confession. Verify reaction increments and anonymous comments.
5. **Couples Corner**:
   - Navigate to `/couples`. View Our Story, milestone countdown, photo memories, love notes, and bucket list items.
6. **Student Date Planner**:
   - Navigate to `/date-planner`. Choose budget ₹100 or ₹300 and mood "Romantic". Generate an authentic Kanpur itinerary and save it.
7. **Admin Dashboard**:
   - Sign in as Yash Prakash (`yashprakash26707@gmail.com`).
   - Click "Admin" in the top bar to inspect pending verifications, review flagged confessions, and view the immutable audit trail.
