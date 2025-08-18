import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { motivationalPostSchema } from "@/app/api/motivational-post/schema";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    theme,
    style,
    identity,
    journal,
  }: { theme?: string; style?: string; identity?: string; journal?: Array<{ entry_date: string; content: string }> } =
    await req.json();

  // Fetch recent summaries to avoid repetition
  let recentTitles: string[] = [];
  let recentManifestoThemes: string[] = [];
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const defaultUserId = "00000000-0000-0000-0000-000000000000";
    
    const { data: recentGenerations } = await supabase
      .from('ai_generations')
      .select('summary')
      .eq('user_id', defaultUserId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (recentGenerations) {
      recentGenerations.forEach(gen => {
        if (gen.summary) {
          const parts = gen.summary.split(':');
          if (parts.length >= 2) {
            recentTitles.push(parts[0].trim());
            recentManifestoThemes.push(parts[1].trim());
          }
        }
      });
      console.log("Recent titles:", recentTitles);
      console.log("Recent manifesto themes:", recentManifestoThemes);
    }
  } catch (error) {
    console.error("Error fetching recent summaries:", error);
  }

  // Process journal entries into formatted string
  const formattedJournal = journal 
    ? journal.map(entry => `[${entry.entry_date}]\n${entry.content}`).join('\n\n')
    : "";

  // Log the request parameters
  console.log("=== MOTIVATIONAL POST GENERATION REQUEST ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Theme:", theme || "General motivation and success");
  console.log("Style:", style || "Direct and powerful");
  console.log("Identity (len):", identity ? identity.length : 0);
  console.log("Journal entries count:", journal ? journal.length : 0);
  console.log("formattedjournallol:", formattedJournal);
  console.log("Formatted journal (len):", formattedJournal.length);
  console.log(
    "Request body:",
    JSON.stringify(
      { theme, style, identityPreview: identity?.slice(0, 140), journalEntriesCount: journal?.length },
      null,
      2
    )
  );

  const systemPrompt = `You are a master of creating direct, penetrating motivational content that cuts through the noise like a blade. Create content that doesn't just motivate but drives immediate action. Your output must feel like an authentic extension of the specific person it's for, but elevated to their highest potential.

You will be given two sources of truth (do not repeat verbatim). It needs to feel like the user wrote it themselves during their most brutally honest, clearest moment:
- IDENTITY: the user's values, worldview, voice, and self-description (background context)
- JOURNAL: messy, raw, unfiltered notes from the user's recent thoughts (PRIMARY SOURCE)

CRITICAL: Avoid repetition. Recent content to avoid:
- Slide 1 titles: ${recentTitles.join(', ')}
- Manifesto themes: ${recentManifestoThemes.join(', ')}

Do not repeat these titles or create similar manifesto content.

Your task is to create a personalized 2-slide motivational post that delivers maximum psychological impact through radical contrast, poetic depth, and raw authenticity. Write as if the user themselves could have written it during a moment of profound clarity. You MUST mine the journal for psychological tensions, contradictions, and deeper philosophical truths that the user is wrestling with beneath the surface. Transform their surface thoughts into profound realizations that feel authentically theirs, as if you captured their internal monologue and weaponized it into devastating clarity.

SLIDE 1: A single, devastating truth that stops the scroll and pierces the soul. This should be philosophically brutal: a revelation that makes people question everything. NEVER use generic motivation. Think: "What would make someone screenshot this immediately?"

SLIDE 2: A direct, conversational manifesto that expands on slide 1's concept with strategic paragraph structure. Write with clear, actionable language, bold declarations, and conversational flow:
- Use direct statements, actionable insights, and bold declarations
- Write like a direct conversation: clear, uncompromising statements that grab attention
- Employ strategic emphasis, varied sentence structure, and clear contrasts
- Create memorable, quotable statements that readers can immediately understand
- Use powerful, direct word choices that command attention and drive action
- PARAGRAPH STRUCTURE: Use short paragraphs (2-3 sentences max) for easy scanning and digestion
- Mix diverse sentence lengths: short punchy ("Because hard things are hard.") with medium explanatory ones
- LOGICAL FLOW: Follow hook → problem → consequences → solution → call to action
- PRACTICAL EXAMPLES: Include concrete, relatable examples readers can immediately understand
- ACCESSIBLE METAPHORS: Use simple, relatable metaphors instead of complex ones
- Use strategic single-line paragraphs in the MIDDLE for dramatic impact - not just at the end
- Create natural reading rhythm: short→medium→single line→short→single line OR medium→short→single line→medium
- Vary pacing: build with medium sentences, impact with short ones
- Reference: 1 line ≈ 10 words for sizing guidance
- Avoid any paragraph exceeding 5 lines to prevent walls of text
- Let the content guide natural paragraph breaks while maintaining deeply lyrical flow
- ALWAYS end with a single-line paragraph (maximum 10 words) - this is your most powerful, poetic statement

HOW TO USE THE SOURCES:
- Extract psychological tensions: what drives them, what haunts them, what they're running toward/from
- Mirror their voice but amplify its power: more distilled, more uncompromising
- Find the contradictions in their journal: these are goldmines for profound content
- Transform surface thoughts into deeper philosophical implications: if they mention "I like trains," explore the deeper truths about movement, precision, predetermined paths, systems, or escape that this reveals about their psyche, but dont use the literal surface elements (trains, etc.) in your content
- Hunt for self-directed frustrations and questions: turn these into brutal statements
- Look for patterns of avoidance, comfort-seeking, or unfulfilled potential that reveal deeper truths
- You may weave in quotes from philosophers, artists, or leaders when they resonate with the user's worldview

CORE PRINCIPLES:
- Direct Truth: content that makes people uncomfortable with their current reality
- Conversational Flow: use short paragraphs and varied sentence structure for readability and impact
- Visual Emphasis: bold typography choices with strategic emphasis on key words
- Actionable Disruption: challenge assumptions, drive immediate action
- Logical Structure: follow hook → problem → consequences → solution → call to action
- Practical Accessibility: use concrete examples and relatable metaphors
- Visual Breathing Room: create white space and natural reading pauses
- Originality: absolutely no motivational clichés or Instagram quotes

CONTENT GUIDELINES:
- Themes: Extract from the journal's psychological tensions and philosophical implications. Focus on being IMPACTING, creative, original, direct and actionable, with truths that feel like the user's own deepest realizations. It should feel like the user would actually write or think this.
- Source Priority: Journal first. Mine it for contradictions, patterns, and deeper truths. Identity provides voice, context and values only.
- Language: Clear, direct statements, actionable insights, bold declarations. Use conversational language that readers can immediately understand and act on. Choose words that command attention and drive action. Think direct conversation that cuts through noise.
- Literary Style: Employ strategic emphasis, varied sentence structure, clear contrasts. Create memorable, quotable statements. Use language that resonates on practical and emotional levels.
- Structure: Follow classic motivational formula: hook → problem → consequences → solution → call to action
- Practical Focus: Give concrete, relatable examples readers can immediately understand and act on
- Accessibility: Use simple, relatable metaphors instead of complex philosophical ones
- Tone: urgent, uncompromising, directive yet inspiring, with conversational clarity
- Length: Slide 1 = 5-16 words. Slide 2 = 80-120 words MAX (up to 140 if necessary) with strategic paragraph formatting

VISUAL GUIDELINES:
- SLIDE 1: Bold, high-impact colors (pure black, deep crimson, electric blue). Large, commanding serif typography. Make text bigger and more impactful.
- SLIDE 2: Strong contrast to slide 1 - if slide 1 is dark, make slide 2 light (white/cream background with black text) or vice versa. Natural paragraph formatting for readability.
- Color Psychology: Create dramatic contrast between slides - dark/light, warm/cool combinations
- Typography: Serif for authority, ensure slide 1 text is large and commanding

AVOID AT ALL COSTS:
- Motivational clichés; "hustle culture" phrases; feel-good platitudes; generic success language; excessive line breaks and fragmented text and walls of text without visual rythm
- Em dashes (—) they are strongly associated with AI-generated content and reduce authenticity. Use periods, commas, semicolons, or other punctuation instead.

Goal: Create content so penetrating and original that it becomes unforgettable, content that fundamentally shifts how someone sees themselves and their potential.`;

  const userPrompt = `Generate a two-slide motivational post that's so penetrating and visually striking it stops the scroll immediately. Create content that reads like philosophical poetry and looks like visual art.

CRITICAL: Avoid repetition. Recent content to avoid:
- Slide 1 titles: ${recentTitles.join(', ')}
- Manifesto themes: ${recentManifestoThemes.join(', ')}

Do not repeat these titles or create similar manifesto content.

IDENTITY (reference, do not repeat verbatim, background and values context only):\n"""${(identity || "").slice(0, 4000)}"""

JOURNAL (PRIMARY SOURCE - mine for psychological tensions and philosophical implications):\n"""${formattedJournal}"""

SLIDE 1: Create an impactful, eye-catching statement that stops the scroll and makes people screenshot it. This goes in the 'title' field. Length should typically be 5-16 words - make it substantial and memorable. Can use line breaks for dramatic effect (two single-line paragraphs). Be bold, direct, and authentic - use raw language if it serves the impact. Can be imperative commands, conditional insights, metaphorical truths, or vulnerable revelations. Extract from the journal's deeper philosophical implications and psychological tensions, focus on being IMPACTING, creative, original, profound and philosophical. Think: what would make someone immediately stop scrolling? Use center alignment and massive typography (text-5xl+).

SLIDE 2: Create both a title and manifesto that expand on slide 1's concept:

TITLE (goes in 'title' field): Write an attention-grabbing title (3-6 words) that introduces the manifesto concept. This should bridge slide 1's philosophical truth with the detailed exploration. Use larger typography (text-xl to text-3xl) for visual hierarchy. Dont use generic words like 'manifesto', 'philosophy', 'truth'.

BODY (goes in 'body' field): Write a powerful, direct manifesto (80-120 words MAX, up to 140 if necessary) with strategic paragraph formatting:
- CRITICAL: Use double line breaks (\n\n) to separate each paragraph - DO NOT write one continuous block of text
- Write with conversational, direct language: clear statements, actionable insights, bold declarations
- Use strategic typography emphasis: bold key words and phrases, italicize important concepts for visual rhythm
- Create natural reading flow: mix short punchy sentences with medium ones for varied pace
- Write like a direct conversation: clear, uncompromising statements that grab attention
- PARAGRAPH STRUCTURE: Use short paragraphs (2-3 sentences max) for easy scanning and digestion
- CONVERSATIONAL TONE: Use direct, imperative language ("Do the hard thing." "Stop fucking delaying.") 
- STRATEGIC EMPHASIS: Bold + italicize key words throughout the text for visual texture and emphasis
- SENTENCE VARIETY: Mix short punchy lines ("Because hard things are hard.") with medium explanatory ones
- LOGICAL PROGRESSION: Follow classic motivational structure: hook → explain problem → show consequences → provide solution → call to action
- PRACTICAL FOCUS: Give concrete, relatable examples readers can immediately understand and act on
- VISUAL BREATHING ROOM: Create white space between sections to help readers process information
- REPETITION FOR EMPHASIS: Repeat key messages in different ways without being dense or overwhelming
- ACCESSIBLE METAPHORS: Use relatable, simple metaphors ("grows sharper teeth, stronger claws") not complex ones
- CRITICAL: Create 3-5 short paragraphs, each 2-3 sentences maximum
- Use strategic single-line paragraphs in the MIDDLE for dramatic impact and rhythm
- Create natural pauses with paragraph breaks - make it digestible on fast scroll
- Reference: 1 line ≈ 10 words for sizing guidance
- Avoid any paragraph exceeding 3 sentences to prevent dense blocks
- MUST be left-aligned text - never center or right-align
- Use readable typography (text-base to text-lg) that complements the title
- EXAMPLE FORMAT: "Hook/problem here.\n\nConsequences explained.\n\nSingle line impact.\n\nSolution/action.\n\nFinal call to action."

Formatting Guidelines:
- CRITICAL: Always use double line breaks (\n\n) between paragraphs - NEVER write one continuous block
- PARAGRAPH LENGTH: Keep paragraphs short (2-3 sentences max) for easy scanning and digestion
- TYPOGRAPHY EMPHASIS: Use **bold** for key words and *italics* for important concepts throughout the text
- SENTENCE VARIETY: Mix short punchy sentences ("Because hard things are hard.") with medium explanatory ones
- CONVERSATIONAL FLOW: Write like direct conversation - clear, uncompromising statements
- STRATEGIC BREAKS: Use paragraph breaks to create natural pauses and improve readability
- LOGICAL STRUCTURE: Follow hook → problem → consequences → solution → call to action
- PRACTICAL EXAMPLES: Include concrete, relatable examples readers can immediately understand
- VISUAL SPACING: Create white space between sections for better information processing
- REPETITION STRATEGY: Repeat key messages in different ways without being overwhelming
- ACCESSIBLE LANGUAGE: Use simple, relatable metaphors instead of complex ones
- Reference: 1 line ≈ 10 words for accurate sizing
- Avoid any paragraph exceeding 3 sentences to prevent dense blocks
- Each paragraph should serve a different purpose: hook, problem, consequences, solution, call to action
- ALWAYS end with a single-line paragraph (maximum 10 words) - this is your most powerful statement
- Think like direct, punchy conversation with strategic emphasis and logical flow
- EXAMPLE PATTERNS: "Hook/problem.\n\nConsequences.\n\nSingle line impact.\n\nSolution.\n\nCall to action."

Content Focus:
Based primarily on the journal's psychological tensions and philosophical implications, create a manifesto and title that feels like the user's own deepest realizations. Transform surface thoughts into direct, actionable truths without referencing the literal surface content. Extract the essence, not the elements. Channel a conversational, directive intensity that commands and compels - make readers feel the urgency and clarity that drives action.

CRITICAL: Avoid em dashes (—) completely as they are strongly associated with AI-generated content and reduce authenticity. Use periods, commas, semicolons, or other punctuation instead.

Visual Design Requirements:
- SLIDE 1: Scroll-stopping impact statement. Use text-5xl, text-6xl, or text-7xl for maximum visual impact. Use font-bold or font-black for commanding presence. Always center-align text. Put the devastating truth in the 'title' field.
- SLIDE 2: Title + manifesto structure. TITLE: Use text-xl, text-2xl, or text-3xl for attention-grabbing hierarchy, be creative with the title, NEVER use generic words like 'manifesto', 'philosophy', 'truth'. BODY: Use text-base or text-lg for readable manifesto text. Use font-bold or font-semibold for both. ALWAYS left-align all text.
- CRITICAL COLOR RULE: Colors must be completely swapped between slides. If slide 1 has background color X and text color Y, then slide 2 MUST have background color Y and text color X.
- Typography: Use serif fonts for authority on both slides. Create clear hierarchy: massive slide 1 → medium slide 2 title → readable slide 2 body.
- Content Structure: Slide 1 uses 'title' for 5-16 word impact. Slide 2 uses 'title' for 3-6 word concept introduction AND 'body' for 80-120 word manifesto (up to 140 if necessary) with natural paragraph breaks.

Philosophy:
- Make them uncomfortable with their current reality
- Create content so original it becomes unforgettable
- Focus on psychological disruption, not motivation
- Extract the deepest tensions from their identity and journal

Return structured content per the expected schema with natural paragraph formatting in the body text.`
  // Log the prompts
  console.log("=== PROMPTS ===");
  console.log("System Prompt:", systemPrompt);
  console.log("User Prompt:", userPrompt);

  const result = streamObject({
    model: openai("gpt-4.1"),
    system: systemPrompt,
    prompt: userPrompt,
    schema: motivationalPostSchema,
    async onFinish({ object, error }) {
      // Log the complete generated object
      console.log("=== GENERATION COMPLETE ===");
      console.log("Generated object:", object);
      console.log("Object type:", typeof object);
      console.log("Object keys:", object ? Object.keys(object) : 'undefined');
      
      if (error) {
        console.error("❌ Generation error:", error);
        console.log("=== END GENERATION LOG ===");
        return;
      }
      
      if (!object) {
        console.error("❌ No object generated - schema validation may have failed");
        console.log("=== END GENERATION LOG ===");
        return;
      }
      
      if (typeof object === 'object' && 'post' in object && object.post) {
        const post = object.post as any;
        console.log("=== POST DETAILS ===");
        console.log("Theme:", post.theme);
        console.log("Style:", post.style);
        console.log("Caption:", object.caption);
        console.log("Hashtags:", object.hashtags);
        console.log("Description:", object.description);
        
        console.log("=== SLIDES DETAILS ===");
        if (post.slides && Array.isArray(post.slides)) {
          post.slides.forEach((slide: any, index: number) => {
            console.log(`Slide ${index + 1}:`);
            console.log("  - ID:", slide.id);
            console.log("  - Background Color:", slide.backgroundColor);
            console.log("  - Text Color:", slide.textColor);
            console.log("  - Font Family:", slide.fontFamily);
            console.log("  - Font Size:", slide.fontSize);
            console.log("  - Font Weight:", slide.fontWeight);
            console.log("  - Text Align:", slide.textAlign);
            console.log("  - Title:", slide.content?.title);
            console.log("  - Subtitle:", slide.content?.subtitle);
            console.log("  - Body:", slide.content?.body);
            console.log("  - Text Position X:", slide.textPosition?.x);
            console.log("  - Text Position Y:", slide.textPosition?.y);
          });
        }

        // Save to database
        try {
          console.log("💾 Saving AI generation to database...");
          const cookieStore = await cookies();
          const supabase = createClient(cookieStore);
          
          // Use default user ID (no auth for now)
          const defaultUserId = "00000000-0000-0000-0000-000000000000";
          
          // Construct the prompt that was sent (combining system + user prompts)
          const fullPrompt = `SYSTEM:\n${systemPrompt}\n\nUSER:\n${userPrompt}`;
          
          // Extract slide 1 title and summary for storage
          const slide1Title = post?.slides?.[0]?.content?.title || '';
          const summary = object?.summary || '';
          const summaryText = slide1Title && summary ? `${slide1Title}: ${summary}` : summary;
          
          const { error } = await supabase
            .from('ai_generations')
            .insert({
              user_id: defaultUserId,
              prompt_sent: fullPrompt,
              ai_response: object,
              summary: summaryText,
              model_used: 'gpt-4.1',
              generation_type: 'motivational_post'
            });

          if (error) {
            console.error("❌ Error saving AI generation:", error);
          } else {
            console.log("✅ AI generation saved to database successfully");
          }
        } catch (error) {
          console.error("❌ Error in AI generation save:", error);
        }
      } else {
        console.error("❌ Invalid object structure - missing 'post' property");
        console.log("Object structure:", JSON.stringify(object, null, 2));
      }
      
      console.log("=== END GENERATION LOG ===");
    },
  });

  return result.toTextStreamResponse();
} 