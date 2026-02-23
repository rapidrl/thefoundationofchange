-- Restore article timers to 60 minutes (production value)
UPDATE public.articles SET estimated_minutes = 60;

-- Verify
SELECT id, title, estimated_minutes FROM public.articles ORDER BY course_id, sort_order;
