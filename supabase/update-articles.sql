-- =============================================================
-- Article Content Update & Fixes
-- Run this in the Supabase SQL Editor
-- =============================================================

-- 1) Delete the duplicate "Understanding Community Service" article
DELETE FROM public.reflections WHERE article_id = 'f042e28e-63d5-441e-800f-df1a8ada857d';
DELETE FROM public.articles WHERE id = 'f042e28e-63d5-441e-800f-df1a8ada857d';

-- 2) Set all articles to 1-minute timer for TESTING (change back to 60 for production)
UPDATE public.articles SET estimated_minutes = 1;

-- 3) Update Article 1: Understanding Community Service
UPDATE public.articles SET body = '## What Is Community Service?

Community service refers to voluntary work intended to help people in a particular area. It is a fundamental part of civic engagement and personal growth, providing individuals with the opportunity to contribute positively to their communities while developing important life skills.

## Why Community Service Matters

Community service is not just about fulfilling a requirement — it is about building empathy, responsibility, and connection with those around you. When you engage in service, you step outside your own daily concerns and contribute to something larger than yourself.

### Benefits to the Community

- **Strengthened social bonds**: Service brings people together across different backgrounds and experiences
- **Addressing local needs**: Volunteers help fill gaps in services that communities rely on
- **Creating positive change**: Even small acts of service can ripple outward and inspire others

### Benefits to You

- **Personal growth**: You develop patience, communication skills, and emotional maturity
- **New perspectives**: Working with diverse groups helps you see the world through different eyes
- **Sense of purpose**: Contributing to your community gives your time meaning and direction
- **Professional development**: Service builds leadership, teamwork, and problem-solving skills

## The Foundation of Change Approach

Our program is designed to go beyond simply logging hours. We believe that meaningful service requires understanding, reflection, and genuine engagement. Through our coursework, you will explore the principles behind community service, develop emotional intelligence, and learn how to make a lasting positive impact.

### What You Will Learn

1. **Core principles** of community service and civic responsibility
2. **Emotional regulation** techniques for challenging situations
3. **Ethical decision-making** frameworks for real-world scenarios
4. **Reflective practice** skills to deepen your learning

## Getting Started

As you progress through this program, approach each article and reflection with an open mind. Take the time to genuinely engage with the material — the insights you gain will serve you well beyond the completion of this program.

Remember: the goal is not just to complete hours, but to grow as a person and contribute meaningfully to your community.' WHERE id = '2e6628e2-0db4-42e9-8cc4-f4c046ee64d8';

-- 4) Update Article 2: Emotional Regulation
UPDATE public.articles SET body = '## Understanding Emotional Regulation

Emotional regulation is the ability to manage and respond to your emotional experiences in a healthy, constructive way. It does not mean suppressing your feelings — rather, it means understanding them, accepting them, and choosing how to respond.

## Why Emotional Regulation Matters

Strong emotions are a natural part of life. Anger, frustration, anxiety, and sadness are all normal responses to difficult situations. However, how you handle these emotions determines their impact on your life and relationships.

### The Cost of Poor Regulation

- **Damaged relationships**: Uncontrolled anger or frustration can hurt the people closest to you
- **Poor decision-making**: Acting on impulse often leads to regret
- **Physical health impacts**: Chronic stress and unmanaged emotions affect your body
- **Missed opportunities**: Emotional reactions can prevent you from seeing solutions

## Key Strategies for Emotional Regulation

### 1. Recognize Your Triggers

The first step in managing your emotions is understanding what sets them off. Common triggers include:

- Feeling disrespected or unheard
- Situations that feel unfair or unjust
- Stress from work, school, or financial pressures
- Fatigue, hunger, or physical discomfort

### 2. Practice the Pause

When you feel a strong emotion rising, pause before reacting. This simple act creates space between stimulus and response. Try the 4-7-8 breathing technique:

1. **Breathe in** through your nose for 4 seconds
2. **Hold** your breath for 7 seconds
3. **Exhale slowly** through your mouth for 8 seconds
4. **Repeat** 3-4 times until you feel calmer

### 3. Reframe Your Thinking

Challenge automatic negative thoughts by asking yourself:

- Is this situation as bad as it seems right now?
- Will this matter in a week, a month, or a year?
- Is there another way to interpret what happened?
- What would I advise a friend in this situation?

### 4. Develop Healthy Outlets

Find constructive ways to process difficult emotions:

- **Physical activity**: Exercise is one of the most effective stress relievers
- **Journaling**: Writing about your feelings helps you understand them
- **Creative expression**: Art, music, or other creative activities can channel emotions productively
- **Social support**: Talking to trusted friends or family members

## Applying Emotional Regulation in Service

When engaged in community service, you may encounter challenging situations — working with difficult people, facing systemic problems, or feeling overwhelmed by the needs of others. The emotional regulation skills you develop here will help you:

- Respond with empathy rather than frustration
- Maintain your composure in stressful environments
- Build stronger connections with the people you serve
- Sustain your commitment to service over time

## Reflection Questions

As you think about emotional regulation in your own life, consider:

- What situations tend to trigger strong emotional responses for you?
- What coping strategies do you currently use, and how effective are they?
- How might better emotional regulation improve your relationships and daily life?' WHERE id = '220f0807-74ff-4bd3-a223-6868813fd088';

-- 5) Update Article 3: Social Responsibility and Ethics
UPDATE public.articles SET body = '## What Is Social Responsibility?

Social responsibility is the idea that individuals have an obligation to act in ways that benefit society as a whole. It goes beyond following laws — it is about making choices that consider the well-being of others, your community, and the broader world.

## The Connection Between Ethics and Action

Ethics are the moral principles that guide our behavior. Social responsibility puts those principles into action. When you volunteer, treat others with respect, or stand up against injustice, you are practicing social responsibility.

### Ethical Frameworks

Understanding different ethical perspectives can help you make better decisions:

- **The Golden Rule**: Treat others as you would want to be treated
- **Consequentialism**: Consider the outcomes of your actions — will they create more good than harm?
- **Duty-based ethics**: Some actions are right or wrong regardless of outcomes — honesty, fairness, and respect are always important
- **Virtue ethics**: Focus on developing good character traits like compassion, courage, and integrity

## Your Role in the Community

Every person plays a role in shaping their community. Your daily choices — how you treat strangers, whether you help a neighbor, how you respond to conflict — all contribute to the kind of community you live in.

### Areas of Impact

1. **Environmental stewardship**: Taking care of shared spaces and natural resources
2. **Civic participation**: Voting, attending community meetings, staying informed
3. **Supporting vulnerable populations**: Volunteering with organizations that help those in need
4. **Promoting fairness**: Speaking up when you witness discrimination or injustice
5. **Mentoring others**: Sharing your knowledge and experience to help others grow

## Barriers to Social Responsibility

It is important to acknowledge the challenges that can prevent people from engaging in their communities:

- **Time constraints**: Busy schedules can make volunteering feel impossible
- **Apathy**: Feeling like your individual actions do not matter
- **Distrust**: Negative experiences with institutions or organizations
- **Lack of awareness**: Not knowing where or how to help

### Overcoming These Barriers

The key to overcoming these barriers is starting small and staying consistent. You do not need to change the world overnight. A few hours of service each week, kind words to a stranger, or a helping hand to a neighbor all add up over time.

## Making Ethical Decisions

When faced with a difficult choice, consider this framework:

1. **Identify the problem**: What is the ethical issue at hand?
2. **Gather information**: What facts do you need to make an informed decision?
3. **Consider stakeholders**: Who will be affected by your choice?
4. **Evaluate options**: What are the possible courses of action?
5. **Choose and act**: Select the option that best aligns with your values
6. **Reflect**: After acting, consider what you learned and what you might do differently next time

## The Ripple Effect

One of the most powerful aspects of social responsibility is the ripple effect. When you act with integrity and compassion, you inspire others to do the same. Your community service hours are not just numbers on a log — they represent real impact on real people.

## Moving Forward

As you complete this program, carry the principles of social responsibility with you. Look for opportunities to serve, to lead with empathy, and to make ethical choices in your daily life. The habits you build now will shape the person you become.' WHERE id = 'd176fa94-4322-48da-9023-33499bad7078';

-- 6) Verify the results
SELECT id, title, estimated_minutes, LENGTH(body) as body_length 
FROM public.articles 
ORDER BY course_id, sort_order;
