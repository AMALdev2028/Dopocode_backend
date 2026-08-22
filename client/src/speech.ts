// Thin wrapper around the browser's built-in Web Speech API.
// No API key, no external service - if a browser doesn't support one of these
// (e.g. Firefox has patchy SpeechRecognition support), the relevant button
// just doesn't render. Nothing else in the app depends on this working.

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(text: string, lang: string = 'en-US') {
  if (!isSpeechSynthesisSupported() || !text) return;
  window.speechSynthesis.cancel(); // don't stack overlapping utterances
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.lang = lang;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && Boolean(getRecognitionCtor());
}

export function startListening(
  onResult: (transcript: string) => void,
  onEnd: () => void,
  lang: string = 'en-US'
): SpeechRecognitionLike | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onresult = (event: any) => {
    const transcript = event.results?.[0]?.[0]?.transcript || '';
    onResult(transcript);
  };
  recognition.onerror = () => onEnd();
  recognition.onend = onEnd;
  recognition.start();
  return recognition;
}

export const langToSpeechCode: Record<string, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  te: 'te-IN'
};
