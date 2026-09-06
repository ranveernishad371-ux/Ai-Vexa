import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Palette,
  MessageSquare,
  Cpu,
  Trash2,
  Download,
  Upload,
  Check,
  Shield,
  RefreshCw,
  Sparkles,
  Info,
  ExternalLink,
  Volume2,
  VolumeX,
  Globe,
  Play,
  Square,
  Radio,
} from 'lucide-react';
import { AppSettings, ModelOption, ServerVersionInfo, User, VoiceLanguageId, VoicePersonaId } from '../types';
import {
  SPEED_OPTIONS,
  SpeedOption,
  VOICE_LANGUAGES,
  VOICE_PROFILES,
  voiceEngine,
} from '../utils/voiceSystem';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  user: User;
  onUpdateUser: (updatedUser: Partial<User>) => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  models: ModelOption[];
  onClearHistory: () => void;
  onExportHistory: () => void;
  onImportHistory: (importedJson: string) => void;
  serverInfo?: ServerVersionInfo | null;
  hasUpdate?: boolean;
  isCheckingUpdates?: boolean;
  onCheckForUpdates?: () => void;
  onApplyUpdate?: () => void;
  onOpenVoiceMode?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'appearance',
  user,
  onUpdateUser,
  settings,
  onUpdateSettings,
  models,
  onClearHistory,
  onExportHistory,
  onImportHistory,
  serverInfo,
  hasUpdate,
  isCheckingUpdates,
  onCheckForUpdates,
  onApplyUpdate,
  onOpenVoiceMode,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [nameInput, setNameInput] = useState(user.name);
  const [emailInput, setEmailInput] = useState(user.email);
  const [avatarInput, setAvatarInput] = useState(user.avatar);
  const [systemPromptInput, setSystemPromptInput] = useState(settings.systemPrompt);
  const [profileSaved, setProfileSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

  if (!isOpen) return null;

  const isDark = settings.theme === 'dark';

  const avatarPresets = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name: nameInput.trim() || 'User',
      email: emailInput.trim(),
      avatar: avatarInput,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) onImportHistory(content);
    };
    reader.readAsText(file);
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        id="settings-modal-card"
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] ${
          isDark
            ? 'bg-[#1e1e1e] border-[#303030] text-white'
            : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        {/* Left Tabs Navigation */}
        <div
          className={`w-full md:w-52 p-3 sm:p-4 border-b md:border-b-0 md:border-r shrink-0 ${
            isDark ? 'bg-[#181818] border-[#2b2b2b]' : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between md:mb-4">
            <span className="font-bold text-sm tracking-tight">Settings</span>
            <button
              onClick={onClose}
              className="md:hidden p-1 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'appearance'
                  ? isDark
                    ? 'bg-[#282828] text-indigo-400 font-semibold shadow-xs'
                    : 'bg-white text-indigo-600 font-semibold shadow-xs'
                  : isDark
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-[#222222]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Appearance</span>
            </button>

            <button
              onClick={() => setActiveTab('voice')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'voice'
                  ? isDark
                    ? 'bg-[#282828] text-indigo-400 font-semibold shadow-xs'
                    : 'bg-white text-indigo-600 font-semibold shadow-xs'
                  : isDark
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-[#222222]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Voice</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'account'
                  ? isDark
                    ? 'bg-[#282828] text-indigo-400 font-semibold shadow-xs'
                    : 'bg-white text-indigo-600 font-semibold shadow-xs'
                  : isDark
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-[#222222]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Account</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'chat'
                  ? isDark
                    ? 'bg-[#282828] text-indigo-400 font-semibold shadow-xs'
                    : 'bg-white text-indigo-600 font-semibold shadow-xs'
                  : isDark
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-[#222222]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat History</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'ai'
                  ? isDark
                    ? 'bg-[#282828] text-indigo-400 font-semibold shadow-xs'
                    : 'bg-white text-indigo-600 font-semibold shadow-xs'
                  : isDark
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-[#222222]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>AI Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('updates')}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === 'updates'
                  ? isDark
                    ? 'bg-[#282828] text-indigo-400 font-semibold shadow-xs'
                    : 'bg-white text-indigo-600 font-semibold shadow-xs'
                  : isDark
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-[#222222]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <RefreshCw className={`w-4 h-4 ${isCheckingUpdates ? 'animate-spin' : ''}`} />
                <span>Updates & About</span>
              </div>
              {hasUpdate && (
                <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-gray-500/15">
            <h3 className="font-semibold text-sm capitalize">
              {activeTab === 'ai'
                ? 'AI Preferences'
                : activeTab === 'voice'
                ? 'Voice & Speech Settings'
                : `${activeTab} Settings`}
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Settings Panel */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <label className="font-semibold block mb-1">Color Theme</label>
                  <p className="text-xs text-gray-400 mb-3">
                    Choose between dark mode or light mode.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ theme: 'dark' })}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        isDark
                          ? 'border-indigo-500 bg-indigo-500/10 text-white font-medium'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#171717] border border-gray-600" />
                        <span>Dark Modern</span>
                      </div>
                      {isDark && <Check className="w-4 h-4 text-indigo-400" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ theme: 'light' })}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        !isDark
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-900 font-medium'
                          : 'border-gray-700 hover:bg-[#282828] text-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-white border border-gray-300" />
                        <span>Light Mode</span>
                      </div>
                      {!isDark && <Check className="w-4 h-4 text-indigo-600" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1">Font Size</label>
                  <p className="text-xs text-gray-400 mb-3">
                    Adjust text scaling for chat bubbles.
                  </p>
                  <div className="flex gap-2">
                    {(['sm', 'md', 'lg'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => onUpdateSettings({ fontSize: size })}
                        className={`flex-1 py-2 px-3 rounded-lg border text-xs capitalize font-medium transition-all ${
                          settings.fontSize === size
                            ? isDark
                              ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
                              : 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : isDark
                            ? 'border-gray-700 text-gray-300'
                            : 'border-gray-200 text-gray-700'
                        }`}
                      >
                        {size === 'sm' ? 'Compact' : size === 'md' ? 'Default' : 'Comfortable'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="font-semibold block mb-1 text-xs">Profile Picture</label>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={avatarInput}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500"
                    />
                    <div className="flex gap-2">
                      {avatarPresets.map((preset, i) => (
                        <img
                          key={i}
                          src={preset}
                          alt="Preset"
                          onClick={() => setAvatarInput(preset)}
                          className={`w-8 h-8 rounded-full object-cover cursor-pointer border-2 transition-transform hover:scale-105 ${
                            avatarInput === preset ? 'border-indigo-500' : 'border-transparent'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-xs">Full Name</label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className={`w-full text-xs px-3 py-2 rounded-xl outline-none border ${
                      isDark
                        ? 'bg-[#262626] border-[#383838] text-white focus:border-indigo-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-xs">Email Address</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className={`w-full text-xs px-3 py-2 rounded-xl outline-none border ${
                      isDark
                        ? 'bg-[#262626] border-[#383838] text-white focus:border-indigo-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
                    }`}
                  />
                </div>

                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span>Role Access:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateUser({
                        role: user.role === 'admin' ? 'user' : 'admin',
                      })
                    }
                    className="font-bold uppercase tracking-wider text-[10px] px-2 py-1 rounded bg-indigo-600 text-white"
                  >
                    Switch to {user.role === 'admin' ? 'User' : 'Admin'}
                  </button>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Save Account Changes
                  </button>
                  {profileSaved && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5" /> Saved!
                    </span>
                  )}
                </div>
              </form>
            )}

            {/* Chat History Tab */}
            {activeTab === 'chat' && (
              <div className="space-y-6">
                <div>
                  <label className="font-semibold block mb-1">Backup & Export</label>
                  <p className="text-xs text-gray-400 mb-3">
                    Export your conversations to a local JSON file or import previous chats.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={onExportHistory}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Chats (JSON)</span>
                    </button>

                    <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-600 hover:bg-gray-700/30 cursor-pointer text-xs font-medium">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Import Chats</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportFile}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-500/15">
                  <label className="font-semibold block mb-1 text-rose-400">Danger Zone</label>
                  <p className="text-xs text-gray-400 mb-3">
                    Permanently delete all chat conversations from this browser.
                  </p>
                  <button
                    onClick={() => {
                      if (!confirmClear) {
                        setConfirmClear(true);
                        setTimeout(() => setConfirmClear(false), 4000);
                        return;
                      }
                      onClearHistory();
                      onClose();
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                      confirmClear
                        ? 'bg-rose-600 text-white border-rose-500 shadow-md animate-pulse'
                        : 'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{confirmClear ? 'Click again to permanently erase all chats' : 'Clear All Chat History'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* AI Tab */}
            {activeTab === 'ai' && (
              <div className="space-y-5">
                <div>
                  <label className="font-semibold block mb-1 text-xs">Default Model</label>
                  <p className="text-xs text-gray-400 mb-2">
                    Select the default model for new chats.
                  </p>
                  <div className="space-y-2">
                    {models.map((model) => (
                      <div
                        key={model.id}
                        onClick={() => onUpdateSettings({ selectedModel: model.id })}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          settings.selectedModel === model.id
                            ? isDark
                              ? 'border-indigo-500 bg-indigo-500/15 text-white'
                              : 'border-indigo-500 bg-indigo-50 text-indigo-900'
                            : isDark
                            ? 'border-gray-700 hover:bg-[#252525] text-gray-300'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div>
                          <div className="font-semibold text-xs flex items-center gap-1.5">
                            <span>{model.name}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 font-normal">
                              {model.badge}
                            </span>
                          </div>
                          <div className="text-[11px] opacity-75 mt-0.5">
                            {model.description}
                          </div>
                        </div>
                        {settings.selectedModel === model.id && (
                          <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-xs">
                    Custom Instructions / System Prompt
                  </label>
                  <p className="text-xs text-gray-400 mb-2">
                    What would you like AI Vexa to know about you to provide better responses?
                  </p>
                  <textarea
                    rows={3}
                    value={systemPromptInput}
                    onChange={(e) => setSystemPromptInput(e.target.value)}
                    onBlur={() => onUpdateSettings({ systemPrompt: systemPromptInput })}
                    className={`w-full text-xs p-3 rounded-xl outline-none border ${
                      isDark
                        ? 'bg-[#262626] border-[#383838] text-white focus:border-indigo-500'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500'
                    }`}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-xs">Creativity / Temperature</label>
                    <span className="text-xs font-mono font-medium opacity-80">
                      {settings.temperature}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    value={settings.temperature}
                    onChange={(e) =>
                      onUpdateSettings({ temperature: parseFloat(e.target.value) })
                    }
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Precise & Factual (0.1)</span>
                    <span>Balanced (0.7)</span>
                    <span>Creative & Expressive (1.0)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Voice & Speech Tab */}
            {activeTab === 'voice' && (
              <div className="space-y-6">
                {/* Voice Mode Quick Launch Card */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isDark
                      ? 'bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-zinc-900 border-indigo-500/30 text-white'
                      : 'bg-gradient-to-r from-indigo-50 via-purple-50 to-white border-indigo-200 text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shrink-0">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm">Voice Conversation Mode</h4>
                      <p className="text-[11px] text-zinc-400">
                        Speak via mic and listen to AI Vexa respond with natural speech.
                      </p>
                    </div>
                  </div>
                  {onOpenVoiceMode && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenVoiceMode();
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all whitespace-nowrap cursor-pointer"
                    >
                      Start Voice Mode
                    </button>
                  )}
                </div>

                {/* 1. Multiple Voice Personas Grid */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-xs sm:text-sm block">
                      AI Voice Persona (8 Options)
                    </label>
                    <span className="text-[11px] text-indigo-400 font-medium">
                      Selected: {VOICE_PROFILES.find((p) => p.id === settings.selectedVoiceId)?.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    Select your preferred natural voice persona. Each voice has a distinct tone, cadence, and warmth.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {VOICE_PROFILES.map((profile) => {
                      const isSelected = settings.selectedVoiceId === profile.id;
                      const isPreviewing = previewingVoiceId === profile.id;

                      return (
                        <div
                          key={profile.id}
                          onClick={() => onUpdateSettings({ selectedVoiceId: profile.id })}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                            isSelected
                              ? isDark
                                ? 'bg-indigo-950/30 border-indigo-500 ring-1 ring-indigo-500/50'
                                : 'bg-indigo-50/70 border-indigo-500 ring-1 ring-indigo-500/50'
                              : isDark
                              ? 'bg-[#222225] border-zinc-800 hover:border-zinc-700'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div>
                              <div className="font-semibold text-xs flex items-center gap-1.5">
                                <span>{profile.name}</span>
                                {isSelected && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
                                  {profile.gender}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                                  {profile.tone}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>

                          <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
                            {profile.description}
                          </p>

                          {/* Listen Preview Button */}
                          <div className="pt-2 border-t border-zinc-700/30 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isPreviewing) {
                                  voiceEngine.stop();
                                  setPreviewingVoiceId(null);
                                } else {
                                  setPreviewingVoiceId(profile.id);
                                  voiceEngine.previewVoice(
                                    profile.id,
                                    settings.selectedVoiceLanguage,
                                    settings.speechRate as SpeedOption
                                  );
                                  setTimeout(() => {
                                    setPreviewingVoiceId((curr) =>
                                      curr === profile.id ? null : curr
                                    );
                                  }, 4500);
                                }
                              }}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                                isPreviewing
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : isDark
                                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              {isPreviewing ? (
                                <>
                                  <Square className="w-3 h-3 fill-current" />
                                  <span>Stop Preview</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>Listen Preview</span>
                                </>
                              )}
                            </button>

                            {isSelected && (
                              <span className="text-[10px] text-emerald-400 font-medium">
                                Active Voice
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Spoken Language Selection */}
                <div>
                  <label className="font-semibold text-xs sm:text-sm block mb-1">
                    Spoken Language Support
                  </label>
                  <p className="text-xs text-gray-400 mb-2.5">
                    AI Vexa will automatically synthesize voice in your selected language dialect.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {VOICE_LANGUAGES.map((lang) => {
                      const isLangSelected = settings.selectedVoiceLanguage === lang.id;
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() =>
                            onUpdateSettings({ selectedVoiceLanguage: lang.id as VoiceLanguageId })
                          }
                          className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                            isLangSelected
                              ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 font-semibold'
                              : isDark
                              ? 'border-zinc-800 bg-[#222225] text-zinc-300 hover:bg-zinc-800'
                              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{lang.flag}</span>
                            <div>
                              <div className="text-xs font-medium">{lang.name}</div>
                              <div className="text-[10px] text-zinc-400">{lang.nativeName}</div>
                            </div>
                          </div>
                          {isLangSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Speech Speed Control */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-xs sm:text-sm">Speech Speed</label>
                    <span className="text-xs font-mono text-indigo-400 font-semibold">
                      {settings.speechRate}×
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2.5">
                    Adjust how fast AI Vexa speaks (0.75× to 2×).
                  </p>
                  <div className="flex items-center gap-2">
                    {SPEED_OPTIONS.map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => {
                          onUpdateSettings({ speechRate: spd });
                          voiceEngine.setSpeed(spd);
                        }}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                          settings.speechRate === spd
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                            : isDark
                            ? 'bg-[#222225] border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {spd}×
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Speech Volume Control */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-xs sm:text-sm">Speech Volume</label>
                    <span className="text-xs font-mono text-indigo-400 font-semibold">
                      {Math.round((settings.voiceVolume ?? 1) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const newVol = (settings.voiceVolume ?? 1) > 0 ? 0 : 1;
                        onUpdateSettings({ voiceVolume: newVol });
                        voiceEngine.setVolume(newVol);
                      }}
                      className="text-zinc-400 hover:text-zinc-200"
                    >
                      {(settings.voiceVolume ?? 1) === 0 ? (
                        <VolumeX className="w-4 h-4 text-rose-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-indigo-400" />
                      )}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={settings.voiceVolume ?? 1}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onUpdateSettings({ voiceVolume: val });
                        voiceEngine.setVolume(val);
                      }}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>

                {/* 5. Auto-play Toggle */}
                <div className="pt-3 border-t border-zinc-700/30 flex items-center justify-between">
                  <div>
                    <label className="font-semibold text-xs sm:text-sm block">
                      Auto-speak AI Responses
                    </label>
                    <p className="text-xs text-gray-400">
                      Automatically play speech whenever AI Vexa completes a response.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ voiceAutoplay: !settings.voiceAutoplay })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      settings.voiceAutoplay ? 'bg-indigo-600' : isDark ? 'bg-zinc-700' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        settings.voiceAutoplay ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Updates & About Tab */}
            {activeTab === 'updates' && (
              <div className="space-y-6">
                {/* Live Sync Status Banner */}
                <div
                  className={`p-4 rounded-xl border flex flex-col gap-3 ${
                    hasUpdate
                      ? 'border-pink-500/40 bg-pink-500/10'
                      : isDark
                      ? 'border-indigo-500/20 bg-indigo-500/5'
                      : 'border-indigo-100 bg-indigo-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-white">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs sm:text-sm flex items-center gap-2">
                          <span>AI Vexa Live Cloud Updates</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                            Auto-Sync Active
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400">
                          Unified Link Architecture • No app re-installation required
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onCheckForUpdates}
                      disabled={isCheckingUpdates}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                        isDark
                          ? 'border-[#383838] bg-[#282828] hover:bg-[#333333] text-gray-200'
                          : 'border-gray-200 bg-white hover:bg-gray-100 text-gray-800 shadow-xs'
                      }`}
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${isCheckingUpdates ? 'animate-spin' : ''}`}
                      />
                      <span>{isCheckingUpdates ? 'Checking...' : 'Check Server'}</span>
                    </button>
                  </div>

                  {hasUpdate && (
                    <div className="pt-2 border-t border-pink-500/20 flex items-center justify-between">
                      <span className="text-xs text-pink-400 font-medium">
                        ✨ A new update is available on the server!
                      </span>
                      <button
                        type="button"
                        onClick={onApplyUpdate}
                        className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-pink-600 text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-all shadow-xs"
                      >
                        Refresh to Apply
                      </button>
                    </div>
                  )}
                </div>

                {/* Architecture Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    className={`p-3.5 rounded-xl border ${
                      isDark ? 'border-[#303030] bg-[#222222]' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block mb-1">
                      System Version
                    </span>
                    <span className="font-bold text-sm block">
                      AI Vexa v{serverInfo?.version || '2.5.1'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
                      Build: {serverInfo?.buildId || 'Production Live'}
                    </span>
                  </div>

                  <div
                    className={`p-3.5 rounded-xl border ${
                      isDark ? 'border-[#303030] bg-[#222222]' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 block mb-1">
                      Cache-Control & Sync
                    </span>
                    <span className="font-bold text-sm text-emerald-500 flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      Strict Anti-Stale
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      no-cache, must-revalidate headers
                    </span>
                  </div>
                </div>

                {/* Creator Information Section */}
                <div
                  className={`p-4 rounded-xl border ${
                    isDark ? 'border-[#303030] bg-[#222222]' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-xs">
                      RN
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">
                        {serverInfo?.creator.name || 'Ranveer Nishad'}
                      </h4>
                      <p className="text-xs text-indigo-400 font-medium">
                        {serverInfo?.creator.role || 'Creator & Lead Developer'}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed mb-3">
                    {serverInfo?.creator.bio ||
                      'AI Vexa was conceptualized, designed, and developed by Ranveer Nishad.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-500/15 text-[11px] text-gray-400">
                    <span className="font-mono">{serverInfo?.creator.email || 'ranveernishad830@gmail.com'}</span>
                    <span>•</span>
                    <span>Unified Cloud Server</span>
                  </div>
                </div>

                {/* Explanation of Server Updates */}
                <div
                  className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                    isDark ? 'border-[#2e2e2e] bg-[#1a1a1a] text-gray-300' : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  <p className="font-semibold text-gray-200 mb-1 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-400" />
                    How Automatic Updates Work:
                  </p>
                  <p>
                    When new code, features, creator information, or AI instructions are deployed on the server, all users get the update automatically on the <strong>same official link</strong> without installing anything new. Simply refreshing or opening the page loads the latest version instantly with guaranteed cache invalidation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
