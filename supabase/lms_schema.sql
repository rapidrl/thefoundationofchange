-- ============================================
-- Phase 4: LMS / Coursework Tables
-- Run this in Supabase SQL Editor
-- ============================================

-- Courses (containers for articles)
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active courses" ON public.courses FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Articles (lessons within courses)
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL DEFAULT 10,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active articles" ON public.articles FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage articles" ON public.articles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Course progress (tracks which articles a user has completed)
CREATE TABLE IF NOT EXISTS public.course_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, enrollment_id, article_id)
);

ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON public.course_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.course_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.course_progress FOR UPDATE USING (auth.uid() = user_id);

-- Reflections (written responses to articles)
CREATE TABLE IF NOT EXISTS public.reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  response_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'flagged')),
  reviewed_by UUID REFERENCES public.profiles(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE(user_id, enrollment_id, article_id)
);

ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reflections" ON public.reflections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reflections" ON public.reflections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all reflections" ON public.reflections FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update reflections" ON public.reflections FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================
-- Seed: Sample course + articles for testing
-- ============================================
INSERT INTO public.courses (title, description, sort_order) VALUES
  ('Personal Accountability', 'Understanding the impact of your actions and taking responsibility for positive change.', 1),
  ('Civic Responsibility', 'Exploring what it means to contribute positively to your community and society.', 2),
  ('Life Skills & Decision Making', 'Practical tools for making better decisions and building healthy habits.', 3);

-- Get course IDs for articles
DO $$
DECLARE
  c1_id UUID;
  c2_id UUID;
  c3_id UUID;
BEGIN
  SELECT id INTO c1_id FROM public.courses WHERE title = 'Personal Accountability';
  SELECT id INTO c2_id FROM public.courses WHERE title = 'Civic Responsibility';
  SELECT id INTO c3_id FROM public.courses WHERE title = 'Life Skills & Decision Making';

  INSERT INTO public.articles (course_id, title, body, estimated_minutes, sort_order) VALUES
    -- Course 1: Personal Accountability
    (c1_id, 'Understanding Accountability', 'Accountability means accepting responsibility for your actions and their consequences. It is a cornerstone of personal growth and social trust.

When we hold ourselves accountable, we acknowledge that our choices have real effects on the people and communities around us. This article explores what accountability means in practice and why it matters for personal development.

**Key Concepts:**
- Self-awareness: Recognizing your role in situations
- Ownership: Accepting responsibility without blame-shifting
- Growth mindset: Viewing mistakes as learning opportunities
- Consistency: Following through on commitments

Accountability is not about punishment — it is about understanding the connection between actions and outcomes. When individuals take ownership of their behavior, they build trust, strengthen relationships, and create positive change in their communities.

**Reflection Prompt:** Think about a time when taking responsibility for a mistake led to a positive outcome. What did you learn from that experience?', 15, 1),

    (c1_id, 'The Ripple Effect of Our Actions', 'Every action we take creates a ripple effect that extends beyond what we can immediately see. A single choice can impact family members, friends, coworkers, and even strangers.

Consider how a moment of road rage might affect not just the other driver, but their passengers, their emotional state for the rest of the day, and the decisions they make as a result. Similarly, a single act of kindness can brighten someone''s entire week.

**The Interconnected Web:**
Our communities function as interconnected webs where each person''s actions influence others. When we understand this interconnection, we begin to see that even small choices matter.

**Breaking Negative Cycles:**
One of the most powerful things we can do is choose to break negative cycles. When faced with conflict or frustration, choosing a constructive response instead of a destructive one can redirect the entire chain of events that follows.

**Building Positive Momentum:**
Just as negative actions ripple outward, so do positive ones. Volunteering, mentoring, or simply showing patience can inspire others to do the same.

**Reflection Prompt:** Describe a situation where you witnessed the ripple effect of someone''s actions — either positive or negative. How did it affect you and others?', 20, 2),

    -- Course 2: Civic Responsibility
    (c2_id, 'What Is Community Service?', 'Community service is the act of contributing your time, skills, or resources to benefit others and strengthen your community. It can take many forms — from volunteering at a food bank to mentoring youth to participating in environmental cleanup efforts.

**Why Community Service Matters:**
- Builds empathy and understanding of diverse perspectives
- Strengthens social bonds and community cohesion
- Develops practical skills and work experience
- Creates tangible positive change in neighborhoods and cities

**The History of Community Service:**
Community service has deep roots in civic tradition. From barn raisings in early America to modern volunteer organizations, the idea that citizens have a responsibility to contribute to their communities has been a central value in democratic societies.

**Types of Community Service:**
1. Direct service: Working directly with people in need
2. Indirect service: Supporting organizations that serve communities
3. Advocacy: Speaking up for policies and changes that benefit communities
4. Education-based service: Learning about issues and teaching others

**Reflection Prompt:** What does community service mean to you personally? How has your understanding of it changed over time?', 15, 1),

    (c2_id, 'Understanding the Justice System', 'The justice system exists to maintain order, protect rights, and ensure fairness in society. Understanding how it works helps us navigate it more effectively and appreciate its role in our communities.

**Key Components:**
- Law enforcement: Maintaining public safety
- Courts: Adjudicating disputes and determining guilt
- Corrections: Rehabilitation and accountability
- Probation/Parole: Supervised community reintegration

**Your Rights and Responsibilities:**
Every person has fundamental rights within the justice system, including the right to due process, legal representation, and fair treatment. Along with these rights come responsibilities — to follow laws, cooperate with legal processes, and work toward positive change.

**Restorative Justice:**
Modern approaches to justice increasingly emphasize restoration over punishment. Restorative justice focuses on repairing harm, rebuilding relationships, and reintegrating individuals into their communities.

**Reflection Prompt:** How has your interaction with the justice system affected your understanding of accountability and community responsibility?', 20, 2),

    -- Course 3: Life Skills
    (c3_id, 'Making Better Decisions', 'Every day, we make hundreds of decisions — some small, some life-changing. The quality of our decisions shapes the trajectory of our lives and impacts those around us.

**The Decision-Making Framework:**
1. **Identify** the decision to be made
2. **Gather** relevant information
3. **Consider** alternatives and consequences
4. **Choose** the best option
5. **Act** on your decision
6. **Reflect** on the outcome

**Common Decision Traps:**
- Impulsivity: Acting without thinking
- Peer pressure: Letting others'' expectations override your judgment
- Emotional reasoning: Making decisions based purely on how you feel in the moment
- Confirmation bias: Only seeking information that supports what you already believe

**Building Decision-Making Skills:**
Like any skill, decision-making improves with practice and reflection. By regularly evaluating our choices and their outcomes, we develop better judgment over time.

**Reflection Prompt:** Think about a decision you made recently that you would handle differently now. What information or perspective would have helped you make a better choice?', 15, 1),

    (c3_id, 'Stress Management and Healthy Coping', 'Stress is a natural response to challenging situations, but chronic or poorly managed stress can lead to serious physical and mental health problems. Learning to manage stress effectively is one of the most important life skills you can develop.

**Understanding Stress:**
Stress activates your body''s fight-or-flight response, releasing hormones like cortisol and adrenaline. While this response can be helpful in genuine emergencies, it becomes harmful when triggered constantly by everyday pressures.

**Healthy Coping Strategies:**
- **Physical activity**: Exercise reduces stress hormones and releases endorphins
- **Mindfulness and meditation**: Calming the mind through focused attention
- **Social connection**: Talking to trusted friends or family
- **Time management**: Reducing stress by organizing and prioritizing
- **Creative expression**: Art, music, writing as emotional outlets
- **Adequate sleep**: Rest is essential for emotional regulation

**Unhealthy Coping Patterns:**
- Substance use
- Avoidance and isolation
- Aggression or lashing out
- Excessive screen time or gaming

**Building Resilience:**
Resilience is the ability to bounce back from adversity. It''s not about avoiding stress, but about developing the tools and mindset to handle it constructively.

**Reflection Prompt:** What healthy coping strategies do you currently use? What new strategy would you like to try, and how would you incorporate it into your daily routine?', 20, 2);
END $$;
