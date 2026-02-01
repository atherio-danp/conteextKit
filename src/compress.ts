/**
 * Hedge words from words/hedges (github.com/words/hedges)
 * These introduce uncertainty/ambiguity and can often be removed.
 */
const HEDGE_WORDS = new Set([
  'largely', 'generally', 'often', 'rarely', 'sometimes', 'frequently',
  'occasionally', 'seldom', 'usually', 'almost', 'practically', 'apparently',
  'virtually', 'basically', 'approximately', 'roughly', 'somewhat', 'somehow',
  'partially', 'actually', 'really', 'fairly', 'hopefully', 'mainly',
  'mostly', 'overall', 'presumably', 'pretty', 'quite', 'rather',
  'supposedly', 'certainly', 'definitely', 'clearly', 'conceivably',
  'evidently', 'effectively', 'perhaps', 'maybe', 'possibly', 'probably',
  'likely', 'unlikely', 'unsure', 'doubtful', 'suggestive', 'apparent',
  'alleged', 'presumable', 'improbable'
]);

/**
 * Filler phrases that add no meaning - can be removed entirely.
 * Based on Purdue OWL, SmartBlogger, and technical writing guides.
 */
const FILLER_PHRASES = [
  // Document intro fillers
  /^this (document|section|guide|page|article|chapter) (explains|describes|covers|provides|contains|shows|outlines|details|discusses|presents|introduces).*?[.]\s*/gim,
  /^in this (document|section|guide|page|article|chapter),?\s*/gim,
  /^the following (section|document|guide|list|table|code|example).*?[.:]\s*/gim,
  /^(here|below) (is|are) (a |an |the )?(list|overview|summary|description|example).*?[.:]\s*/gim,
  /^(please )?(note|notice|remember) that:?\s*/gim,
  /^(as )?(shown|described|explained|mentioned|noted|discussed|seen|stated) (above|below|earlier|previously|later),?\s*/gim,
  /^for more (information|details|info),?\s*(see|refer to|check|visit|read).*?[.]\s*/gim,
  /^see (the )?(following|below|above|also).*?[.]\s*/gim,
  /^we (found|discovered|observed|noticed|determined|concluded) that\s*/gim,
  /^it (is|was|should be|has been) (known|noted|observed|understood|recognized|established) that\s*/gim,

  // Empty phrases (inline)
  /\bfor all intents and purposes\b/gi,
  /\bat the end of the day\b/gi,
  /\bas a matter of fact\b/gi,
  /\bin order to\b/gi,
  /\bdue to the fact that\b/gi,
  /\bin the event that\b/gi,
  /\bat this point in time\b/gi,
  /\bin the process of\b/gi,
  /\bfor the purpose of\b/gi,
  /\bwith regard to\b/gi,
  /\bwith respect to\b/gi,
  /\bin terms of\b/gi,
  /\bon the basis of\b/gi,
  /\bin light of the fact that\b/gi,
  /\bit is important to note that\b/gi,
  /\bit should be noted that\b/gi,
  /\bit is worth noting that\b/gi,
  /\bneedless to say\b/gi,
  /\bin my opinion\b/gi,
  /\bin my view\b/gi,
  /\bin my experience\b/gi,
  /\bas you can see\b/gi,
  /\bas we can see\b/gi,
  /\bas mentioned earlier\b/gi,
  /\bas previously mentioned\b/gi,
  /\bas noted above\b/gi,
  /\bas discussed\b/gi,
  /\bas such\b/gi,
  /\band so forth\b/gi,
  /\band so on\b/gi,
  /\bet cetera\b/gi,
  /\betc\.\s*/gi,
];

/**
 * Redundant word pairs - first word is unnecessary (Purdue OWL)
 */
const REDUNDANT_PAIRS: [RegExp, string][] = [
  [/\babsolutely essential\b/gi, 'essential'],
  [/\babsolutely necessary\b/gi, 'necessary'],
  [/\bactual fact\b/gi, 'fact'],
  [/\badvance planning\b/gi, 'planning'],
  [/\badvance warning\b/gi, 'warning'],
  [/\ball-time record\b/gi, 'record'],
  [/\bbasic fundamentals\b/gi, 'fundamentals'],
  [/\bbasic essentials\b/gi, 'essentials'],
  [/\bbrief summary\b/gi, 'summary'],
  [/\bclosely scrutinize\b/gi, 'scrutinize'],
  [/\bcompletely destroyed\b/gi, 'destroyed'],
  [/\bcompletely eliminate\b/gi, 'eliminate'],
  [/\bcompletely finished\b/gi, 'finished'],
  [/\bcurrent trend\b/gi, 'trend'],
  [/\bdefinite decision\b/gi, 'decision'],
  [/\beach and every\b/gi, 'each'],
  [/\beach individual\b/gi, 'each'],
  [/\bempty space\b/gi, 'space'],
  [/\bend result\b/gi, 'result'],
  [/\bexact same\b/gi, 'same'],
  [/\bfinal conclusion\b/gi, 'conclusion'],
  [/\bfinal outcome\b/gi, 'outcome'],
  [/\bfinal result\b/gi, 'result'],
  [/\bfirst and foremost\b/gi, 'first'],
  [/\bforeseeable future\b/gi, 'future'],
  [/\bformer graduate\b/gi, 'graduate'],
  [/\bfree gift\b/gi, 'gift'],
  [/\bfull and complete\b/gi, 'complete'],
  [/\bfuture plans\b/gi, 'plans'],
  [/\bgeneral consensus\b/gi, 'consensus'],
  [/\bgenuinely authentic\b/gi, 'authentic'],
  [/\bhonest truth\b/gi, 'truth'],
  [/\bimportant essentials\b/gi, 'essentials'],
  [/\binitial prototype\b/gi, 'prototype'],
  [/\bjoint collaboration\b/gi, 'collaboration'],
  [/\blast of all\b/gi, 'last'],
  [/\bmajor breakthrough\b/gi, 'breakthrough'],
  [/\bminor details\b/gi, 'details'],
  [/\bmutual cooperation\b/gi, 'cooperation'],
  [/\bnew innovation\b/gi, 'innovation'],
  [/\bnew invention\b/gi, 'invention'],
  [/\bold adage\b/gi, 'adage'],
  [/\bopen trench\b/gi, 'trench'],
  [/\boriginal founder\b/gi, 'founder'],
  [/\bpast experience\b/gi, 'experience'],
  [/\bpast history\b/gi, 'history'],
  [/\bpast memories\b/gi, 'memories'],
  [/\bpersonal opinion\b/gi, 'opinion'],
  [/\bplanning ahead\b/gi, 'planning'],
  [/\bpositive improvement\b/gi, 'improvement'],
  [/\bpre-planned\b/gi, 'planned'],
  [/\bprevious experience\b/gi, 'experience'],
  [/\bprimary focus\b/gi, 'focus'],
  [/\breason why\b/gi, 'reason'],
  [/\brefer back\b/gi, 'refer'],
  [/\breflect back\b/gi, 'reflect'],
  [/\brevert back\b/gi, 'revert'],
  [/\bsame exact\b/gi, 'same'],
  [/\bserious danger\b/gi, 'danger'],
  [/\bsudden impulse\b/gi, 'impulse'],
  [/\bsum total\b/gi, 'total'],
  [/\bterrible tragedy\b/gi, 'tragedy'],
  [/\btotally destroyed\b/gi, 'destroyed'],
  [/\btrue fact\b/gi, 'fact'],
  [/\bunexpected surprise\b/gi, 'surprise'],
  [/\bunique individual\b/gi, 'individual'],
  [/\buniversal panacea\b/gi, 'panacea'],
  [/\bvarious different\b/gi, 'different'],
  [/\bvery unique\b/gi, 'unique'],
  [/\bvisual image\b/gi, 'image'],
];

/**
 * Redundant categories - drop the category word (Purdue OWL)
 */
const REDUNDANT_CATEGORIES: [RegExp, string][] = [
  [/\blarge in size\b/gi, 'large'],
  [/\bheavy in weight\b/gi, 'heavy'],
  [/\bround in shape\b/gi, 'round'],
  [/\bgreen in color\b/gi, 'green'],
  [/\bbright in color\b/gi, 'bright'],
  [/\bcheap in price\b/gi, 'cheap'],
  [/\bearly in time\b/gi, 'early'],
  [/\bperiod of time\b/gi, 'period'],
  [/\bperiod in time\b/gi, 'period'],
  [/\boften times\b/gi, 'often'],
  [/\bmust necessarily\b/gi, 'must'],
];

/**
 * Words that can often be removed without losing meaning
 */
const REMOVABLE_WORDS = [
  /\bvery\s+/gi,
  /\breally\s+/gi,
  /\bjust\s+/gi,
  /\bsimply\s+/gi,
  /\bbasically\s+/gi,
  /\bactually\s+/gi,
  /\bliterally\s+/gi,
  /\bobviously\s+/gi,
  /\bclearly\s+/gi,
  /\bdefinitely\s+/gi,
  /\bcertainly\s+/gi,
  /\babsolutely\s+/gi,
  /\btotally\s+/gi,
  /\bcompletely\s+/gi,
  /\bentirely\s+/gi,
  /\bextremely\s+/gi,
  /\bhighly\s+/gi,
];

/**
 * Compress markdown content by removing formatting while preserving information.
 * Pure algorithmic approach - no ML/LLM required.
 */
export function compress(markdown: string): string {
  let text = markdown;

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Remove horizontal rules
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');

  // Remove markdown headers but keep text (## Header -> Header)
  text = text.replace(/^#{1,6}\s+(.*)$/gm, '$1');

  // Remove bold/italic markers
  text = text.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1');
  text = text.replace(/_{1,3}([^_]+)_{1,3}/g, '$1');

  // Remove code block markers but keep code content
  text = text.replace(/```[\w]*\n?/g, '');

  // Remove inline code backticks
  text = text.replace(/`([^`]+)`/g, '$1');

  // Remove blockquote markers
  text = text.replace(/^>\s*/gm, '');

  // Remove unordered list markers (-, *, +)
  text = text.replace(/^[\t ]*[-*+]\s+/gm, '');

  // Remove ordered list markers (1., 2., etc.)
  text = text.replace(/^[\t ]*\d+\.\s+/gm, '');

  // Remove link syntax, keep text: [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove image syntax: ![alt](url) -> alt (or empty)
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // Remove reference-style link definitions
  text = text.replace(/^\s*\[[^\]]+\]:\s*.*$/gm, '');

  // Handle tables: remove separator rows and convert pipes to spaces
  text = text.replace(/^\|?[\s-:|]+\|[\s-:|]*$/gm, '');
  text = text.replace(/\|/g, ' ');

  // Remove filler phrases
  for (const pattern of FILLER_PHRASES) {
    text = text.replace(pattern, '');
  }

  // Replace redundant pairs with simpler versions
  for (const [pattern, replacement] of REDUNDANT_PAIRS) {
    text = text.replace(pattern, replacement);
  }

  // Replace redundant categories
  for (const [pattern, replacement] of REDUNDANT_CATEGORIES) {
    text = text.replace(pattern, replacement);
  }

  // Remove filler words (be careful - only remove when followed by space)
  for (const pattern of REMOVABLE_WORDS) {
    text = text.replace(pattern, '');
  }

  // Collapse all whitespace (newlines, tabs, multiple spaces) to single space
  text = text.replace(/\s+/g, ' ');

  return text.trim();
}
