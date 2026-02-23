-- ============================================
-- The Foundation of Change — CLEANUP SAMPLE DATA
-- Run this to remove ALL sample data at once
-- ============================================

-- Delete in reverse dependency order

-- Certificates (references enrollments + profiles)
DELETE FROM public.certificates
WHERE user_id IN (
  SELECT id FROM public.profiles WHERE id LIKE '11111111-1111-1111-1111-1111111111%'
);

-- Reflections
DELETE FROM public.reflections
WHERE user_id IN (
  SELECT id FROM public.profiles WHERE id LIKE '11111111-1111-1111-1111-1111111111%'
);

-- Article progress
DELETE FROM public.article_progress
WHERE user_id IN (
  SELECT id FROM public.profiles WHERE id LIKE '11111111-1111-1111-1111-1111111111%'
);

-- Hour logs
DELETE FROM public.hour_logs
WHERE user_id IN (
  SELECT id FROM public.profiles WHERE id LIKE '11111111-1111-1111-1111-1111111111%'
);

-- Enrollments
DELETE FROM public.enrollments
WHERE user_id IN (
  SELECT id FROM public.profiles WHERE id LIKE '11111111-1111-1111-1111-1111111111%'
);

-- Profiles
DELETE FROM public.profiles
WHERE id LIKE '11111111-1111-1111-1111-1111111111%';

-- Auth users
DELETE FROM auth.users
WHERE id LIKE '11111111-1111-1111-1111-1111111111%';

-- Contact submissions (sample ones)
DELETE FROM public.contact_submissions
WHERE email IN ('robert.m@email.com', 'lisa.j@email.com', 'mpark@email.com', 'a.white@email.com', 'chris.t@email.com');

-- Verify cleanup
SELECT 'Profiles remaining:' AS check, COUNT(*) FROM public.profiles WHERE id LIKE '11111111%'
UNION ALL
SELECT 'Enrollments remaining:', COUNT(*) FROM public.enrollments WHERE id LIKE '22222222%'
UNION ALL
SELECT 'Sample contacts remaining:', COUNT(*) FROM public.contact_submissions WHERE email LIKE '%@email.com';
