/**
 * Humanizer utilities based on blader/humanizer (Wikipedia "Signs of AI writing").
 * Strips AI tells, formatting crutches (em dashes, forced triads, shallow -ing riders),
 * and corporate slop to produce grounded, natural text that sounds like a human writer.
 */

export const BANNED_AI_WORDS = [
  "actually",
  "additionally",
  "adept at",
  "align with",
  "bolstered",
  "championed",
  "crucial",
  "cutting-edge",
  "deep dive",
  "delve",
  "detail-oriented",
  "dynamic",
  "end-to-end",
  "enduring",
  "enhance",
  "foster",
  "fostering",
  "game-changing",
  "garner",
  "harnessed",
  "holistic",
  "indelible",
  "interplay",
  "intricate",
  "leveraged",
  "meticulous",
  "meticulously",
  "multifaceted",
  "orchestrated",
  "paradigm",
  "passionate",
  "pivotal",
  "proven track record",
  "quietly",
  "results-driven",
  "robust",
  "seasoned",
  "showcase",
  "showcasing",
  "spearhead",
  "spearheaded",
  "state-of-the-art",
  "synergized",
  "synergy",
  "tapestry",
  "testament",
  "transformative",
  "underscore",
  "underscoring",
  "valuable",
  "vibrant",
  "visionary",
] as const;

/**
 * Regex to detect and strip shallow -ing riders commonly attached to AI resume bullets.
 * Examples: ", ensuring seamless efficiency", ", fostering team collaboration",
 * ", resulting in maximum satisfaction", ", contributing to organizational success".
 */
const SHALLOW_ING_RIDER_REGEX =
  /,\s*(?:ensuring|fostering|driving|highlighting|underscoring|reflecting|symbolizing|contributing to|showcasing|resulting in)\s+[^.!?]+([.!?]?)$/i;

/**
 * Clean and humanize AI-generated text by removing structural tells:
 * - Em dashes (—) and en dashes (–) used as conversational crutches (§8)
 * - Shallow -ing riders at bullet endings (§15)
 * - Chatbot residue prefixes/suffixes (§22)
 * - Excess whitespace and dangling punctuation
 */
export function cleanHumanizedText(raw: string): string {
  if (!raw) return "";

  let text = raw.trim();

  // 1. Strip chatbot residue openers (§22)
  text = text.replace(
    /^(?:certainly|of course|here is|here's|great question|i hope this helps)[!,.:]?\s*/i,
    ""
  );

  // 2. Remove em dashes (—) and en dashes (–) and double hyphens (--) used as clause connectors (§8)
  // Replace "word — word" or "word -- word" with "word, word" or clean sentence join
  text = text.replace(/\s*[—–]\s*/g, ", ");
  text = text.replace(/\s+--\s+/g, ", ");

  // 3. Strip shallow -ing riders from the end of sentences/bullets (§15)
  // e.g. "Maintained register accuracy, ensuring maximum customer satisfaction." -> "Maintained register accuracy."
  text = text.replace(SHALLOW_ING_RIDER_REGEX, "$1");

  // 4. Normalize awkward double commas or comma-periods caused by replacements
  text = text.replace(/,\s*,/g, ",");
  text = text.replace(/,\s*\./g, ".");
  text = text.replace(/\s{2,}/g, " ");

  return text.trim();
}

/**
 * Standard Humanizer system prompt instructions for inclusion in LLM system prompts.
 */
export const HUMANIZER_PROMPT_RULES = `CRITICAL HUMANIZER ANTI-SLOP RULES (Based on blader/humanizer):
1. No Staging (§1 - §5):
   - Never use "not only X, but Y", "not just X, it's Y", or "X rather than Y". State points directly.
   - No dramatic one-line closers or fragments ("That is the real win", "Every. Single. Day.").
   - No sayings that sound deep ("at its core", "fundamentally", "what really matters").
   - No arguing with unstated objections or hypothetical critics.
2. No Rhythm by Rule (§6 - §11):
   - No forced triads: Do not artificially group adjectives, verbs, or accomplishments into threes. Let statements stand with 1 or 2 concrete items.
   - No em dashes (—) or en dashes (–) as conversational crutches in summaries or bullets. Use commas, periods, or clean sentence structure.
   - No shallow -ing riders at the end of bullets (e.g. NEVER append ", ensuring maximum satisfaction", ", driving efficiency", ", contributing to growth").
3. No Vocabulary Inflation (§12 - §18):
   - STRICTLY BANNED WORDS: delve, tapestry, multifaceted, pivotal, spearhead, spearheaded, leveraged, synergized, orchestrated, harnessed, championed, dynamic, results-driven, proven track record, seasoned, passionate, detail-oriented, cutting-edge, state-of-the-art, game-changing, transformative, visionary, foster, fostering, showcase, showcasing, testament, adept at, holistic, synergy, paradigm, end-to-end, bolstered, enduring, meticulous, robust, underscore, vibrant.
   - Do NOT replace simple verbs with "serves as", "stands as", "functions as", "boasts", or "features". Use direct verbs.
4. No Chatbot Residue (§22):
   - No greetings, sign-offs, or conversational chatter ("Here is...", "Certainly!"). Return only valid JSON.`;
