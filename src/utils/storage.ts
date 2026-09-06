import { AppSettings, Conversation, User } from '../types';
import { saveConversationsToDB, loadConversationsFromDB } from './idb';

const STORAGE_KEYS = {
  CONVERSATIONS: 'vexa_ai_conversations',
  LEGACY_CONVERSATIONS: 'nova_ai_conversations',
  CURRENT_CONVERSATION_ID: 'vexa_ai_active_id',
  LEGACY_ACTIVE_ID: 'nova_ai_active_id',
  USER: 'vexa_ai_user',
  LEGACY_USER: 'nova_ai_user',
  SETTINGS: 'vexa_ai_settings',
  LEGACY_SETTINGS: 'nova_ai_settings',
};

// Immediate cleanup of legacy keys to reclaim browser storage quota
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    localStorage.removeItem(STORAGE_KEYS.LEGACY_CONVERSATIONS);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_ACTIVE_ID);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_USER);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_SETTINGS);
  } catch {
    // Ignore environments where localStorage is restricted
  }
}

export { loadConversationsFromDB, saveConversationsToDB };

export const DEFAULT_USER: User = {
  id: 'usr-admin-1',
  name: 'Ranveer Nishad',
  email: 'ranveernishad830@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  role: 'admin',
  createdAt: Date.now() - 86400000 * 14,
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  fontSize: 'md',
  selectedModel: 'gemini-3.1-flash-lite',
  systemPrompt:
    'You are AI Vexa, a highly accurate, reliable, and intelligent AI companion. Always prioritize factual correctness over speed or speculation. Verify math step-by-step. If information is uncertain or unavailable, state so honestly.',
  temperature: 0.2,
  voiceAutoplay: false,
  speechRate: 1.0,
  webSearchEnabled: true,
  mathSolverEnabled: true,
  selectedVoiceId: 'friendly',
  selectedVoiceLanguage: 'hi',
  voicePitch: 1.0,
  voiceVolume: 1.0,
};

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-demo-1',
    title: 'Modern React & Full-Stack Guide',
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2,
    pinned: true,
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        text: 'How do React Server Components and modern state management work together?',
        timestamp: Date.now() - 3600000 * 2,
      },
      {
        id: 'msg-2',
        role: 'assistant',
        text: `### React Server Components & Modern Architecture

React Server Components (RSC) fundamentally redefine how frontend apps execute and deliver bundle sizes:

1. **Zero Client-Bundle Overhead**: Components that only read data or render markdown stay on the server.
2. **Direct Backend Access**: Query databases and APIs directly without exposing credentials to the client.
3. **Seamless Client Interactivity**: Interactive islands (marked with \`'use client'\`) handle state, animations, and inputs.

\`\`\`typescript
// Example: Combining Server Component with Client Interactive Island
export default async function DashboardPage() {
  const data = await fetchDashboardMetrics();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">AI Vexa Analytics</h1>
      <InteractiveFilter data={data} />
    </div>
  );
}
\`\`\`

Let me know if you would like me to show state persistence or caching patterns!`,
        timestamp: Date.now() - 3600000 * 2 + 2000,
        modelUsed: 'gemini-3.8-flash',
      },
    ],
  },
  {
    id: 'conv-demo-2',
    title: 'Creative Story & Script Pitch',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        text: 'Give me 3 original sci-fi short film concepts.',
        timestamp: Date.now() - 86400000 * 1,
      },
      {
        id: 'msg-4',
        role: 'assistant',
        text: `Here are 3 unique sci-fi concepts:

1. **Echoes in the Static**: A deep-space transmission operator discovers a radio frequency that broadcasts tomorrow's thoughts of whoever tunes into it.
2. **The Memory Sculptor**: In a world where emotional trauma can be surgically extracted and auctioned as museum art, an investigator uncovers stolen joy.
3. **Gravity's Whisper**: A team on a remote tidal planet discovers the tides are spelling mathematical equations that predict solar flares.`,
        timestamp: Date.now() - 86400000 * 1 + 1500,
        modelUsed: 'gemini-3.8-flash',
      },
    ],
  },
];

// Helper to strip heavy multi-megabyte base64 strings specifically from the localStorage cache copy
// (IndexedDB retains the complete, uncompressed original images and attachments)
function sanitizeForLocalStorage(conversations: Conversation[]): Conversation[] {
  return conversations.map((conv) => ({
    ...conv,
    messages: conv.messages.map((m) => {
      let msgCopy = { ...m };
      // If generated image URL is a huge base64 data URI (> 30KB), omit the heavy base64 from localStorage
      if (
        msgCopy.generatedImage?.url?.startsWith('data:') &&
        msgCopy.generatedImage.url.length > 30000
      ) {
        msgCopy = {
          ...msgCopy,
          generatedImage: {
            ...msgCopy.generatedImage,
            url: '', // LocalStorage copy is kept light; IndexedDB keeps full Base64
          },
        };
      }
      // If user uploaded heavy base64 attachments, trim base64 from localStorage copy
      if (msgCopy.files && msgCopy.files.length > 0) {
        msgCopy = {
          ...msgCopy,
          files: msgCopy.files.map((f) => ({
            ...f,
            base64: f.base64 && f.base64.length > 30000 ? undefined : f.base64,
            previewUrl: f.previewUrl && f.previewUrl.length > 30000 ? undefined : f.previewUrl,
          })),
        };
      }
      return msgCopy;
    }),
  }));
}

export function loadConversations(): Conversation[] {
  try {
    // 1. Try modern Vexa storage key
    let raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    // 2. If not found, check legacy Nova storage key and migrate
    if (!raw) {
      const legacyRaw = localStorage.getItem(STORAGE_KEYS.LEGACY_CONVERSATIONS);
      if (legacyRaw) {
        raw = legacyRaw;
        // Reclaim quota by clearing legacy key
        localStorage.removeItem(STORAGE_KEYS.LEGACY_CONVERSATIONS);
      }
    }

    if (!raw) {
      return INITIAL_CONVERSATIONS;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_CONVERSATIONS;
  } catch (err) {
    console.warn('[Storage] Error reading conversations from localStorage:', err);
    return INITIAL_CONVERSATIONS;
  }
}

export function saveConversations(conversations: Conversation[]): void {
  // 1. Always persist full conversations to IndexedDB (asynchronous, no 5MB quota limit)
  saveConversationsToDB(conversations).catch(() => {});

  // 2. Save compact copy to LocalStorage for instant synchronous startup
  try {
    const sanitized = sanitizeForLocalStorage(conversations);
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(sanitized));
    // Clean up legacy key to free browser quota
    localStorage.removeItem(STORAGE_KEYS.LEGACY_CONVERSATIONS);
  } catch (err: any) {
    // If quota exceeded, perform aggressive quota recovery
    try {
      localStorage.removeItem(STORAGE_KEYS.LEGACY_CONVERSATIONS);
      // Keep only active / recent 5 conversations with last 10 messages each in localStorage
      const minimal = conversations.slice(0, 5).map((c) => ({
        ...c,
        messages: c.messages.slice(-10).map((m) => ({
          id: m.id,
          role: m.role,
          text: m.text,
          timestamp: m.timestamp,
        })),
      }));
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(minimal));
    } catch {
      // LocalStorage is completely full; IndexedDB handles persistence safely
      console.warn('[Storage] LocalStorage quota reached; relying on IndexedDB for persistence.');
    }
  }
}

export function loadActiveConversationId(): string | null {
  return (
    localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID) ||
    localStorage.getItem(STORAGE_KEYS.LEGACY_ACTIVE_ID)
  );
}

export function saveActiveConversationId(id: string | null): void {
  if (id) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID, id);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_ACTIVE_ID);
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_ACTIVE_ID);
  }
}

export function loadUser(): User {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEYS.USER) ||
      localStorage.getItem(STORAGE_KEYS.LEGACY_USER);
    if (!raw) {
      return DEFAULT_USER;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_USER;
  }
}

export function saveUser(user: User): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.removeItem(STORAGE_KEYS.LEGACY_USER);
  } catch (err) {
    console.error('Failed to save user profile:', err);
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEYS.SETTINGS) ||
      localStorage.getItem(STORAGE_KEYS.LEGACY_SETTINGS);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    const parsed = JSON.parse(raw);
    // Auto-migrate deprecated models like gemini-2.5-flash or 2.0 to gemini-3.6-flash
    if (
      parsed.selectedModel === 'gemini-2.5-flash' ||
      parsed.selectedModel?.startsWith('gemini-2.') ||
      parsed.selectedModel?.startsWith('gemini-1.5')
    ) {
      parsed.selectedModel = 'gemini-3.6-flash';
      localStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify({ ...DEFAULT_SETTINGS, ...parsed })
      );
    }
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    localStorage.removeItem(STORAGE_KEYS.LEGACY_SETTINGS);
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

// Group conversations by time category for ChatGPT-like sidebar
export function groupConversations(conversations: Conversation[]) {
  const now = Date.now();
  const oneDay = 86400000;
  const sevenDays = oneDay * 7;

  const pinned: Conversation[] = [];
  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const pastSevenDays: Conversation[] = [];
  const older: Conversation[] = [];

  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  for (const conv of sorted) {
    if (conv.pinned) {
      pinned.push(conv);
      continue;
    }
    const age = now - conv.updatedAt;
    if (age < oneDay) {
      today.push(conv);
    } else if (age < oneDay * 2) {
      yesterday.push(conv);
    } else if (age < sevenDays) {
      pastSevenDays.push(conv);
    } else {
      older.push(conv);
    }
  }

  return { pinned, today, yesterday, pastSevenDays, older };
}
