import { VoiceLanguage, VoiceLanguageId, VoicePersonaId, VoiceProfile } from '../types';

export const VOICE_PROFILES: VoiceProfile[] = [
  {
    id: 'friendly',
    name: 'Aria (Friendly)',
    persona: 'Friendly Voice',
    description: 'Warm, conversational, and uplifting tone. Perfect for everyday questions and friendly chats.',
    gender: 'Female',
    tone: 'Warm & Welcoming',
    pitch: 1.15,
    rateMultiplier: 1.02,
    color: 'from-amber-500 to-orange-500',
    previewSampleEn: 'Hello! It is so wonderful to meet you. How is your day going so far?',
    previewSampleHi: 'नमस्ते! आपसे मिलकर बहुत खुशी हुई। बताइए आज आपका दिन कैसा बीत रहा है?',
  },
  {
    id: 'professional',
    name: 'Orion (Professional)',
    persona: 'Professional Voice',
    description: 'Crisp, articulate, and formal tone. Ideal for business, coding, research, and technical analysis.',
    gender: 'Male',
    tone: 'Crisp & Articulate',
    pitch: 0.95,
    rateMultiplier: 1.0,
    color: 'from-blue-600 to-indigo-600',
    previewSampleEn: 'Good day. AI Vexa systems are fully operational and ready for your complex tasks.',
    previewSampleHi: 'नमस्कार। एआई वेक्सा सिस्टम पूरी तरह तैयार है। बताइए आज हम किस प्रोजेक्ट पर काम करें?',
  },
  {
    id: 'deep',
    name: 'Atlas (Deep)',
    persona: 'Deep Voice',
    description: 'Resonant, low-pitch, commanding baritone. Excellent for storytelling, philosophy, and calm listening.',
    gender: 'Male',
    tone: 'Deep Baritone',
    pitch: 0.72,
    rateMultiplier: 0.94,
    color: 'from-purple-800 to-slate-900',
    previewSampleEn: 'Deep insights begin with quiet curiosity. Let us explore knowledge together.',
    previewSampleHi: 'गहराई और ज्ञान का संगम ही सच्ची समझ है। आइए आज कुछ नया और गंभीर सीखें।',
  },
  {
    id: 'soft',
    name: 'Luna (Soft)',
    persona: 'Soft Voice',
    description: 'Gentle, soothing, whisper-soft tone. Great for nighttime relaxation, mindfulness, and gentle study.',
    gender: 'Female',
    tone: 'Gentle & Soothing',
    pitch: 1.08,
    rateMultiplier: 0.9,
    color: 'from-teal-500 to-emerald-600',
    previewSampleEn: 'Take a deep breath. Relax, and take all the time you need.',
    previewSampleHi: 'एक गहरी सांस लीजिए। आराम से सोचिए, हम आपके साथ हर कदम पर हैं।',
  },
  {
    id: 'energetic',
    name: 'Nova (Energetic)',
    persona: 'Energetic Voice',
    description: 'High-energy, fast-paced, motivational, and dynamic. Supercharges brainstorming and active coaching.',
    gender: 'Female',
    tone: 'Dynamic & Inspiring',
    pitch: 1.25,
    rateMultiplier: 1.15,
    color: 'from-rose-500 to-amber-500',
    previewSampleEn: 'Let’s go! We have great ideas to build and exciting goals to achieve today!',
    previewSampleHi: 'चलिए शुरू करते हैं! आज का दिन कमाल का होने वाला है, क्या नया बनाना है?',
  },
  {
    id: 'calm',
    name: 'Zen (Calm)',
    persona: 'Calm Voice',
    description: 'Measured, peaceful, balanced cadence. Keeps long explanations relaxed, clear, and stress-free.',
    gender: 'Male',
    tone: 'Peaceful & Balanced',
    pitch: 0.88,
    rateMultiplier: 0.92,
    color: 'from-sky-500 to-indigo-500',
    previewSampleEn: 'Peace of mind brings clarity. Everything will be resolved step by step.',
    previewSampleHi: 'शांत मन से हर समस्या का समाधान मिल जाता है। धीरे-धीरे सब समझ आ जाएगा।',
  },
  {
    id: 'male',
    name: 'Arjun (Male)',
    persona: 'Male Voice',
    description: 'Natural, balanced, expressive male voice with clear neutral diction and human-like warmth.',
    gender: 'Male',
    tone: 'Natural Masculine',
    pitch: 0.85,
    rateMultiplier: 1.0,
    color: 'from-blue-500 to-cyan-600',
    previewSampleEn: 'Hi there, this is Arjun. I will be your companion for voice conversations in AI Vexa.',
    previewSampleHi: 'नमस्ते, मैं अर्जुन हूँ। आपकी हर बात को समझकर सही जवाब देना मेरी प्राथमिकता है।',
  },
  {
    id: 'female',
    name: 'Ananya (Female)',
    persona: 'Female Voice',
    description: 'Natural, melodic, expressive female voice with clear neutral diction and relatable tone.',
    gender: 'Female',
    tone: 'Natural Feminine',
    pitch: 1.18,
    rateMultiplier: 1.0,
    color: 'from-violet-500 to-fuchsia-500',
    previewSampleEn: 'Hello! I am Ananya. Ready to converse naturally in any language you choose.',
    previewSampleHi: 'नमस्ते! मैं अनन्या हूँ। एआई वेक्सा में आपका स्वागत है, बताइए आज क्या बात करें?',
  },
];

export const VOICE_LANGUAGES: VoiceLanguage[] = [
  {
    id: 'hi',
    code: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    previewSample: 'नमस्ते! मैं एआई वेक्सा हूँ। आज आपकी क्या सहायता करूँ?',
  },
  {
    id: 'en',
    code: 'en-US',
    name: 'English',
    nativeName: 'English (Global)',
    flag: '🌐',
    previewSample: 'Hello! I am AI Vexa. How can I assist you today?',
  },
  {
    id: 'hinglish',
    code: 'hi-IN',
    name: 'Hinglish',
    nativeName: 'Hinglish (Hindi + English)',
    flag: '🇮🇳',
    previewSample: 'Hey there! AI Vexa yahan hai. Batao aaj kya plan hai?',
  },
  {
    id: 'bn',
    code: 'bn-IN',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇮🇳',
    previewSample: 'নমস্কার! আমি এআই ভেক্সা। আজ আপনাকে কীভাবে সাহায্য করতে পারি?',
  },
  {
    id: 'ta',
    code: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    previewSample: 'வணக்கம்! நான் ஏஐ வெக்ஸா. இன்று உங்களுக்கு எவ்வாறு உதவ முடியும்?',
  },
  {
    id: 'te',
    code: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    flag: '🇮🇳',
    previewSample: 'నమస్కారం! నేను ఏఐ వెక్సా. ఈరోజు మీకు ఎలా సహాయపడగలను?',
  },
  {
    id: 'mr',
    code: 'mr-IN',
    name: 'Marathi',
    nativeName: 'मराठी',
    flag: '🇮🇳',
    previewSample: 'नमस्कार! मी एआय वेक्सा आहे. आज मी तुम्हाला कशी मदत करू शकतो?',
  },
  {
    id: 'gu',
    code: 'gu-IN',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    flag: '🇮🇳',
    previewSample: 'નમસ્તે! હું એઆઈ વેક્સા છું. આજે હું તમને કેવી રીતે મદદ કરી શકું?',
  },
  {
    id: 'pa',
    code: 'pa-IN',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    flag: '🇮🇳',
    previewSample: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਏਆਈ ਵੈਕਸਾ ਹਾਂ। ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
  },
];

export const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2] as const;
export type SpeedOption = (typeof SPEED_OPTIONS)[number];

/**
 * Strips raw markdown syntax, code blocks, URLs, and asterisks so the text sounds natural when spoken.
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';

  return (
    text
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, ' [code snippet omitted] ')
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Remove image and links markdown
      .replace(/!\[(.*?)\]\(.*?\)/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      // Remove URLs
      .replace(/https?:\/\/\S+/gi, '')
      // Remove bold/italics asterisks and underscores
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      // Remove markdown headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove blockquotes and list bullets
      .replace(/^>\s+/gm, '')
      .replace(/^[\*\-\+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '')
      // Remove table formatting
      .replace(/\|/g, ' ')
      // Collapse multiple whitespace/newlines
      .replace(/\s+/g, ' ')
      .trim()
  );
}

/**
 * Fast Voice Generation: Splits long text into natural sentences so audio playback starts immediately.
 */
export function splitIntoSpeechChunks(text: string): string[] {
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return [];

  // Match sentences ending with ., !, ?, |, Hindi danda । or newline
  const rawChunks = cleaned.match(/[^.!?।\n]+[.!?।\n]+|[^.!?।\n]+$/g) || [cleaned];

  const chunks: string[] = [];
  let buffer = '';

  for (const chunk of rawChunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    // If chunk is too short (< 20 chars), combine with next to prevent choppy speech
    if (buffer.length + trimmed.length < 90) {
      buffer += (buffer ? ' ' : '') + trimmed;
    } else {
      if (buffer) chunks.push(buffer);
      buffer = trimmed;
    }
  }

  if (buffer) chunks.push(buffer);
  return chunks.length > 0 ? chunks : [cleaned];
}

/**
 * Selects the best available native browser voice matching the persona and language.
 */
export function matchBestBrowserVoice(
  voices: SpeechSynthesisVoice[],
  profile: VoiceProfile,
  languageId: VoiceLanguageId
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const langObj = VOICE_LANGUAGES.find((l) => l.id === languageId) || VOICE_LANGUAGES[0];
  const langPrefix = langObj.code.split('-')[0].toLowerCase();

  // 1. Filter voices that match the language prefix (e.g. 'hi', 'en', 'bn', etc.)
  const matchingLangVoices = voices.filter((v) =>
    v.lang.toLowerCase().startsWith(langPrefix)
  );

  const pool = matchingLangVoices.length > 0 ? matchingLangVoices : voices;

  // 2. Look for preferred natural / neural voices
  const isFemale = profile.gender === 'Female';
  const femaleKeywords = ['female', 'woman', 'zira', 'samantha', 'karen', 'swara', 'heera', 'ananya', 'google हिन्दी', 'veena'];
  const maleKeywords = ['male', 'man', 'david', 'mark', 'daniel', 'rishi', 'arjun', 'ravi', 'alex'];

  const targetKeywords = isFemale ? femaleKeywords : maleKeywords;

  // Try to find a voice matching the gender keywords
  const genderMatched = pool.find((v) =>
    targetKeywords.some((kw) => v.name.toLowerCase().includes(kw))
  );

  if (genderMatched) return genderMatched;

  // Otherwise return the first language match or first voice
  return pool[0] || voices[0] || null;
}

export interface VoicePlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  activeText: string | null;
  currentChunkIndex: number;
  totalChunks: number;
  profileId: VoicePersonaId;
  languageId: VoiceLanguageId;
  speed: SpeedOption;
  volume: number;
}

type PlaybackListener = (state: VoicePlaybackState) => void;

/**
 * High-performance, fast audio voice playback controller.
 * Handles sentence-by-sentence streaming, interruption, pause/resume, replay, and speed controls.
 */
class VoiceEngineController {
  private chunks: string[] = [];
  private currentChunkIndex = 0;
  private currentProfile: VoiceProfile = VOICE_PROFILES[0];
  private currentLanguageId: VoiceLanguageId = 'hi';
  private currentSpeed: SpeedOption = 1;
  private currentVolume = 1;
  private isSpeaking = false;
  private isPaused = false;
  private activeText: string | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<PlaybackListener> = new Set();
  private browserVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.browserVoices = window.speechSynthesis.getVoices();
    }
  }

  public subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((l) => l(state));
  }

  public getState(): VoicePlaybackState {
    return {
      isPlaying: this.isSpeaking,
      isPaused: this.isPaused,
      activeText: this.activeText,
      currentChunkIndex: this.currentChunkIndex,
      totalChunks: this.chunks.length,
      profileId: this.currentProfile.id,
      languageId: this.currentLanguageId,
      speed: this.currentSpeed,
      volume: this.currentVolume,
    };
  }

  public speak(
    text: string,
    options?: {
      profileId?: VoicePersonaId;
      languageId?: VoiceLanguageId;
      speed?: SpeedOption;
      volume?: number;
    }
  ) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this environment');
      return;
    }

    this.stop();

    if (options?.profileId) {
      const found = VOICE_PROFILES.find((p) => p.id === options.profileId);
      if (found) this.currentProfile = found;
    }

    if (options?.languageId) {
      this.currentLanguageId = options.languageId;
    }

    if (options?.speed !== undefined) {
      this.currentSpeed = options.speed;
    }

    if (options?.volume !== undefined) {
      this.currentVolume = options.volume;
    }

    this.activeText = text;
    this.chunks = splitIntoSpeechChunks(text);
    this.currentChunkIndex = 0;
    this.isSpeaking = true;
    this.isPaused = false;
    this.notify();

    this.playNextChunk();
  }

  private playNextChunk() {
    if (this.currentChunkIndex >= this.chunks.length) {
      this.stop();
      return;
    }

    const chunkText = this.chunks[this.currentChunkIndex];
    const utterance = new SpeechSynthesisUtterance(chunkText);

    // Pick best voice
    const matchedVoice = matchBestBrowserVoice(
      this.browserVoices,
      this.currentProfile,
      this.currentLanguageId
    );

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    // Set language
    const langObj = VOICE_LANGUAGES.find((l) => l.id === this.currentLanguageId);
    if (langObj) {
      utterance.lang = langObj.code;
    }

    // Calculate effective pitch and rate
    const calculatedRate = Math.max(0.5, Math.min(2.5, this.currentSpeed * this.currentProfile.rateMultiplier));
    const calculatedPitch = Math.max(0.5, Math.min(1.8, this.currentProfile.pitch));

    utterance.rate = calculatedRate;
    utterance.pitch = calculatedPitch;
    utterance.volume = this.currentVolume;

    utterance.onend = () => {
      this.currentChunkIndex++;
      this.notify();
      this.playNextChunk();
    };

    utterance.onerror = (e) => {
      // Ignore canceled error on intentional stop
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        console.warn('Speech synthesis chunk error:', e.error);
      }
      this.stop();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.isSpeaking) {
      window.speechSynthesis.pause();
      this.isPaused = true;
      this.notify();
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && this.isPaused) {
      window.speechSynthesis.resume();
      this.isPaused = false;
      this.notify();
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.isSpeaking = false;
    this.isPaused = false;
    this.currentChunkIndex = 0;
    this.currentUtterance = null;
    this.notify();
  }

  public replay() {
    if (this.activeText) {
      const txt = this.activeText;
      this.stop();
      this.speak(txt, {
        profileId: this.currentProfile.id,
        languageId: this.currentLanguageId,
        speed: this.currentSpeed,
        volume: this.currentVolume,
      });
    }
  }

  public setSpeed(speed: SpeedOption) {
    this.currentSpeed = speed;
    this.notify();
    // If currently speaking, restart current chunk with new rate
    if (this.isSpeaking && !this.isPaused && this.activeText) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      this.playNextChunk();
    }
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    this.notify();
    if (this.currentUtterance) {
      this.currentUtterance.volume = this.currentVolume;
    }
  }

  public previewVoice(profileId: VoicePersonaId, languageId: VoiceLanguageId, speed: SpeedOption = 1) {
    const profile = VOICE_PROFILES.find((p) => p.id === profileId) || VOICE_PROFILES[0];
    const sample = languageId === 'hi' || languageId === 'hinglish' ? profile.previewSampleHi : profile.previewSampleEn;
    this.speak(sample, {
      profileId,
      languageId,
      speed,
      volume: this.currentVolume,
    });
  }
}

export const voiceEngine = new VoiceEngineController();
