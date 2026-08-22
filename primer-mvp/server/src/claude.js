const Anthropic = require('@anthropic-ai/sdk');

// NOTE on "training": there is no model to train here, by design (see the
// project brief - "you don't need a complex ML model"). Claude is used purely
// via API calls, not fine-tuned. The two knobs you actually have to improve
// quality are:
//   1. The system prompt / rubric text below in gradeExplanation() and
//      translateText() - this is the real lever, tune it before anything else.
//   2. ANTHROPIC_MODEL in .env - swap 'claude-haiku-4-5-20251001' for
//      'claude-sonnet-5' if you want higher-quality grading at higher cost/latency.

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';
const apiKey = process.env.ANTHROPIC_API_KEY;
const client = apiKey ? new Anthropic({ apiKey }) : null;

function hasLiveApi() {
  return Boolean(client);
}

// ---- Offline fallbacks (used automatically if no ANTHROPIC_API_KEY is set) ----
//
// IMPORTANT: this heuristic only ever looked for English reasoning words, which
// meant a child explaining their reasoning perfectly in Hindi or Telugu would get
// unfairly marked "rote" simply because none of the (English-only) keywords could
// match - not because the reasoning was actually weak. Below adds real keyword
// lists for hi/te so the offline grader is at least language-aware. These word
// lists are a good-faith pass, not reviewed by a native speaker - worth a native
// speaker sanity-check before relying on this heavily without a live API key.

const REASONING_WORDS = {
  en: {
    strong: [
      'because', 'since', 'so that', 'therefore',
      'denominator', 'numerator', 'common denominator', 'lcd', 'lowest terms',
      'simplify', 'simplifies', 'reduce', 'reduces',
      'convert', 'converted', 'equivalent',
      'multiply', 'multiplied', 'divide', 'divided', 'reciprocal', 'flip',
      'cross multiply', 'compare', 'bigger', 'smaller', 'more than', 'less than'
    ],
    weak: [
      'first', 'then', 'next', 'after that', 'add', 'subtract', 'same', 'different',
      'half', 'whole', 'part', 'piece', 'slice', 'share', 'equal', 'equal parts'
    ]
  },
  hi: {
    strong: [
      'क्योंकि', 'हर', 'अंश', 'सरल', 'बराबर', 'गुणा', 'भाग', 'बदल', 'परिवर्तित',
      'तुलना', 'बड़ा', 'छोटा', 'ज्यादा', 'कम'
    ],
    weak: ['पहले', 'फिर', 'तब', 'आधा', 'पूरा', 'हिस्सा', 'टुकड़ा', 'समान', 'अलग']
  },
  te: {
    strong: [
      'ఎందుకంటే', 'హారం', 'లవం', 'సరళీకరణ', 'సులభం', 'సమానం', 'గుణించు',
      'భాగించు', 'మార్చు', 'పోల్చు', 'పెద్ద', 'చిన్న'
    ],
    weak: ['మొదట', 'తర్వాత', 'సగం', 'మొత్తం', 'భాగం', 'ముక్క', 'అదే', 'వేరు']
  }
};

function heuristicGrade(explanation, correctAnswer, language = 'en') {
  const text = (explanation || '').trim().toLowerCase();
  if (text.length < 6) return { verdict: 'rote', reason: 'Too short to show real reasoning.' };

  // If the "explanation" is basically just the answer restated with no extra
  // words, that's rote even if it happens to be long enough to pass the length check.
  const normalizedAnswer = (correctAnswer || '').trim().toLowerCase();
  const strippedText = text.replace(/[^a-z0-9/. ]/g, '').trim();
  if (normalizedAnswer && strippedText === normalizedAnswer) {
    return { verdict: 'rote', reason: 'This just repeats the answer without saying how you got there.' };
  }

  const words = REASONING_WORDS[language] || REASONING_WORDS.en;
  const strongHits = words.strong.filter((w) => text.includes(w)).length;
  const weakHits = words.weak.filter((w) => text.includes(w)).length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (strongHits >= 1 && wordCount >= 5) {
    return { verdict: 'understood', reason: 'Explanation references the actual math steps involved.' };
  }
  if (strongHits >= 1 || (weakHits >= 2 && wordCount >= 6)) {
    return { verdict: 'partial', reason: 'Explanation touches the idea but is a bit thin - encourage one more detail.' };
  }
  return { verdict: 'rote', reason: 'Explanation does not show the reasoning behind the answer yet.' };
}

const staticTranslations = {
  hi: {
    'Correct!': 'सही जवाब!',
    "Close! Let's look at that together.": 'लगभग सही! चलो इसे साथ में देखते हैं।',
    'Why do you think that?': 'आपको ऐसा क्यों लगता है?',
    'Great thinking!': 'बहुत बढ़िया सोच!'
  },
  te: {
    'Correct!': 'సరైనది!',
    "Close! Let's look at that together.": 'దగ్గరగా వచ్చింది! కలిసి చూద్దాం.',
    'Why do you think that?': 'మీరు అలా ఎందుకు అనుకుంటున్నారు?',
    'Great thinking!': 'చాలా బాగా ఆలోచించారు!'
  }
};

function heuristicTranslate(text, targetLang) {
  const dict = staticTranslations[targetLang];
  if (dict && dict[text]) return dict[text];
  return text; // graceful no-op fallback for anything not in the static dictionary
}

// ---- Live Claude-backed versions ----

async function gradeExplanation({ question, correctAnswer, studentAnswer, explanation, language = 'en' }) {
  if (!hasLiveApi()) return heuristicGrade(explanation, correctAnswer, language);

  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 150,
      system:
        'You grade a young student\'s explanation of a math answer. The explanation may be ' +
        'written in English, Hindi, or Telugu - grade the reasoning regardless of language. ' +
        'Classify it as exactly one ' +
        'of: understood, partial, or rote. "understood" means the explanation shows real ' +
        'reasoning about the concept. "partial" shows some reasoning but is incomplete or vague. ' +
        '"rote" means it restates the answer without any reasoning, or is empty/nonsensical. ' +
        'Reply with strict JSON only: {"verdict": "...", "reason": "..."} - reason is one short ' +
        'encouraging sentence, in the same language as the explanation, never harsh.',
      messages: [
        {
          role: 'user',
          content:
            `Question: ${question}\nCorrect answer: ${correctAnswer}\n` +
            `Student's answer: ${studentAnswer}\nStudent's explanation: ${explanation}`
        }
      ]
    });
    const raw = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!['understood', 'partial', 'rote'].includes(parsed.verdict)) throw new Error('bad verdict');
    return parsed;
  } catch (err) {
    console.error('[claude] gradeExplanation failed, falling back to heuristic:', err.message);
    return heuristicGrade(explanation, correctAnswer, language);
  }
}

async function translateText(text, targetLang) {
  if (targetLang === 'en') return text;
  if (!hasLiveApi()) return heuristicTranslate(text, targetLang);

  try {
    const langName = targetLang === 'hi' ? 'Hindi' : targetLang === 'te' ? 'Telugu' : targetLang;
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 200,
      system:
        `Translate the given text into ${langName} for a young school child. ` +
        'Keep it warm and simple. Reply with ONLY the translated text, nothing else.',
      messages: [{ role: 'user', content: text }]
    });
    const raw = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim();
    return raw || heuristicTranslate(text, targetLang);
  } catch (err) {
    console.error('[claude] translateText failed, falling back to static dictionary:', err.message);
    return heuristicTranslate(text, targetLang);
  }
}

// Translates several short strings (a question's text/prompt/choices, say) in a single
// API call instead of one call per field - keeps question-load latency reasonable.
// Without a live key this is an honest no-op: the static dictionary only covers a
// handful of fixed UI phrases, not arbitrary math question text, so we return the
// English originals unchanged rather than pretending to translate them.
async function translateBatch(texts, targetLang) {
  if (targetLang === 'en' || !texts.length) return texts;
  if (!hasLiveApi()) return texts.map((t) => heuristicTranslate(t, targetLang));

  try {
    const langName = targetLang === 'hi' ? 'Hindi' : targetLang === 'te' ? 'Telugu' : targetLang;
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      system:
        `Translate each numbered line into ${langName} for a young school child learning math. ` +
        'Keep numbers, fractions, and math symbols (like 1/2, 0.5, x, ÷) exactly as they are - ' +
        'only translate the surrounding words. Keep it warm and simple. ' +
        'Reply with ONLY a JSON array of strings, same length and order as the input, nothing else.',
      messages: [{ role: 'user', content: texts.map((t, i) => `${i + 1}. ${t}`).join('\n') }]
    });
    const raw = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed) || parsed.length !== texts.length) throw new Error('shape mismatch');
    return parsed;
  } catch (err) {
    console.error('[claude] translateBatch failed, falling back to originals:', err.message);
    return texts.map((t) => heuristicTranslate(t, targetLang));
  }
}

module.exports = { hasLiveApi, gradeExplanation, translateText, translateBatch };
