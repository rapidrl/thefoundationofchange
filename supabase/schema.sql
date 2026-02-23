-- ============================================
-- The Foundation of Change — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- Extends Supabase auth.users with app-specific fields
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  probation_officer TEXT,
  reason_for_service TEXT,
  court_id TEXT,
  role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'admin')),
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies: users can read/update their own profile, admins can read all
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- ENROLLMENTS TABLE
-- Tracks program purchases/enrollments
-- ============================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hours_required INTEGER NOT NULL,
  hours_completed NUMERIC(6,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'suspended')),
  amount_paid NUMERIC(8,2),
  stripe_payment_id TEXT,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments"
  ON public.enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments"
  ON public.enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- HOUR LOGS TABLE
-- Daily time tracking entries
-- ============================================
CREATE TABLE IF NOT EXISTS public.hour_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  hours NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (hours >= 0 AND hours <= 8),
  minutes INTEGER NOT NULL DEFAULT 0 CHECK (minutes >= 0 AND minutes < 60),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Enforce max 8 hours per day per enrollment
  UNIQUE(enrollment_id, log_date)
);

ALTER TABLE public.hour_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hour logs"
  ON public.hour_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hour logs"
  ON public.hour_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hour logs"
  ON public.hour_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all hour logs"
  ON public.hour_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- REFLECTIONS TABLE
-- Feedback responses after each article
-- ============================================
CREATE TABLE IF NOT EXISTS public.reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  article_title TEXT NOT NULL,
  response_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'flagged')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reflections"
  ON public.reflections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections"
  ON public.reflections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all reflections"
  ON public.reflections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- CERTIFICATES TABLE
-- Issued upon completion
-- ============================================
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  verification_code TEXT NOT NULL UNIQUE,
  certificate_url TEXT,
  hour_log_url TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id);

-- Public verification lookup (no auth required)
CREATE POLICY "Anyone can verify certificates"
  ON public.certificates FOR SELECT
  USING (true);

CREATE POLICY "Admins can view all certificates"
  ON public.certificates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- FUNCTION: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, email, address, city, state, zip_code,
    gender, date_of_birth, probation_officer, reason_for_service
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'state',
    NEW.raw_user_meta_data->>'zip_code',
    NEW.raw_user_meta_data->>'gender',
    (NEW.raw_user_meta_data->>'date_of_birth')::DATE,
    NEW.raw_user_meta_data->>'probation_officer',
    NEW.raw_user_meta_data->>'reason_for_service'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: run on every new signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTION: Update timestamp on row change
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER enrollments_updated_at
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- CONTACT SUBMISSIONS TABLE
-- Stores contact form inquiries
-- ============================================
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'replied', 'closed')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No RLS needed — inserts are done via API route, reads are admin-only
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all contact submissions"
  ON public.contact_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow anonymous inserts via service role (API route handles validation)
CREATE POLICY "Anyone can submit contact form"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

-- ============================================
-- COURSES TABLE
-- Groups of articles
-- ============================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view courses"
  ON public.courses FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- ARTICLES TABLE
-- Individual learning content pieces
-- ============================================
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  estimated_minutes INTEGER NOT NULL DEFAULT 60,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view articles"
  ON public.articles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================
-- ARTICLE PROGRESS TABLE
-- Tracks per-article completion for each user
-- ============================================
CREATE TABLE IF NOT EXISTS public.article_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'reading', 'reflecting', 'completed')),
  seconds_spent INTEGER NOT NULL DEFAULT 0,
  last_saved_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(enrollment_id, article_id)
);

ALTER TABLE public.article_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own article progress"
  ON public.article_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own article progress"
  ON public.article_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own article progress"
  ON public.article_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all article progress"
  ON public.article_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SEED: Sample Course + Articles
-- ============================================
INSERT INTO public.courses (id, title, description, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Community Service Foundations', 'Learn about the importance and impact of community service.', 1);

INSERT INTO public.articles (id, course_id, title, body, estimated_minutes, sort_order) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'Understanding Community Service',
   'Community service is a voluntary activity where individuals dedicate their time and skills to help others in their community without financial compensation. It plays a vital role in strengthening communities, building empathy, and creating lasting positive change.

## Why Community Service Matters

Community service benefits both the individuals who participate and the communities they serve. For participants, it offers opportunities to develop new skills, build character, and gain a deeper understanding of the challenges faced by others. For communities, it provides essential support and resources that might otherwise be unavailable.

### Personal Growth Through Service

When you engage in community service, you step outside your comfort zone and encounter perspectives different from your own. This experience fosters empathy, resilience, and a sense of social responsibility. Many participants report feeling a greater sense of purpose and fulfillment after completing their service hours.

### The Ripple Effect

Every act of service creates a ripple effect. When you help one person, they are more likely to help someone else. This chain reaction of kindness and support strengthens the entire community fabric. Your contribution, no matter how small it may seem, has the power to inspire others and create lasting change.

## Types of Community Service

Community service can take many forms, including:

- **Direct Service**: Working directly with people in need, such as mentoring youth, serving meals at a shelter, or tutoring students.
- **Indirect Service**: Supporting organizations that serve the community, such as organizing a food drive, fundraising, or helping with administrative tasks.
- **Advocacy**: Raising awareness about important issues, campaigning for policy changes, or educating others about social challenges.
- **Research and Education**: Studying community needs, creating educational materials, or developing programs to address specific issues.

## Getting Started

The Foundation of Change provides structured community service opportunities that are designed to be meaningful, educational, and impactful. Through our program, you will engage with carefully curated content that helps you understand the importance of giving back and develops your commitment to making a positive difference.',
   60, 1),

  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'The Impact of Volunteerism on Society',
   'Volunteerism is a cornerstone of healthy, thriving societies. When individuals volunteer their time and talents, they contribute to a cycle of positive change that benefits everyone. This article explores the far-reaching impacts of volunteerism on communities, economies, and individual well-being.

## Economic Impact

Volunteers contribute billions of dollars worth of labor annually. According to research, the economic value of volunteer time in the United States alone exceeds $180 billion per year. This contribution supports nonprofit organizations, government agencies, and community programs that might otherwise struggle to operate.

### Supporting Nonprofits

Many nonprofit organizations rely heavily on volunteers to deliver their services. Without volunteer support, many of these organizations would be unable to fulfill their missions. By volunteering, you directly contribute to the sustainability of these vital community resources.

## Social Impact

### Building Stronger Communities

Volunteerism strengthens social bonds and fosters a sense of belonging. When people come together to work toward a common goal, they build relationships and trust that extend far beyond the volunteer experience. These connections create more resilient communities that are better equipped to handle challenges.

### Reducing Inequality

Volunteer programs often target underserved populations and work to address systemic inequalities. By participating in these programs, volunteers help bridge gaps in education, healthcare, and social services. This work is essential for creating a more equitable society.

## Health and Well-Being Benefits

Research consistently shows that volunteering has positive effects on mental and physical health. Volunteers report lower rates of depression, higher life satisfaction, and even longer life expectancy. The act of helping others releases endorphins and creates a "helper''s high" that contributes to overall well-being.

### Mental Health Benefits

- Reduced symptoms of depression and anxiety
- Increased sense of purpose and meaning
- Improved self-esteem and confidence
- Greater social connection and reduced isolation

### Physical Health Benefits

- Lower blood pressure
- Reduced risk of cardiovascular disease
- Increased physical activity (for hands-on volunteer work)
- Better overall health outcomes

## The Role of Education in Volunteerism

Education plays a crucial role in fostering a culture of volunteerism. By learning about the impact of service, individuals are more motivated to participate and more effective in their contributions. Educational programs, like those offered by The Foundation of Change, help participants understand the broader context of their service and develop skills that enhance their effectiveness.',
   60, 2),

  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'Building Empathy and Understanding',
   'Empathy—the ability to understand and share the feelings of another person—is a fundamental human quality that strengthens our connections and makes our communities more compassionate. Through community service and engagement with diverse perspectives, we can develop and deepen our capacity for empathy.

## What Is Empathy?

Empathy goes beyond sympathy. While sympathy involves feeling pity or sorrow for someone else''s situation, empathy involves truly understanding their experience from their perspective. It requires active listening, open-mindedness, and a willingness to set aside our own assumptions.

### Types of Empathy

- **Cognitive Empathy**: Understanding another person''s thoughts and perspective
- **Emotional Empathy**: Feeling what another person feels
- **Compassionate Empathy**: Being moved to help based on understanding and shared feeling

## Why Empathy Matters in Community Service

When we approach community service with empathy, our contributions become more meaningful and effective. We are better able to understand the real needs of those we serve, and we can provide support that is genuinely helpful rather than based on our assumptions about what others need.

### Breaking Down Barriers

Empathy helps us overcome prejudice and bias. When we take the time to understand others'' experiences, we challenge our preconceptions and develop a more nuanced understanding of the world. This is especially important in community service, where we often work with people whose backgrounds and circumstances differ from our own.

## Developing Empathy Through Service

Community service provides unique opportunities to develop empathy:

1. **Direct Interaction**: Working directly with community members allows you to hear their stories and understand their challenges firsthand.
2. **Stepping Outside Your Comfort Zone**: Engaging in unfamiliar situations builds flexibility and openness to new perspectives.
3. **Reflection**: Taking time to reflect on your experiences deepens your understanding and helps you process what you have learned.
4. **Collaborative Work**: Working alongside others toward a common goal builds connections and mutual understanding.

## The Science of Empathy

Neuroscience research has shown that empathy is not just a personality trait—it is a skill that can be developed and strengthened through practice. When we engage in empathetic behaviors, we activate mirror neurons in our brains that help us understand and share others'' emotions.

### Building Your Empathy Practice

- **Listen actively**: Focus fully on what others are saying without planning your response.
- **Ask open-ended questions**: Show genuine curiosity about others'' experiences.
- **Practice perspective-taking**: Try to see situations from others'' points of view.
- **Reflect on your experiences**: Write about what you learned and how it changed your perspective.
- **Challenge your assumptions**: Be willing to reconsider your beliefs when presented with new information.',
   60, 3),

  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
   'Responsibility and Accountability',
   'Taking responsibility for our actions and being accountable to our communities are essential qualities that community service helps develop. These traits not only make us better volunteers but also strengthen our personal relationships and professional lives.

## Understanding Responsibility

Responsibility means acknowledging our role in the outcomes of our actions and decisions. It involves recognizing that our choices affect not only ourselves but also the people around us and our broader community.

### Personal Responsibility

Personal responsibility starts with self-awareness. It means:

- **Owning your actions**: Accepting the consequences of your decisions, both positive and negative
- **Following through on commitments**: Doing what you said you would do, when you said you would do it
- **Being proactive**: Taking initiative rather than waiting for problems to escalate
- **Continuous improvement**: Learning from mistakes and actively working to do better

### Social Responsibility

Social responsibility extends beyond personal accountability to encompass our obligations to our communities and society as a whole. It recognizes that we are all interconnected and that our actions have ripple effects that extend far beyond our immediate circle.

## The Role of Accountability

Accountability is closely related to responsibility but focuses on being answerable for our actions. It involves transparency, honesty, and a willingness to accept feedback and correction.

### Why Accountability Matters

- **Builds trust**: When people know they can count on you, relationships grow stronger
- **Improves performance**: Being accountable motivates us to do our best work
- **Creates positive culture**: Accountability in organizations and communities leads to better outcomes for everyone
- **Promotes fairness**: When everyone is held to the same standards, the system works better for all

## Developing These Qualities Through Service

Community service provides a structured environment for developing responsibility and accountability:

1. **Commitment to service hours**: Meeting your required hours teaches time management and follow-through
2. **Quality of engagement**: Being fully present and contributing meaningfully during your service develops conscientiousness
3. **Reflecting on your experience**: Thoughtful reflection helps you understand how your actions make a difference
4. **Setting and meeting goals**: Working toward completion of your service program builds goal-setting skills

## Moving Forward

As you progress through your community service program, consider how the qualities of responsibility and accountability show up in your daily life. Look for opportunities to practice these qualities not just in your service work, but in your relationships, career, and community involvement.',
   60, 4),

  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
   'Making a Lasting Difference',
   'The ultimate goal of community service is to create positive, lasting change. While individual acts of service are valuable on their own, their true power lies in the cumulative effect they have on communities and individuals over time. This article explores how you can maximize the impact of your service and carry the lessons you have learned into your daily life.

## Beyond the Hours

Community service is not just about logging hours—it is about making a genuine difference. The most impactful service comes from a place of genuine care and commitment to the well-being of others. As you complete your service program, consider how the skills and perspectives you have gained can continue to benefit your community long after your required hours are complete.

### Sustainable Impact

Creating lasting change requires:

- **Consistency**: Regular, sustained effort is more effective than sporadic bursts of activity
- **Community engagement**: Working with community members rather than for them ensures that your efforts address real needs
- **Skill building**: Developing new skills through service makes you more effective in future contributions
- **Mentoring**: Sharing your experience and knowledge with others multiplies your impact

## Carrying Service Forward

### Making Service a Habit

Research shows that it takes approximately 66 days to form a new habit. By the time you complete your community service program, you will have developed habits of reflection, empathy, and active contribution that can become a permanent part of your life.

### Identifying Ongoing Opportunities

Your community service experience makes you uniquely qualified to continue contributing in meaningful ways. Look for:

- **Local volunteer organizations**: Many communities have volunteer centers that match volunteers with opportunities
- **Professional volunteering**: Use your professional skills to support nonprofit organizations
- **Mentoring programs**: Share your experience with others who are beginning their service journey
- **Community leadership**: Take on leadership roles in community organizations or initiatives

## Reflecting on Your Journey

As you near the completion of your service program, take time to reflect on the full arc of your experience:

1. **What have you learned?** Consider the knowledge and perspectives you have gained
2. **How have you changed?** Think about how your attitudes and behaviors have evolved
3. **What impact have you made?** Acknowledge the positive contributions you have made to your community
4. **What will you carry forward?** Identify the habits and values you will continue to practice

## The Foundation of Change Promise

The Foundation of Change is committed to supporting your journey of growth and service. Our program is designed not just to fulfill service requirements, but to inspire a genuine commitment to making the world a better place. Every hour you invest in this program is an investment in yourself and your community.

### Your Certificate of Completion

Upon completing your service hours and reflections, you will receive an official Certificate of Completion that:

- Verifies your hours of community service
- Is accepted by courts, probation officers, schools, and employers nationwide
- Can be verified online through our Certificate Verification Portal
- Represents your commitment to personal growth and community service

Thank you for choosing The Foundation of Change. Your dedication to service makes a difference.',
   60, 5);
