// SignalLens AI - Privacy Preprocessing Module
// Sanitizes review text before analysis

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(\+?1?\s*[-.]?\s*)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/g;
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

// Prompt injection patterns - detect review text that tries to act as instructions
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /disregard\s+(all\s+)?prior/i,
  /you\s+are\s+now\s+a/i,
  /reveal\s+(the\s+)?(api|secret|key|password)/i,
  /system\s*prompt/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<<SYS>>/i,
  /<\|im_start\|>/i,
];

export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';

  let sanitized = text;

  // Replace PII
  sanitized = sanitized.replace(EMAIL_REGEX, '[EMAIL]');
  sanitized = sanitized.replace(PHONE_REGEX, '[PHONE]');
  sanitized = sanitized.replace(URL_REGEX, '[URL]');

  // Strip HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Neutralize prompt injection attempts (don't remove, just flag)
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[FILTERED]');
  }

  // Limit text length (max 2000 chars per review)
  if (sanitized.length > 2000) {
    sanitized = sanitized.substring(0, 2000) + '...';
  }

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
}

export function sanitizeReviewBatch(reviews: Array<{ review_text: string; [key: string]: unknown }>): Array<{ review_text: string; [key: string]: unknown }> {
  return reviews.map(review => ({
    ...review,
    review_text: sanitizeText(review.review_text),
  }));
}

export function containsInjectionAttempt(text: string): boolean {
  return INJECTION_PATTERNS.some(pattern => pattern.test(text));
}
