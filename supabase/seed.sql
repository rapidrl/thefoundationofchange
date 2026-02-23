-- ============================================
-- The Foundation of Change — SAMPLE DATA SEED
-- Run this AFTER schema.sql in Supabase SQL Editor
-- All sample data uses SAMPLE- prefix for easy cleanup
-- ============================================

-- NOTE: Supabase requires auth.users entries for profiles.
-- We create sample profiles directly (bypassing auth trigger)
-- with deterministic UUIDs so we can reference them everywhere.

-- ============================================
-- SAMPLE PROFILES (8 participants + your admin)
-- ============================================

-- First, create sample users in auth.users (needed for FK reference)
-- These use the Supabase admin API format
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role)
VALUES
  ('11111111-1111-1111-1111-111111111101', '00000000-0000-0000-0000-000000000000', 'sample.marcus@example.com', crypt('SamplePass123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '45 days', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Marcus Thompson"}', 'authenticated', 'authenticated'),
  ('11111111-1111-1111-1111-111111111102', '00000000-0000-0000-0000-000000000000', 'sample.sarah@example.com', crypt('SamplePass123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '30 days', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sarah Lopez"}', 'authenticated', 'authenticated'),
  ('11111111-1111-1111-1111-111111111103', '00000000-0000-0000-0000-000000000000', 'sample.james@example.com', crypt('SamplePass123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '25 days', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"James Robinson"}', 'authenticated', 'authenticated'),
  ('11111111-1111-1111-1111-111111111104', '00000000-0000-0000-0000-000000000000', 'sample.ashley@example.com', crypt('SamplePass123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '20 days', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ashley Williams"}', 'authenticated', 'authenticated'),
  ('11111111-1111-1111-1111-111111111105', '00000000-0000-0000-0000-000000000000', 'sample.david@example.com', crypt('SamplePass123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '15 days', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"David Chen"}', 'authenticated', 'authenticated'),
  ('11111111-1111-1111-1111-111111111106', '00000000-0000-0000-0000-000000000000', 'sample.maria@example.com', crypt('SamplePass123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '10 days', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Maria Garcia"}', 'authenticated', 'authenticated'),
  ('11111111-1111-1111-1111-111111111107', '00000000-0000-0000-0000-000000000000', 'sample.kevin@example.com', crypt('SamplePass123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '7 days', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kevin Brown"}', 'authenticated', 'authenticated'),
  ('11111111-1111-1111-1111-111111111108', '00000000-0000-0000-0000-000000000000', 'sample.jessica@example.com', crypt('SamplePass123!', gen_salt('bf')), NOW(), NOW() - INTERVAL '3 days', NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Jessica Davis"}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Now create their profiles
INSERT INTO public.profiles (id, full_name, email, phone, date_of_birth, address, city, state, zip_code, probation_officer, court_id, role, timezone, created_at) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Marcus Thompson', 'sample.marcus@example.com', '(205) 555-0101', '1992-03-15', '123 Oak Street', 'Birmingham', 'AL', '35203', 'Officer Davis', 'SAMPLE-JC-2024-001', 'participant', 'America/Chicago', NOW() - INTERVAL '45 days'),
  ('11111111-1111-1111-1111-111111111102', 'Sarah Lopez', 'sample.sarah@example.com', '(713) 555-0202', '1999-08-22', '456 Elm Avenue', 'Houston', 'TX', '77001', NULL, 'SAMPLE-HC-2024-002', 'participant', 'America/Chicago', NOW() - INTERVAL '30 days'),
  ('11111111-1111-1111-1111-111111111103', 'James Robinson', 'sample.james@example.com', '(404) 555-0303', '1988-11-09', '789 Pine Road', 'Atlanta', 'GA', '30301', 'Officer Martinez', 'SAMPLE-FC-2024-003', 'participant', 'America/New_York', NOW() - INTERVAL '25 days'),
  ('11111111-1111-1111-1111-111111111104', 'Ashley Williams', 'sample.ashley@example.com', '(310) 555-0404', '2001-05-30', '321 Cedar Lane', 'Los Angeles', 'CA', '90001', NULL, NULL, 'participant', 'America/Los_Angeles', NOW() - INTERVAL '20 days'),
  ('11111111-1111-1111-1111-111111111105', 'David Chen', 'sample.david@example.com', '(212) 555-0505', '1995-01-18', '654 Maple Dr', 'New York', 'NY', '10001', 'Officer Wilson', 'SAMPLE-NY-2024-005', 'participant', 'America/New_York', NOW() - INTERVAL '15 days'),
  ('11111111-1111-1111-1111-111111111106', 'Maria Garcia', 'sample.maria@example.com', '(305) 555-0606', '1997-07-04', '987 Birch Blvd', 'Miami', 'FL', '33101', NULL, 'SAMPLE-MD-2024-006', 'participant', 'America/New_York', NOW() - INTERVAL '10 days'),
  ('11111111-1111-1111-1111-111111111107', 'Kevin Brown', 'sample.kevin@example.com', '(312) 555-0707', '1990-12-25', '147 Walnut St', 'Chicago', 'IL', '60601', 'Officer Taylor', 'SAMPLE-CC-2024-007', 'participant', 'America/Chicago', NOW() - INTERVAL '7 days'),
  ('11111111-1111-1111-1111-111111111108', 'Jessica Davis', 'sample.jessica@example.com', '(602) 555-0808', '2003-09-12', '258 Spruce Way', 'Phoenix', 'AZ', '85001', NULL, NULL, 'participant', 'America/Phoenix', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- ============================================
-- SAMPLE ENROLLMENTS
-- Mix of active, completed, and suspended
-- ============================================
INSERT INTO public.enrollments (id, user_id, hours_required, hours_completed, status, amount_paid, stripe_payment_id, start_date, completed_at, created_at) VALUES
  -- Marcus: COMPLETED 10 hours
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 10, 10.00, 'completed', 78.99, 'SAMPLE-pi_marcus01', NOW() - INTERVAL '45 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '45 days'),
  -- Sarah: ACTIVE, 25 hours, 18 done
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', 25, 18.50, 'active', 105.99, 'SAMPLE-pi_sarah01', NOW() - INTERVAL '30 days', NULL, NOW() - INTERVAL '30 days'),
  -- James: COMPLETED 50 hours
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', 50, 50.00, 'completed', 134.99, 'SAMPLE-pi_james01', NOW() - INTERVAL '25 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '25 days'),
  -- Ashley: ACTIVE, 8 hours, 3 done (student)
  ('22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111104', 8, 3.00, 'active', 78.99, 'SAMPLE-pi_ashley01', NOW() - INTERVAL '20 days', NULL, NOW() - INTERVAL '20 days'),
  -- David: SUSPENDED, 75 hours, 12 done
  ('22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111105', 75, 12.00, 'suspended', 154.99, 'SAMPLE-pi_david01', NOW() - INTERVAL '15 days', NULL, NOW() - INTERVAL '15 days'),
  -- Maria: ACTIVE, 5 hours, 4 done (almost done)
  ('22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111106', 5, 4.00, 'active', 28.99, 'SAMPLE-pi_maria01', NOW() - INTERVAL '10 days', NULL, NOW() - INTERVAL '10 days'),
  -- Kevin: ACTIVE, 100 hours, 24 done
  ('22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111107', 100, 24.00, 'active', 174.99, 'SAMPLE-pi_kevin01', NOW() - INTERVAL '7 days', NULL, NOW() - INTERVAL '7 days'),
  -- Jessica: ACTIVE, 6 hours, 0 done (just enrolled)
  ('22222222-2222-2222-2222-222222222208', '11111111-1111-1111-1111-111111111108', 6, 0.00, 'active', 78.99, 'SAMPLE-pi_jessica01', NOW() - INTERVAL '3 days', NULL, NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SAMPLE HOUR LOGS
-- Realistic daily entries across past weeks
-- ============================================
INSERT INTO public.hour_logs (id, enrollment_id, user_id, log_date, hours, minutes) VALUES
  -- Marcus (completed 10h over several days)
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', CURRENT_DATE - 40, 3, 0),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', CURRENT_DATE - 38, 2, 30),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', CURRENT_DATE - 35, 2, 0),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', CURRENT_DATE - 33, 2, 30),

  -- Sarah (18.5h across many days)
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', CURRENT_DATE - 28, 4, 0),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', CURRENT_DATE - 25, 3, 30),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', CURRENT_DATE - 22, 4, 0),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', CURRENT_DATE - 18, 3, 0),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', CURRENT_DATE - 14, 4, 0),

  -- James (completed 50h)
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', CURRENT_DATE - 24, 8, 0),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', CURRENT_DATE - 23, 8, 0),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', CURRENT_DATE - 22, 8, 0),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', CURRENT_DATE - 21, 8, 0),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', CURRENT_DATE - 20, 8, 0),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', CURRENT_DATE - 19, 6, 0),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', CURRENT_DATE - 18, 4, 0),

  -- Ashley (3h)
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111104', CURRENT_DATE - 15, 1, 30),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111104', CURRENT_DATE - 12, 1, 30),

  -- David (12h before suspension)
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111105', CURRENT_DATE - 14, 6, 0),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111105', CURRENT_DATE - 13, 6, 0),

  -- Maria (4h, almost done)
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111106', CURRENT_DATE - 8, 2, 0),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222206', '11111111-1111-1111-1111-111111111106', CURRENT_DATE - 5, 2, 0),

  -- Kevin (24h over several days)
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111107', CURRENT_DATE - 6, 8, 0),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111107', CURRENT_DATE - 5, 8, 0),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222207', '11111111-1111-1111-1111-111111111107', CURRENT_DATE - 4, 8, 0),

  -- Jessica (0h, just enrolled)
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222208', '11111111-1111-1111-1111-111111111108', CURRENT_DATE - 2, 0, 0)
ON CONFLICT (enrollment_id, log_date) DO NOTHING;

-- ============================================
-- SAMPLE REFLECTIONS
-- Mix of pending, approved, flagged
-- ============================================
INSERT INTO public.reflections (id, user_id, enrollment_id, article_title, response_text, status, submitted_at) VALUES
  -- Marcus reflections (approved — completed)
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 'Understanding Community Service', 'This article really opened my eyes to how community service impacts not just the people being helped, but the volunteers themselves. I never realized how much personal growth comes from stepping outside your comfort zone. The section about the ripple effect was particularly meaningful — it made me understand that my small contribution can inspire others.', 'approved', NOW() - INTERVAL '38 days'),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 'Accountability and Personal Growth', 'I learned that accountability isn''t about punishment — it''s about taking ownership of your actions and using mistakes as opportunities for growth. The concept of internal vs external accountability was new to me. I want to focus more on building internal accountability in my daily life.', 'approved', NOW() - INTERVAL '35 days'),

  -- Sarah reflections (mix)
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222202', 'Understanding Community Service', 'Community service means giving back without expecting anything in return. I appreciated learning about the different types of service — direct, indirect, advocacy, and research. I think I resonate most with advocacy work because I enjoy spreading awareness about important issues.', 'approved', NOW() - INTERVAL '25 days'),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222202', 'Emotional Regulation Techniques', 'The breathing exercises and grounding techniques described in this article are very practical. I''ve already started using the 4-7-8 breathing method when I feel overwhelmed. The section on recognizing emotional triggers before they escalate was particularly helpful for my situation.', 'pending', NOW() - INTERVAL '14 days'),

  -- James reflections (all approved — completed)
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222203', 'Understanding Community Service', 'As someone who was initially skeptical about online community service, this article changed my perspective. Service isn''t just about physical presence — it''s about the commitment to learning and growth. Understanding the systemic issues communities face helps me become a better citizen.', 'approved', NOW() - INTERVAL '23 days'),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222203', 'Decision-Making and Consequences', 'This was a powerful article for me. The decision matrix framework — weighing short-term satisfaction against long-term consequences — is something I wish I had learned years ago. I''m going to apply this to every major decision going forward. The case studies were very relatable.', 'approved', NOW() - INTERVAL '20 days'),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222203', 'Accountability and Personal Growth', 'The accountability partners concept is something I''ve started implementing. I told my brother about my goals and asked him to hold me accountable. Already, just knowing someone is watching has changed my behavior for the better.', 'approved', NOW() - INTERVAL '18 days'),

  -- Ashley reflection (pending)
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222204', 'Understanding Community Service', 'For my graduation requirement, I chose this program because it fit my schedule as a student. The article taught me that community service is more than just a requirement — it''s a way to connect with your community and understand social issues that affect the people around you.', 'pending', NOW() - INTERVAL '12 days'),

  -- David reflection (flagged — suspended user)
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111105', '22222222-2222-2222-2222-222222222205', 'Understanding Community Service', 'ok fine whatever', 'flagged', NOW() - INTERVAL '13 days'),

  -- Maria reflections
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111106', '22222222-2222-2222-2222-222222222206', 'Understanding Community Service', 'I found this article very informative. The concept of indirect service was new to me. I always thought community service meant physical labor, but it can also mean organizing events, raising awareness, or conducting research. This has broadened my understanding of how I can contribute.', 'approved', NOW() - INTERVAL '7 days'),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111106', '22222222-2222-2222-2222-222222222206', 'Emotional Regulation Techniques', 'The section on cognitive reappraisal was eye-opening. Instead of suppressing emotions, we can reframe how we think about the situation that caused them. I tried this technique yesterday when I was stuck in traffic, and it genuinely helped me stay calm.', 'pending', NOW() - INTERVAL '4 days'),

  -- Kevin reflections
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111107', '22222222-2222-2222-2222-222222222207', 'Understanding Community Service', 'Coming from a background where I didn''t have many role models, learning about community service has shown me a different path. The article mentions that service creates a ripple effect — I want to be part of that ripple for my kids and my neighborhood.', 'approved', NOW() - INTERVAL '5 days'),
  (uuid_generate_v4(), '11111111-1111-1111-1111-111111111107', '22222222-2222-2222-2222-222222222207', 'Accountability and Personal Growth', 'The hardest part of accountability is being honest with yourself. This article challenged me to stop making excuses and start taking real ownership. The journaling exercise at the end was tough but valuable — writing down my mistakes helped me see patterns I want to break.', 'pending', NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE CERTIFICATES (for completed enrollments)
-- ============================================
INSERT INTO public.certificates (id, enrollment_id, user_id, verification_code, issued_at, created_at) VALUES
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'TFOC-SAMPLE01', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
  (uuid_generate_v4(), '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103', 'TFOC-SAMPLE02', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE CONTACT SUBMISSIONS
-- Mix of new, replied, closed
-- ============================================
INSERT INTO public.contact_submissions (id, name, email, message, status, submitted_at) VALUES
  (uuid_generate_v4(), 'Robert Martinez', 'robert.m@email.com', 'Hi, I have a court date coming up in March and need to complete 20 hours of community service before then. Will your certificate be accepted by the Travis County Court in Austin, Texas? My case number is 2024-CR-4521. Thank you.', 'new', NOW() - INTERVAL '2 days'),
  (uuid_generate_v4(), 'Lisa Johnson', 'lisa.j@email.com', 'I completed my hours yesterday but I cannot find the download button for my certificate. My name is Lisa Johnson and my email is lisa.j@email.com. Can you please help me access my certificate? I need it for my probation officer by Friday.', 'replied', NOW() - INTERVAL '5 days'),
  (uuid_generate_v4(), 'Michael Park', 'mpark@email.com', 'Can I use this program for my son''s high school graduation requirement? He needs 40 hours of community service and his school said online programs may be accepted. The school is Lincoln High in Portland, Oregon. Thank you!', 'new', NOW() - INTERVAL '1 day'),
  (uuid_generate_v4(), 'Angela White', 'a.white@email.com', 'I accidentally enrolled in the wrong hour package. I signed up for 10 hours but I actually need 25 hours. Is there a way to upgrade my enrollment? My enrollment confirmation was on Feb 10th.', 'replied', NOW() - INTERVAL '8 days'),
  (uuid_generate_v4(), 'Chris Taylor', 'chris.t@email.com', 'Just wanted to say thank you! I completed my 50 hours last week and my probation officer in Cook County accepted the certificate immediately. The verification code made the process so smooth. Great program!', 'closed', NOW() - INTERVAL '12 days')
ON CONFLICT DO NOTHING;

-- ============================================
-- DONE! Your admin dashboard should now show:
-- • 8 participants in the user directory
-- • 8 enrollments (2 completed, 1 suspended, 5 active)
-- • ~28 hour log entries across dates
-- • ~14 reflections (approved, pending, flagged)
-- • 2 certificates with verification codes
-- • 5 contact messages (new, replied, closed)
-- ============================================
