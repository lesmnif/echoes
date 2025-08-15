import { DeepPartial } from "ai";
import { z } from "zod";

export const motivationalPostSchema = z.object({
  summary: z.string().describe("Concise summary (10-20 words max) of the main themes, topics, and concepts covered in this post. Used to avoid generating similar content in future posts. Focus on the core ideas, not the writing style."),
  post: z.object({
    theme: z.string().describe("The main theme or topic of the motivational post"),
    style: z.string().describe("The tone and style of the post (e.g., aggressive, inspiring, direct)"),
    slides: z.array(z.object({
      id: z.number().describe("Slide number: 1 (scroll-stopping impact statement) or 2 (manifesto expansion)"),
      backgroundColor: z.string().describe("Background color in hex format. CRITICAL COLOR RULE: Colors must be completely swapped between slides. If slide 1 has background color X and text color Y, then slide 2 MUST have background color Y and text color X. Use bold, high-impact colors (pure black, deep crimson, electric blue) for slide 1, strong contrast for slide 2."),
      textColor: z.string().describe("Text color in hex format. CRITICAL COLOR RULE: Colors must be completely swapped between slides. If slide 1 has text color Y, then slide 2 MUST have text color X. Create dramatic contrast between slides - dark/light, warm/cool combinations."),
      fontFamily: z.string().describe("Font family - use serif fonts for authority and gravitas (e.g., 'serif'). Both slides should use serif for authority."),
      fontSize: z.string().describe("Font size - SLIDE 1: use text-5xl, text-6xl, or text-7xl for maximum scroll-stopping impact with massive typography. SLIDE 2: For title use text-xl, text-2xl, or text-3xl for attention-grabbing hierarchy; for body use text-base, text-lg for readable manifesto text."),
      fontWeight: z.string().describe("Font weight - SLIDE 1: use font-bold or font-black for commanding presence. SLIDE 2: use font-bold or font-semibold for both title and body text."),
      textAlign: z.string().describe("Text alignment - SLIDE 1: always text-center for impact. SLIDE 2: ALWAYS text-left for manifesto readability."),
      content: z.object({
        title: z.string().describe("SLIDE 1: Impactful, eye-catching statement (5-16 words) that stops the scroll and makes people screenshot it. Should be substantial, memorable, creative, original, profound and philosophical. Be bold, direct, and authentic - can use raw language if it serves impact. Can be imperative commands, conditional insights, metaphorical truths, or vulnerable revelations. Can use line breaks for dramatic effect (two single-line paragraphs). Must be related to user's identity/journal. Think: what would make someone immediately stop scrolling? SLIDE 2: Creative, original title (3-6 words) that captures the manifesto essence and bridges slide 1's philosophical truth with the detailed exploration. NEVER use generic words like 'manifesto', 'philosophy', 'truth'. Be specific, unique, and memorable - like a chapter title the user would actually write."),
        subtitle: z.string().optional().describe("Optional secondary text - rarely used"),
        body: z.string().optional().describe("SLIDE 1: Usually empty - use title. SLIDE 2: Main poetic manifesto text (80-120 words MAX, up to 140 words if necessary) expanding on slide 1's concept. CRITICAL: Use double line breaks (\\n\\n) to separate each paragraph - DO NOT write one continuous block of text. Write with rich poetic language: visceral metaphors, sensory imagery, unexpected word choices. Use literary devices like alliteration, internal rhyme, parallel structure, contrasts. Create language that readers can feel, taste, and visualize - make abstract concepts tangible. Write like a poet-philosopher with rhythmic prose and emotional depth. CRITICAL VARIETY: Create dramatically varied paragraph structures - avoid predictable 2-3 similar-length paragraphs. Mix diverse lengths: very short (1 line ~10 words), short punchy (2-3 lines ~20-30 words), medium (3-4 lines ~30-40 words), occasionally longer (4-5 lines ~40-50 words). Use strategic single-line paragraphs in the MIDDLE for dramatic impact and rhythm - not just at the end. Create unpredictable patterns and vary emotional pacing. Reference: 1 line ≈ 10 words. Avoid any paragraph exceeding 5 lines to prevent walls of text. CRITICAL FINAL REQUIREMENT: ALWAYS end with a single-line paragraph (maximum 10 words) that serves as your most powerful, poetic statement. EXAMPLE FORMAT: 'First paragraph text.\\n\\nSecond paragraph text.\\n\\nFinal single line.'")
      }),
      textPosition: z.object({
        x: z.string().describe("Horizontal position - SLIDE 1: center for impact. SLIDE 2: left for readability"),
        y: z.string().describe("Vertical position - both slides typically use center for balanced composition")
      })
    })).describe("Exactly 2 slides: [1] scroll-stopping impact statement with large centered text and commanding typography, [2] left-aligned manifesto expansion with contrasting colors and natural paragraph formatting"),
    caption: z.string().describe("Instagram caption that feels like a natural extension of the post's philosophical depth. Should be raw, authentic, and thought-provoking - like the user's own reflection on the content. Avoid motivational clichés, generic language, or performative tone. Instead, write as if the user is sharing their genuine thoughts about the post's message. Can be a question, observation, or personal insight that invites deeper thinking. Keep it concise (1-2 sentences max) and maintain the same penetrating, uncompromising voice as the post itself."),
    hashtags: z.array(z.string()).describe("Array of relevant hashtags for discoverability"),
    description: z.string().describe("Brief description of what this post is about and its intended impact")
  })
});

// define a type for the partial notifications during generation
export type PartialMotivationalPost = DeepPartial<typeof motivationalPostSchema>["post"];

export type MotivationalPost = z.infer<typeof motivationalPostSchema>["post"]; 