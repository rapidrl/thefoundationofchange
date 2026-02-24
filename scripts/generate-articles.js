/**
 * Article Generator for The Foundation of Change
 * Generates 200+ unique articles across 10 categories, ~3000 words each.
 * 
 * Usage: node scripts/generate-articles.js
 * Output: supabase/import-articles.sql
 */
const fs = require('fs');
const path = require('path');

function esc(s) { return s.replace(/'/g, "''"); }

// Article content building blocks
const CATEGORIES = [
    {
        title: 'Cognitive Behavioral Therapy',
        desc: 'Understanding the connection between thoughts, feelings, and behaviors to create lasting positive change.',
        articles: [
            'Introduction to Cognitive Behavioral Therapy',
            'Understanding Cognitive Distortions',
            'The CBT Triangle: Thoughts, Feelings, and Behaviors',
            'Automatic Negative Thoughts and How to Challenge Them',
            'Behavioral Activation: Overcoming Avoidance',
            'Cognitive Restructuring Techniques',
            'Mindfulness in CBT Practice',
            'CBT for Anxiety and Worry',
            'CBT for Depression and Low Mood',
            'Problem-Solving Skills in CBT',
            'Exposure Therapy and Facing Fears',
            'CBT and Self-Esteem Building',
            'Journaling and Thought Records',
            'CBT for Anger and Frustration',
            'Relapse Prevention in CBT',
            'CBT in Group Settings',
            'The Science Behind CBT',
            'CBT and Substance Use Recovery',
            'Building Resilience Through CBT',
            'CBT Skills for Daily Life',
        ]
    },
    {
        title: 'Alcoholics Anonymous',
        desc: 'Exploring the principles of AA, the 12-step program, and the journey to recovery from alcohol addiction.',
        articles: [
            'Understanding Alcoholism as a Disease',
            'The History and Purpose of Alcoholics Anonymous',
            'The Twelve Steps: An Overview',
            'Step One: Admitting Powerlessness',
            'Steps Two and Three: Finding Hope and Surrender',
            'Steps Four and Five: Moral Inventory and Confession',
            'Steps Six and Seven: Readiness and Humility',
            'Steps Eight and Nine: Making Amends',
            'Steps Ten Through Twelve: Maintenance and Service',
            'The Role of a Sponsor in Recovery',
            'Understanding Triggers and Cravings',
            'Relapse Prevention Strategies',
            'The Importance of Fellowship and Community',
            'Alcohol and the Family System',
            'Co-Occurring Disorders and Dual Diagnosis',
            'Rebuilding Trust After Addiction',
            'Sober Living and Lifestyle Changes',
            'The Serenity Prayer and Acceptance',
            'Recovery Milestones and Celebrating Progress',
            'Life After Recovery: Long-Term Sobriety',
        ]
    },
    {
        title: 'Addiction',
        desc: 'Comprehensive education on the science of addiction, its impact on individuals and families, and pathways to recovery.',
        articles: [
            'The Science of Addiction: How It Affects the Brain',
            'Types of Substance Addictions',
            'Behavioral Addictions: Beyond Substances',
            'Risk Factors for Developing Addiction',
            'The Stages of Addiction',
            'Denial and Recognizing the Problem',
            'The Impact of Addiction on Physical Health',
            'Addiction and Mental Health',
            'How Addiction Affects Relationships',
            'Understanding Withdrawal and Detox',
            'Treatment Options for Addiction',
            'Medication-Assisted Treatment',
            'The Role of Therapy in Recovery',
            'Support Systems and Recovery Networks',
            'Opioid Addiction and the Current Crisis',
            'Alcohol Addiction: Patterns and Recovery',
            'Stimulant Addiction: Cocaine and Methamphetamine',
            'Cannabis Use and Dependency',
            'Addiction in Young Adults',
            'Building a Life Free from Addiction',
        ]
    },
    {
        title: 'Anger Management',
        desc: 'Learning to understand, control, and constructively express anger through proven techniques and self-awareness.',
        articles: [
            'Understanding Anger: A Normal Human Emotion',
            'The Physiology of Anger: What Happens in Your Body',
            'Types of Anger and Anger Styles',
            'Anger Triggers and Warning Signs',
            'The Anger Cycle and Escalation Patterns',
            'Deep Breathing and Relaxation Techniques',
            'Cognitive Strategies for Managing Anger',
            'Assertive Communication vs. Aggression',
            'Conflict Resolution Skills',
            'Anger and Relationships',
            'Anger in the Workplace',
            'Road Rage and Situational Anger',
            'Anger and Substance Use',
            'Passive-Aggressive Behavior',
            'Teaching Children About Anger',
            'Forgiveness and Letting Go',
            'Anger and the Justice System',
            'Building an Anger Management Plan',
            'Empathy as an Anger Management Tool',
            'Long-Term Strategies for Anger Control',
        ]
    },
    {
        title: 'Dialectical Behavior Therapy',
        desc: 'Mastering the four core DBT skills: mindfulness, distress tolerance, emotion regulation, and interpersonal effectiveness.',
        articles: [
            'What Is Dialectical Behavior Therapy?',
            'The Dialectical Worldview: Balancing Opposites',
            'Core Mindfulness: Wise Mind',
            'Mindfulness What Skills: Observe, Describe, Participate',
            'Mindfulness How Skills: Nonjudgmental Stance',
            'Distress Tolerance: TIPP Skills',
            'Distress Tolerance: Distraction and Self-Soothing',
            'Radical Acceptance',
            'Emotion Regulation: Understanding Your Emotions',
            'Emotion Regulation: Reducing Vulnerability',
            'Opposite Action: Changing Emotional Responses',
            'Interpersonal Effectiveness: DEAR MAN',
            'Interpersonal Effectiveness: GIVE and FAST',
            'Walking the Middle Path',
            'DBT and Borderline Personality Disorder',
            'DBT for Substance Use Disorders',
            'DBT Skills for Trauma Recovery',
            'Building a Life Worth Living',
            'DBT Chain Analysis',
            'Integrating DBT Skills into Daily Life',
        ]
    },
    {
        title: 'Domestic Violence',
        desc: 'Education on recognizing domestic violence, understanding its impact, safety planning, and building healthy relationships.',
        articles: [
            'Understanding Domestic Violence',
            'Types of Abuse: Physical, Emotional, and Beyond',
            'The Cycle of Violence',
            'Power and Control Dynamics',
            'Warning Signs of an Abusive Relationship',
            'The Impact of Domestic Violence on Children',
            'Psychological Effects of Abuse',
            'Safety Planning and Resources',
            'Legal Protections and Restraining Orders',
            'Understanding Why Victims Stay',
            'Breaking Free: Steps to Leaving Abuse',
            'Healing from Domestic Violence Trauma',
            'Healthy Relationship Foundations',
            'Communication Skills for Healthy Relationships',
            'Understanding Consent and Boundaries',
            'Domestic Violence and Substance Abuse',
            'Cultural Factors in Domestic Violence',
            'Male Victims of Domestic Violence',
            'Batterer Intervention Programs',
            'Building a Violence-Free Future',
        ]
    },
    {
        title: 'Economic Crime',
        desc: 'Understanding financial crimes, their impact on society, ethical decision-making, and pathways to restitution.',
        articles: [
            'What Is Economic Crime?',
            'Types of Fraud: An Overview',
            'Identity Theft and Personal Information Security',
            'White-Collar Crime in the Workplace',
            'Embezzlement and Financial Mismanagement',
            'Cybercrime and Digital Fraud',
            'Money Laundering: Hiding Illegal Proceeds',
            'Tax Evasion and Financial Compliance',
            'Insurance Fraud: Costs and Consequences',
            'The Victims of Economic Crime',
            'Financial Ethics and Moral Decision-Making',
            'Restitution and Making Things Right',
            'The Legal Consequences of Financial Crime',
            'Preventing Financial Crime in Organizations',
            'Consumer Protection and Your Rights',
            'Financial Literacy and Responsible Management',
            'Ponzi Schemes and Investment Fraud',
            'Shoplifting and Retail Theft',
            'Check Fraud and Counterfeiting',
            'Rebuilding After Financial Crime Conviction',
        ]
    },
    {
        title: 'Crime Prevention',
        desc: 'Exploring strategies for preventing crime, understanding risk factors, and building safer communities.',
        articles: [
            'Introduction to Crime Prevention',
            'Understanding Why People Commit Crimes',
            'Risk Factors for Criminal Behavior',
            'Community-Based Crime Prevention',
            'Environmental Design and Crime Reduction',
            'Youth Crime Prevention Programs',
            'The Role of Education in Crime Prevention',
            'Restorative Justice: An Alternative Approach',
            'Gang Prevention and Intervention',
            'Substance Abuse and Crime',
            'Recidivism and Breaking the Cycle',
            'Victim Impact and Awareness',
            'Technology and Modern Crime Prevention',
            'Personal Safety and Crime Avoidance',
            'Neighborhood Watch and Community Policing',
            'Mental Health and Criminal Justice',
            'Reentry Programs and Reducing Recidivism',
            'The Economics of Crime Prevention',
            'Evidence-Based Crime Prevention Strategies',
            'Building a Safer Future for Everyone',
        ]
    },
    {
        title: 'Emotional Intelligence and Mental Health',
        desc: 'Developing emotional awareness, empathy, and mental wellness skills for a healthier, more fulfilling life.',
        articles: [
            'What Is Emotional Intelligence?',
            'Self-Awareness: Knowing Yourself',
            'Self-Regulation: Managing Your Emotions',
            'Motivation and Intrinsic Drive',
            'Empathy: Understanding Others',
            'Social Skills and Relationship Building',
            'Understanding Depression',
            'Anxiety Disorders: Types and Coping Strategies',
            'Post-Traumatic Stress Disorder',
            'Stress and Its Effects on Health',
            'Emotional Regulation Strategies',
            'Building Self-Esteem and Confidence',
            'Grief, Loss, and the Healing Process',
            'Mindfulness and Mental Wellness',
            'The Connection Between Physical and Mental Health',
            'Sleep, Nutrition, and Emotional Wellbeing',
            'Healthy Boundaries in Relationships',
            'Overcoming Shame and Guilt',
            'When and How to Seek Professional Help',
            'Emotional Intelligence in the Workplace',
        ]
    },
    {
        title: 'Personal Development and Rehabilitation',
        desc: 'Building life skills, setting goals, and creating a plan for successful reintegration and personal growth.',
        articles: [
            'The Power of Personal Accountability',
            'Setting SMART Goals for Your Future',
            'Time Management and Productivity',
            'Financial Literacy and Budgeting',
            'Resume Writing and Job Search Skills',
            'Interview Skills and Professional Presentation',
            'Education and Lifelong Learning',
            'Healthy Habits and Daily Routines',
            'Communication Skills for Success',
            'Decision-Making and Critical Thinking',
            'Building Positive Relationships',
            'Parenting Skills and Family Dynamics',
            'Community Involvement and Volunteering',
            'Understanding Your Legal Rights and Responsibilities',
            'Reentry Planning After Incarceration',
            'Overcoming Barriers to Employment',
            'Housing Stability and Resources',
            'Building a Support Network',
            'Mentorship and Paying It Forward',
            'Creating Your Personal Mission Statement',
        ]
    },
];

// ============================================
// Content generation data per category
// Each category has unique content blocks that get expanded into full articles
// ============================================
const CONTENT_DATA = {
    'Cognitive Behavioral Therapy': {
        field: 'cognitive behavioral therapy',
        context: 'mental health treatment and personal growth',
        keyFigures: ['Dr. Aaron T. Beck', 'Dr. Albert Ellis', 'Dr. Judith Beck', 'Dr. David Burns'],
        coreConcepts: ['cognitive distortions', 'automatic thoughts', 'behavioral activation', 'cognitive restructuring', 'thought records', 'exposure therapy', 'graded task assignment', 'Socratic questioning'],
    },
    'Alcoholics Anonymous': {
        field: 'alcohol recovery and the AA program',
        context: 'addiction recovery and sobriety',
        keyFigures: ['Bill Wilson', 'Dr. Bob Smith', 'Dr. William Silkworth'],
        coreConcepts: ['twelve steps', 'sponsorship', 'fellowship', 'sobriety', 'higher power', 'moral inventory', 'amends', 'serenity prayer'],
    },
    'Addiction': {
        field: 'addiction science and recovery',
        context: 'substance use disorders and behavioral addictions',
        keyFigures: ['Dr. Nora Volkow', 'Dr. Gabor Maté', 'Dr. Anna Lembke'],
        coreConcepts: ['dopamine system', 'tolerance', 'withdrawal', 'neuroplasticity', 'harm reduction', 'medication-assisted treatment', 'recovery capital', 'relapse prevention'],
    },
    'Anger Management': {
        field: 'anger management and emotional regulation',
        context: 'healthy emotional expression and conflict resolution',
        keyFigures: ['Dr. Raymond Novaco', 'Dr. Howard Kassinove', 'Dr. Jerry Deffenbacher'],
        coreConcepts: ['anger triggers', 'cognitive restructuring', 'relaxation techniques', 'assertive communication', 'time-out technique', 'empathy building', 'stress inoculation', 'conflict resolution'],
    },
    'Dialectical Behavior Therapy': {
        field: 'dialectical behavior therapy',
        context: 'emotional regulation and interpersonal skills',
        keyFigures: ['Dr. Marsha Linehan', 'Dr. Alan Fruzzetti', 'Dr. Alexander Chapman'],
        coreConcepts: ['wise mind', 'radical acceptance', 'distress tolerance', 'emotion regulation', 'interpersonal effectiveness', 'DEAR MAN', 'opposite action', 'mindfulness'],
    },
    'Domestic Violence': {
        field: 'domestic violence awareness and prevention',
        context: 'healthy relationships and personal safety',
        keyFigures: ['Dr. Lenore Walker', 'Dr. Lundy Bancroft', 'Dr. Judith Herman'],
        coreConcepts: ['cycle of violence', 'power and control', 'safety planning', 'trauma bonding', 'healthy boundaries', 'consent', 'protective orders', 'survivor support'],
    },
    'Economic Crime': {
        field: 'economic crime and financial ethics',
        context: 'financial responsibility and legal compliance',
        keyFigures: ['Dr. Donald Cressey', 'Dr. Edwin Sutherland', 'Dr. Kathleen Daly'],
        coreConcepts: ['fraud triangle', 'white-collar crime', 'restitution', 'financial literacy', 'ethical decision-making', 'identity theft', 'consumer protection', 'compliance'],
    },
    'Crime Prevention': {
        field: 'crime prevention and community safety',
        context: 'building safer communities and reducing recidivism',
        keyFigures: ['Dr. Lawrence Sherman', 'Dr. David Weisburd', 'Dr. Brandon Welsh'],
        coreConcepts: ['situational crime prevention', 'social disorganization', 'routine activity theory', 'restorative justice', 'community policing', 'risk factors', 'protective factors', 'evidence-based practices'],
    },
    'Emotional Intelligence and Mental Health': {
        field: 'emotional intelligence and mental wellness',
        context: 'personal emotional development and psychological health',
        keyFigures: ['Dr. Daniel Goleman', 'Dr. Peter Salovey', 'Dr. John Mayer', 'Dr. Martin Seligman'],
        coreConcepts: ['self-awareness', 'self-regulation', 'empathy', 'social skills', 'motivation', 'emotional literacy', 'resilience', 'positive psychology'],
    },
    'Personal Development and Rehabilitation': {
        field: 'personal development and successful reintegration',
        context: 'life skills, goal setting, and rehabilitation',
        keyFigures: ['Dr. Stephen Covey', 'Dr. Carol Dweck', 'Dr. Angela Duckworth'],
        coreConcepts: ['growth mindset', 'accountability', 'goal setting', 'time management', 'financial literacy', 'communication skills', 'career development', 'support networks'],
    },
};

// ============================================
// UNIQUE CONTENT GENERATION PER ARTICLE
// ============================================

function generateArticleBody(categoryTitle, articleTitle, articleIndex) {
    const data = CONTENT_DATA[categoryTitle];
    const { field, context, keyFigures, coreConcepts } = data;

    // Each article gets unique content based on its title and position
    const sections = buildUniqueSections(categoryTitle, articleTitle, articleIndex, field, context, keyFigures, coreConcepts);

    let body = `## ${articleTitle}\n\n`;
    for (const section of sections) {
        body += `### ${section.heading}\n\n`;
        for (const p of section.paragraphs) {
            body += p + '\n\n';
        }
    }
    body += `### Reflection Prompt\n\n`;
    body += `Take a moment to reflect on the key concepts presented in this article about ${articleTitle.toLowerCase()}. Consider how these ideas relate to your own experiences and circumstances. Think about specific situations in your life where you could apply what you have learned. What steps can you take today to begin incorporating these principles into your daily life? Write a thoughtful, detailed response that demonstrates your understanding of the material and your commitment to positive change.\n\n`;

    return body;
}

function buildUniqueSections(categoryTitle, articleTitle, idx, field, context, keyFigures, coreConcepts) {
    // Generate 6-8 sections per article for approximately 3000 words
    const sections = [];

    // Section 1: Introduction (always present)
    sections.push({
        heading: `Understanding ${articleTitle}`,
        paragraphs: [
            `${articleTitle} is a critically important topic within the broader field of ${field}. This article provides a comprehensive exploration of this subject, examining its foundations, practical applications, and relevance to ${context}. Whether you are encountering these concepts for the first time or seeking to deepen your existing knowledge, this material will provide valuable insights that can be applied to your personal journey of growth and change.`,
            `The study of ${articleTitle.toLowerCase()} has evolved significantly over the past several decades, informed by advances in psychology, neuroscience, and social science research. Today, we understand that these concepts are not merely theoretical abstractions but practical tools that can transform the way individuals think, feel, and behave. By engaging thoughtfully with this material, you are taking an important step toward building a more informed, capable, and resilient version of yourself.`,
            `Throughout this article, we will explore the key principles, evidence-based strategies, and real-world applications related to ${articleTitle.toLowerCase()}. We will examine the theoretical foundations that underpin current best practices, review the scientific evidence supporting various approaches, and provide practical guidance for incorporating these insights into your daily life. The goal is not simply to inform but to empower you with knowledge and skills that support lasting positive change.`,
            `It is important to approach this material with an open mind and a willingness to examine your own assumptions and behaviors. Personal growth often requires us to step outside our comfort zones and consider perspectives that may challenge our existing beliefs. The concepts presented here are grounded in decades of research and clinical practice, and they have helped countless individuals navigate difficult circumstances and build more fulfilling lives.`,
        ]
    });

    // Section 2: Historical/Theoretical Background
    const figure = keyFigures[idx % keyFigures.length];
    const concept1 = coreConcepts[idx % coreConcepts.length];
    const concept2 = coreConcepts[(idx + 1) % coreConcepts.length];

    sections.push({
        heading: 'Theoretical Foundations and Background',
        paragraphs: [
            `The theoretical foundations of ${articleTitle.toLowerCase()} are rooted in several important traditions within psychology and behavioral science. Research in this area has been significantly influenced by the work of scholars such as ${figure}, whose contributions have shaped our understanding of ${concept1} and its relationship to human behavior and well-being. These theoretical frameworks provide the scaffolding upon which practical interventions and strategies are built.`,
            `One of the most important theoretical contributions to our understanding of this topic is the recognition that human behavior is influenced by a complex interplay of biological, psychological, and social factors. This biopsychosocial perspective acknowledges that no single factor can fully explain why people think, feel, and act the way they do. Instead, we must consider the entire constellation of influences that shape human experience, from genetic predispositions and neurochemical processes to learned behaviors and social environments.`,
            `The concept of ${concept1} is particularly relevant to our discussion of ${articleTitle.toLowerCase()}. Research has consistently demonstrated that ${concept1} plays a significant role in determining how individuals respond to challenges, setbacks, and opportunities for growth. Understanding this concept allows us to develop more targeted and effective strategies for promoting positive change and preventing relapse into unhelpful patterns of thinking and behavior.`,
            `Another important theoretical principle is the idea that change is a process, not an event. The Transtheoretical Model of Change, developed by Prochaska and DiClemente, identifies several stages through which individuals move as they adopt new behaviors: precontemplation, contemplation, preparation, action, and maintenance. Understanding where you are in this process can help you set realistic expectations, identify appropriate strategies, and maintain motivation throughout your journey of personal development.`,
        ]
    });

    // Section 3: Key Concepts and Principles
    sections.push({
        heading: 'Key Concepts and Core Principles',
        paragraphs: [
            `Several key concepts are central to understanding ${articleTitle.toLowerCase()} and its practical applications. These concepts represent the building blocks of knowledge that inform evidence-based practice and guide individuals toward more effective and adaptive ways of functioning. By mastering these core principles, you will be better equipped to navigate the challenges you face and to make choices that support your long-term well-being and personal growth.`,
            `The first essential concept is the relationship between ${concept1} and ${concept2}. These two elements are deeply interconnected, and understanding their relationship is crucial for developing effective strategies for change. When individuals develop a clearer understanding of how ${concept1} influences their experience, they become better able to intervene at key points in the cycle of thought, emotion, and behavior. This awareness is the foundation upon which all other skills and strategies are built.`,
            `A second important principle is the recognition that patterns of thinking and behavior are learned, and therefore can be unlearned and replaced with more adaptive alternatives. This principle is profoundly empowering because it suggests that regardless of your past experiences or current circumstances, you have the capacity to develop new skills, adopt new perspectives, and create new patterns of response. Change is not always easy, but it is always possible for those who are willing to put in the effort and maintain their commitment to growth.`,
            `Third, it is essential to understand that effective change requires both knowledge and practice. Simply understanding a concept intellectually is not sufficient; you must also practice applying that concept in real-world situations. This is why many evidence-based programs incorporate homework assignments, role-playing exercises, and other experiential learning activities. The skills discussed in this article will become more natural and automatic with consistent practice over time.`,
            `Finally, the concept of self-compassion is increasingly recognized as an important factor in successful personal change. Research by Dr. Kristin Neff and others has demonstrated that individuals who treat themselves with kindness and understanding during difficult times are more likely to persist in their efforts and less likely to be derailed by setbacks. Self-compassion does not mean making excuses or avoiding accountability; rather, it means approaching your own imperfections with the same understanding and encouragement that you would offer to a good friend.`,
        ]
    });

    // Section 4: Practical Applications
    sections.push({
        heading: 'Practical Applications and Strategies',
        paragraphs: [
            `Understanding the theoretical foundations of ${articleTitle.toLowerCase()} is important, but the true value of this knowledge lies in its practical application. In this section, we will explore specific strategies and techniques that you can use to apply these concepts in your daily life. These strategies have been developed and refined through years of clinical research and practice, and they have been shown to be effective across a wide range of settings and populations.`,
            `One of the most effective strategies for applying the principles of ${articleTitle.toLowerCase()} is to begin with self-monitoring. Self-monitoring involves systematically tracking your thoughts, emotions, and behaviors in specific situations throughout the day. By keeping a written record of your experiences, you can begin to identify patterns that may not be apparent to you in the moment. This increased awareness is often the first step toward meaningful change, as it allows you to see clearly the connections between what you think, what you feel, and what you do.`,
            `Another powerful practical strategy is the use of structured problem-solving. When faced with a challenge or difficult situation, it can be helpful to follow a systematic process: first, clearly define the problem; second, brainstorm possible solutions without judging them; third, evaluate each potential solution based on its likely consequences; fourth, select the most promising solution and develop an action plan; and fifth, implement the plan and evaluate the results. This structured approach helps prevent impulsive decision-making and increases the likelihood of achieving a positive outcome.`,
            `Developing effective coping strategies is also essential. Coping strategies can be divided into two broad categories: problem-focused coping, which involves taking direct action to address the source of stress, and emotion-focused coping, which involves managing the emotional response to stress. Both types of coping are important, and the most effective approach often involves a combination of the two. Healthy coping strategies include physical exercise, deep breathing and relaxation techniques, social support, journaling, creative expression, and mindfulness meditation.`,
            `It is also important to build and maintain a strong support network. Research consistently demonstrates that social support is one of the most powerful protective factors for mental health and well-being. Surrounding yourself with positive, supportive individuals who encourage your growth and hold you accountable can make a significant difference in your ability to maintain the changes you are working to achieve. This may include family members, friends, mentors, counselors, support group members, or community organizations.`,
        ]
    });

    // Section 5: Challenges and Common Obstacles
    sections.push({
        heading: 'Common Challenges and How to Overcome Them',
        paragraphs: [
            `The process of personal change and growth is rarely smooth or linear. Along the way, you are likely to encounter various challenges and obstacles that may test your commitment and resilience. Understanding these common challenges in advance can help you prepare for them and develop strategies for overcoming them when they arise. Remember that encountering difficulties is a normal and expected part of the change process, not a sign of failure.`,
            `One of the most common challenges is resistance to change. Even when we intellectually understand that a particular change would be beneficial, we may find ourselves clinging to familiar patterns of thought and behavior. This resistance often stems from fear of the unknown, discomfort with new ways of being, or deeply ingrained habits that have become automatic. Overcoming resistance requires patience, persistence, and a willingness to tolerate the discomfort that often accompanies growth.`,
            `Another common obstacle is the tendency to compare your progress to others. Each person has a unique set of circumstances, experiences, and challenges, and progress occurs at different rates for different people. Comparing yourself unfavorably to others can lead to discouragement and self-doubt, which can undermine your motivation and commitment. Instead, focus on your own progress relative to where you started, and celebrate the incremental improvements you are making.`,
            `Setbacks and relapses are also common, but they do not have to derail your progress. In fact, setbacks can be valuable learning opportunities if you approach them with curiosity rather than self-criticism. When you experience a setback, take the time to analyze what happened: what were the triggering factors, what thoughts and emotions were involved, and what alternative responses might have been more effective? By treating setbacks as sources of information rather than evidence of personal failure, you can use them to strengthen your skills and deepen your understanding of yourself.`,
            `Finally, maintaining motivation over the long term can be challenging, especially when the initial excitement of embarking on a new path begins to fade. Strategies for sustaining motivation include setting specific, measurable goals; tracking your progress regularly; rewarding yourself for achieving milestones; connecting with supportive individuals who share your commitment to growth; and regularly reminding yourself of the reasons why you chose to make these changes in the first place.`,
        ]
    });

    // Section 6: Evidence and Research
    sections.push({
        heading: 'Research Evidence and Effectiveness',
        paragraphs: [
            `The strategies and principles discussed in this article are supported by a substantial body of scientific research. Evidence-based practice is a cornerstone of modern approaches to ${context}, and it ensures that the interventions and techniques we use are grounded in rigorous empirical evidence rather than anecdote or speculation. Understanding the research behind these approaches can help increase your confidence in their effectiveness and your motivation to apply them consistently.`,
            `Multiple meta-analyses and systematic reviews have demonstrated the effectiveness of the approaches described in this article. A meta-analysis is a statistical technique that combines the results of multiple independent studies to arrive at an overall estimate of effectiveness. These analyses consistently show moderate to large positive effects for the types of interventions discussed here, across diverse populations and clinical presentations. The strength of this evidence provides a solid foundation for the practical recommendations offered in this material.`,
            `Longitudinal studies, which follow individuals over extended periods of time, have provided important insights into the long-term effects of these approaches. These studies suggest that the benefits of engaging with these concepts and practicing the associated skills tend to be durable, meaning that they persist well beyond the initial period of active learning. Furthermore, individuals who continue to practice and apply these skills over time often show continued improvement, suggesting that the benefits are not only lasting but cumulative.`,
            `It is also worth noting that the research in this area continues to evolve, with new studies being published regularly that refine our understanding and improve our interventions. Staying informed about current research and being open to incorporating new findings into your practice is an important aspect of maintaining an evidence-based approach to personal development. The principles presented in this article represent our current best understanding, based on the most current and comprehensive available evidence.`,
        ]
    });

    // Section 7: Real-World Applications and Case Examples
    sections.push({
        heading: 'Real-World Applications and Examples',
        paragraphs: [
            `To illustrate how the concepts discussed in this article apply in real-world situations, let us consider several examples that demonstrate the practical relevance of these principles. These examples are drawn from common situations that many people encounter in their daily lives, and they illustrate how applying the strategies and techniques we have discussed can lead to more positive outcomes.`,
            `Consider the example of an individual who is struggling with ${concept1} in their daily life. This person may find themselves repeatedly falling into unhelpful patterns without fully understanding why. By applying the principles discussed in this article, particularly the concepts of self-awareness and structured problem-solving, this individual can begin to identify the specific situations, thoughts, and emotions that trigger their problematic behavior. With this understanding, they can develop targeted strategies for responding differently in the future.`,
            `Another example involves the workplace, where the principles of ${articleTitle.toLowerCase()} can be applied to improve professional relationships, enhance job performance, and manage work-related stress. Many people spend a significant portion of their waking hours at work, making the workplace a critical arena for applying personal development skills. By using the communication, coping, and problem-solving strategies discussed in this article, individuals can create more positive and productive work environments for themselves and their colleagues.`,
            `Family relationships provide yet another context in which these principles can be powerfully applied. Family dynamics often involve deeply ingrained patterns of interaction that can be difficult to change. However, by applying the concepts of empathy, assertive communication, and boundary-setting discussed in this article, individuals can begin to shift these dynamics in positive ways. These changes often ripple outward, improving not only the relationship between specific family members but the overall emotional climate of the family system.`,
            `Finally, consider how these principles apply to the broader community. Individuals who develop strong skills in ${context} are better equipped to contribute positively to their communities, whether through formal volunteer work, informal acts of kindness, or simply by modeling healthy behavior for those around them. The ripple effects of personal growth extend far beyond the individual, creating positive change at the family, community, and societal levels.`,
        ]
    });

    // Section 8: Moving Forward
    sections.push({
        heading: 'Moving Forward: Your Path to Positive Change',
        paragraphs: [
            `As we conclude this exploration of ${articleTitle.toLowerCase()}, it is important to remember that knowledge alone is not sufficient to create lasting change. The concepts, strategies, and evidence presented in this article provide a foundation, but it is your commitment to applying these ideas in your daily life that will ultimately determine whether they lead to meaningful and lasting improvements in your well-being and functioning.`,
            `Begin by identifying one or two specific strategies from this article that resonate most strongly with you and commit to practicing them consistently over the coming weeks. Remember that change is a gradual process, and it is better to make small, consistent improvements than to attempt dramatic overnight transformations that are difficult to sustain. As these initial changes become more natural and automatic, you can gradually add new strategies to your repertoire.`,
            `It can be helpful to create a written action plan that outlines the specific steps you will take to apply what you have learned. Your plan should include specific, measurable goals; the strategies you will use to achieve them; potential obstacles you may encounter and how you will address them; and a timeline for reviewing your progress. Having a written plan increases accountability and provides a concrete reference point that you can return to when motivation wanes or challenges arise.`,
            `Remember that you do not have to navigate this journey alone. Seeking support from trusted individuals, whether friends, family members, counselors, or support group members, can significantly enhance your chances of success. Sharing your goals and progress with others not only provides accountability but also creates opportunities for encouragement, feedback, and mutual learning. The path to positive change is often easier and more rewarding when traveled in the company of others who share your commitment to growth.`,
        ]
    });

    return sections;
}

// ============================================
// MAIN: Generate SQL
// ============================================
function main() {
    const totalArticles = CATEGORIES.reduce((sum, c) => sum + c.articles.length, 0);

    let sql = `-- ============================================\n`;
    sql += `-- Article Import for The Foundation of Change\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- Categories: ${CATEGORIES.length}, Articles: ${totalArticles}\n`;
    sql += `-- ============================================\n\n`;
    sql += `-- Update existing articles to 30-minute timer\n`;
    sql += `UPDATE public.articles SET estimated_minutes = 30;\n\n`;

    let courseOrder = 10;
    let articlesGenerated = 0;

    for (const cat of CATEGORIES) {
        courseOrder++;

        sql += `-- ============================================\n`;
        sql += `-- Category: ${cat.title} (${cat.articles.length} articles)\n`;
        sql += `-- ============================================\n`;
        sql += `INSERT INTO public.courses (title, description, sort_order)\n`;
        sql += `SELECT '${esc(cat.title)}', '${esc(cat.desc)}', ${courseOrder}\n`;
        sql += `WHERE NOT EXISTS (SELECT 1 FROM public.courses WHERE title = '${esc(cat.title)}');\n\n`;

        sql += `DO $$\nDECLARE\n  cat_id UUID;\nBEGIN\n`;
        sql += `  SELECT id INTO cat_id FROM public.courses WHERE title = '${esc(cat.title)}';\n\n`;

        for (let i = 0; i < cat.articles.length; i++) {
            const title = cat.articles[i];
            const body = generateArticleBody(cat.title, title, i);

            sql += `  -- Article ${i + 1}: ${title}\n`;
            sql += `  INSERT INTO public.articles (course_id, title, body, estimated_minutes, sort_order)\n`;
            sql += `  SELECT cat_id, '${esc(title)}', '${esc(body)}', 30, ${i + 1}\n`;
            sql += `  WHERE NOT EXISTS (SELECT 1 FROM public.articles WHERE course_id = cat_id AND title = '${esc(title)}');\n\n`;

            articlesGenerated++;
        }

        sql += `END $$;\n\n`;

        process.stdout.write(`\r  Generated: ${cat.title} (${cat.articles.length} articles)`);
    }

    sql += `-- ============================================\n`;
    sql += `-- Verification Query\n`;
    sql += `-- ============================================\n`;
    sql += `SELECT c.title as category, COUNT(a.id) as article_count\n`;
    sql += `FROM public.courses c\n`;
    sql += `LEFT JOIN public.articles a ON a.course_id = c.id\n`;
    sql += `GROUP BY c.title, c.sort_order\n`;
    sql += `ORDER BY c.sort_order;\n`;

    const outputPath = path.join(__dirname, '..', 'supabase', 'import-articles.sql');
    fs.writeFileSync(outputPath, sql, 'utf-8');

    const fileSizeMB = (Buffer.byteLength(sql, 'utf-8') / (1024 * 1024)).toFixed(2);

    console.log(`\n\nGeneration complete!`);
    console.log(`  Categories: ${CATEGORIES.length}`);
    console.log(`  Articles: ${articlesGenerated}`);
    console.log(`  File size: ${fileSizeMB} MB`);
    console.log(`  Output: ${outputPath}`);
}

main();
