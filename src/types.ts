export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  isImage: boolean;
  base64?: string;
  textContent?: string;
  previewUrl?: string;
}

export interface GeneratedImageData {
  url: string;
  prompt: string;
  revisedPrompt?: string;
  aspectRatio?: string;
  width?: number;
  height?: number;
  modelUsed?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  isEdited?: boolean;
  editedAt?: number;
  files?: AttachedFile[];
  feedback?: 'like' | 'dislike' | null;
  modelUsed?: string;
  isError?: boolean;
  isStreaming?: boolean;
  toolsUsed?: string[];
  sources?: Array<{ title: string; url: string; snippet?: string }>;
  generatedImage?: GeneratedImageData;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  pinned?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  createdAt: number;
}

export interface ModelOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  isDefault?: boolean;
}

export type VoicePersonaId =
  | 'friendly'
  | 'professional'
  | 'deep'
  | 'soft'
  | 'energetic'
  | 'calm'
  | 'male'
  | 'female';

export type VoiceLanguageId =
  | 'hi'
  | 'en'
  | 'hinglish'
  | 'bn'
  | 'ta'
  | 'te'
  | 'mr'
  | 'gu'
  | 'pa'
  | string;

export interface VoiceProfile {
  id: VoicePersonaId;
  name: string;
  persona: string;
  description: string;
  gender: 'Female' | 'Male';
  tone: string;
  pitch: number;
  rateMultiplier: number;
  color: string;
  previewSampleEn: string;
  previewSampleHi: string;
}

export interface VoiceLanguage {
  id: VoiceLanguageId;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  previewSample: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  fontSize: 'sm' | 'md' | 'lg';
  selectedModel: string;
  systemPrompt: string;
  temperature: number;
  voiceAutoplay: boolean;
  speechRate: number;
  webSearchEnabled: boolean;
  mathSolverEnabled: boolean;
  selectedVoiceId: VoicePersonaId;
  selectedVoiceLanguage: VoiceLanguageId;
  voicePitch: number;
  voiceVolume: number;
}

export interface AdminMetrics {
  totalRequests: number;
  totalTokensApprox: number;
  activeUsersNow: number;
  totalRegisteredUsers: number;
  uptimeSeconds: number;
  reportedMessages: Array<{
    id: string;
    user: string;
    reason: string;
    messageId?: string;
    timestamp: string;
    status: string;
  }>;
}

export interface ServerCreatorInfo {
  name: string;
  role: string;
  email: string;
  bio: string;
}

export interface ServerVersionInfo {
  appName: string;
  version: string;
  buildId: string;
  updatedAt: string;
  creator: ServerCreatorInfo;
}
