import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Globe,
  Radio,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import { AppSettings, ChatMessage, VoiceLanguageId, VoicePersonaId } from '../types';
import {
  SPEED_OPTIONS,
  SpeedOption,
  VOICE_LANGUAGES,
  VOICE_PROFILES,
  VoicePlaybackState,
  voiceEngine,
} from '../utils/voiceSystem';

interface VoiceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onSendMessage: (
    text: string,
    files?: any[],
    options?: { silent?: boolean; isVoiceMode?: boolean }
  ) => Promise<string | null>;
  activeMessages: ChatMessage[];
  isDark: boolean;
}

type ConversationState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'paused';

export const VoiceModeModal: React.FC<VoiceModeModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onSendMessage,
  activeMessages,
  isDark,
}) => {
  const [convState, setConvState] = useState<ConversationState>('idle');
  const [userTranscript, setUserTranscript] = useState('');
  const [lastAiResponse, setLastAiResponse] = useState('');
  const [handsFree, setHandsFree] = useState(true);
  const [playbackState, setPlaybackState] = useState<VoicePlaybackState>(voiceEngine.getState());
  const [micMuted, setMicMuted] = useState(false);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [volume, setVolume] = useState(settings.voiceVolume || 1);

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const lastProcessedTranscript = useRef('');
  const isMountedRef = useRef(true);

  const activeProfile =
    VOICE_PROFILES.find((p) => p.id === settings.selectedVoiceId) || VOICE_PROFILES[0];
  const activeLang =
    VOICE_LANGUAGES.find((l) => l.id === settings.selectedVoiceLanguage) || VOICE_LANGUAGES[0];

  // Subscribe to voiceEngine state
  useEffect(() => {
    const unsub = voiceEngine.subscribe((state) => {
      setPlaybackState(state);
      if (state.isPlaying && !state.isPaused) {
        setConvState('speaking');
      } else if (state.isPaused) {
        setConvState('paused');
      } else if (convState === 'speaking' && !state.isPlaying) {
        // AI finished speaking, return to listening if hands-free
        if (handsFree && !micMuted) {
          startListening();
        } else {
          setConvState('idle');
        }
      }
    });
    return unsub;
  }, [handsFree, micMuted, convState]);

  // Setup Speech Recognition
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      voiceEngine.stop();
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = activeLang.code;

      recognition.onstart = () => {
        if (convState !== 'thinking' && convState !== 'speaking') {
          setConvState('listening');
        }
      };

      recognition.onresult = (event: any) => {
        // If AI is currently speaking and user starts talking, interrupt AI!
        if (voiceEngine.getState().isPlaying) {
          voiceEngine.stop();
        }

        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + ' ';
        }

        const trimmed = fullTranscript.trim();
        setUserTranscript(trimmed);

        // Auto-send when silence is detected in Hands-Free mode
        if (handsFree && trimmed && trimmed !== lastProcessedTranscript.current) {
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            handleProcessUserSpeech(trimmed);
          }, 1400); // 1.4s of silence triggers sending
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('Voice Mode STT error:', event.error);
        }
      };

      recognition.onend = () => {
        // If still open and supposed to be listening in hands-free mode
        if (isOpen && handsFree && !micMuted && convState === 'listening') {
          try {
            recognition.start();
          } catch {
            // ignore
          }
        }
      };

      recognitionRef.current = recognition;

      // Start listening initially
      startListening();
    }

    return () => {
      stopListening();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [isOpen, activeLang.code, handsFree, micMuted]);

  const startListening = () => {
    if (recognitionRef.current && !micMuted) {
      try {
        recognitionRef.current.start();
        setConvState('listening');
      } catch {
        // already started or not allowed
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  };

  const handleProcessUserSpeech = async (transcript: string) => {
    if (!transcript.trim() || convState === 'thinking') return;

    lastProcessedTranscript.current = transcript.trim();
    stopListening();
    setConvState('thinking');

    try {
      // Send question to AI assistant
      const aiReply = await onSendMessage(transcript.trim(), [], { isVoiceMode: true });

      if (aiReply) {
        setLastAiResponse(aiReply);
        setUserTranscript(''); // Clear for next turn
        lastProcessedTranscript.current = '';

        // Speak the reply using the selected persona and language
        setConvState('speaking');
        voiceEngine.speak(aiReply, {
          profileId: settings.selectedVoiceId,
          languageId: settings.selectedVoiceLanguage,
          speed: settings.speechRate as SpeedOption,
          volume: volume,
        });
      } else {
        setConvState('idle');
        if (handsFree && !micMuted) startListening();
      }
    } catch (err) {
      console.error('Failed to process voice query:', err);
      setConvState('idle');
      if (handsFree && !micMuted) startListening();
    }
  };

  const handleManualSend = () => {
    if (userTranscript.trim()) {
      handleProcessUserSpeech(userTranscript.trim());
    }
  };

  const handleInterrupt = () => {
    voiceEngine.stop();
    setConvState('listening');
    setUserTranscript('');
    startListening();
  };

  const handleTogglePlayPause = () => {
    if (playbackState.isPlaying) {
      if (playbackState.isPaused) {
        voiceEngine.resume();
      } else {
        voiceEngine.pause();
      }
    } else if (lastAiResponse) {
      voiceEngine.speak(lastAiResponse, {
        profileId: settings.selectedVoiceId,
        languageId: settings.selectedVoiceLanguage,
        speed: settings.speechRate as SpeedOption,
        volume: volume,
      });
    }
  };

  const handleReplay = () => {
    if (lastAiResponse) {
      voiceEngine.speak(lastAiResponse, {
        profileId: settings.selectedVoiceId,
        languageId: settings.selectedVoiceLanguage,
        speed: settings.speechRate as SpeedOption,
        volume: volume,
      });
    }
  };

  const handleSelectVoice = (id: VoicePersonaId) => {
    onUpdateSettings({ selectedVoiceId: id });
    setShowVoiceMenu(false);
    // Voice preview
    voiceEngine.previewVoice(id, settings.selectedVoiceLanguage, settings.speechRate as SpeedOption);
  };

  const handleSelectLanguage = (langId: VoiceLanguageId) => {
    onUpdateSettings({ selectedVoiceLanguage: langId });
    setShowLangMenu(false);
    // Restart recognition with new language
    if (recognitionRef.current) {
      recognitionRef.current.lang =
        VOICE_LANGUAGES.find((l) => l.id === langId)?.code || 'hi-IN';
    }
    voiceEngine.previewVoice(settings.selectedVoiceId, langId, settings.speechRate as SpeedOption);
  };

  const handleSpeedChange = (speed: SpeedOption) => {
    onUpdateSettings({ speechRate: speed });
    voiceEngine.setSpeed(speed);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    onUpdateSettings({ voiceVolume: newVol });
    voiceEngine.setVolume(newVol);
  };

  if (!isOpen) return null;

  return (
    <div
      id="voice-mode-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col items-center justify-between min-h-[580px] max-h-[92vh] p-6 sm:p-8 ${
          isDark
            ? 'bg-gradient-to-b from-[#161618] via-[#111113] to-[#0d0d0f] border-zinc-800 text-white shadow-black/80'
            : 'bg-gradient-to-b from-slate-50 via-white to-slate-100 border-gray-200 text-gray-900 shadow-xl'
        }`}
      >
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400">
              AI Vexa Voice Mode
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Hands-Free Auto Mode Toggle */}
            <button
              onClick={() => setHandsFree((prev) => !prev)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all ${
                handsFree
                  ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40 shadow-xs'
                  : 'bg-zinc-800/40 text-zinc-400 border-zinc-700/40 hover:text-zinc-200'
              }`}
              title="Hands-free automatically detects speech pause"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{handsFree ? 'Hands-Free: On' : 'Push-to-Talk'}</span>
            </button>

            {/* Close button */}
            <button
              onClick={() => {
                voiceEngine.stop();
                stopListening();
                onClose();
              }}
              className="p-2 rounded-full hover:bg-zinc-800/50 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Exit Voice Mode"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Voice & Language Selectors */}
        <div className="flex items-center flex-wrap justify-center gap-2 mt-3 z-20">
          {/* Voice Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowVoiceMenu((prev) => !prev);
                setShowLangMenu(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isDark
                  ? 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-700 text-zinc-200'
                  : 'bg-white hover:bg-gray-100 border-gray-300 text-gray-800 shadow-xs'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeProfile.name}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {showVoiceMenu && (
              <div
                className={`absolute top-full left-0 mt-2 w-64 max-h-72 overflow-y-auto rounded-2xl border p-1.5 shadow-2xl z-50 ${
                  isDark
                    ? 'bg-[#1c1c1f] border-zinc-700 text-zinc-200'
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Select AI Voice
                </div>
                {VOICE_PROFILES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectVoice(p.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      p.id === settings.selectedVoiceId
                        ? 'bg-indigo-600 text-white font-medium'
                        : isDark
                        ? 'hover:bg-zinc-800 text-zinc-300'
                        : 'hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div
                        className={`text-[10px] ${
                          p.id === settings.selectedVoiceId ? 'text-indigo-200' : 'text-zinc-400'
                        }`}
                      >
                        {p.tone} • {p.gender}
                      </div>
                    </div>
                    {p.id === settings.selectedVoiceId && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLangMenu((prev) => !prev);
                setShowVoiceMenu(false);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isDark
                  ? 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-700 text-zinc-200'
                  : 'bg-white hover:bg-gray-100 border-gray-300 text-gray-800 shadow-xs'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>{activeLang.flag} {activeLang.name}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {showLangMenu && (
              <div
                className={`absolute top-full left-0 mt-2 w-56 max-h-72 overflow-y-auto rounded-2xl border p-1.5 shadow-2xl z-50 ${
                  isDark
                    ? 'bg-[#1c1c1f] border-zinc-700 text-zinc-200'
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Supported Languages
                </div>
                {VOICE_LANGUAGES.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleSelectLanguage(l.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors ${
                      l.id === settings.selectedVoiceLanguage
                        ? 'bg-indigo-600 text-white font-medium'
                        : isDark
                        ? 'hover:bg-zinc-800 text-zinc-300'
                        : 'hover:bg-gray-100 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{l.flag}</span>
                      <span>{l.nativeName}</span>
                    </div>
                    {l.id === settings.selectedVoiceLanguage && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Central Visualizer & Status Area */}
        <div className="flex-1 flex flex-col items-center justify-center my-4 w-full">
          {/* Animated Glowing Voice Orb */}
          <div className="relative flex items-center justify-center">
            {/* Ambient pulse glow */}
            <div
              className={`absolute w-44 h-44 rounded-full blur-2xl transition-all duration-700 ${
                convState === 'speaking'
                  ? 'bg-gradient-to-tr from-indigo-500/50 via-purple-500/40 to-pink-500/50 scale-125 animate-pulse'
                  : convState === 'listening'
                  ? 'bg-gradient-to-tr from-emerald-500/40 via-teal-500/40 to-cyan-500/40 scale-110'
                  : convState === 'thinking'
                  ? 'bg-gradient-to-tr from-amber-500/40 via-orange-500/40 to-rose-500/40 scale-105 animate-spin'
                  : 'bg-indigo-600/20 scale-95'
              }`}
            />

            {/* Core Animated Orb */}
            <div
              className={`relative w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl border ${
                convState === 'speaking'
                  ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 border-indigo-400 shadow-indigo-500/50 scale-105'
                  : convState === 'listening'
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 border-emerald-400 shadow-emerald-500/50 scale-100'
                  : convState === 'thinking'
                  ? 'bg-gradient-to-tr from-amber-600 to-rose-600 border-amber-400 shadow-amber-500/50'
                  : 'bg-zinc-800 border-zinc-700 shadow-black/40'
              }`}
            >
              {/* Dynamic Waveform Spectrum Bars inside orb */}
              <div className="flex items-center gap-1.5 h-14">
                {[18, 36, 52, 28, 48, 22, 40].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      height:
                        convState === 'speaking' || convState === 'listening'
                          ? `${Math.max(12, (h * (i % 2 === 0 ? 1.2 : 0.85)))}px`
                          : convState === 'thinking'
                          ? `${Math.max(8, (h * 0.4))}px`
                          : '8px',
                    }}
                    className={`w-1.5 rounded-full transition-all duration-150 ${
                      convState === 'speaking'
                        ? 'bg-white animate-pulse'
                        : convState === 'listening'
                        ? 'bg-emerald-100 animate-pulse'
                        : convState === 'thinking'
                        ? 'bg-amber-200'
                        : 'bg-zinc-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Status Label */}
          <div className="mt-6 text-center">
            <h4 className="text-base font-semibold tracking-wide">
              {convState === 'speaking'
                ? `AI Vexa is speaking (${activeProfile.name})`
                : convState === 'listening'
                ? 'Listening... Speak naturally'
                : convState === 'thinking'
                ? 'AI Vexa is processing...'
                : convState === 'paused'
                ? 'Speech paused'
                : 'Ready to converse'}
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              {convState === 'speaking'
                ? 'Tap mic or button below to interrupt'
                : convState === 'listening'
                ? `Language: ${activeLang.nativeName} • Say your question`
                : convState === 'thinking'
                ? 'Generating response...'
                : 'Tap microphone to start speaking'}
            </p>
          </div>

          {/* Live Transcript / Speech Bubbles */}
          <div className="w-full max-w-lg mt-4 px-3 max-h-32 overflow-y-auto flex flex-col gap-2 text-center">
            {userTranscript && (
              <div className="p-3 rounded-2xl bg-indigo-600/15 border border-indigo-500/20 text-xs text-indigo-300 inline-block mx-auto animate-in fade-in">
                <span className="font-semibold text-[11px] text-indigo-400 block mb-0.5">
                  You said:
                </span>
                "{userTranscript}"
              </div>
            )}
            {lastAiResponse && convState === 'speaking' && (
              <div className="p-3 rounded-2xl bg-zinc-800/40 border border-zinc-700/40 text-xs text-zinc-300 inline-block mx-auto line-clamp-3">
                <span className="font-semibold text-[11px] text-zinc-400 block mb-0.5">
                  AI Vexa:
                </span>
                {lastAiResponse}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Audio & Speech Controls */}
        <div className="w-full flex flex-col items-center gap-4 mt-auto">
          {/* Action Row: Interrupt / Play / Pause / Replay / Speed */}
          <div className="flex items-center justify-center flex-wrap gap-3">
            {/* Main Mic Toggle Button */}
            <button
              onClick={() => {
                if (convState === 'speaking') {
                  handleInterrupt();
                } else if (convState === 'listening') {
                  stopListening();
                  setConvState('idle');
                } else {
                  startListening();
                }
              }}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer ${
                convState === 'listening'
                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30 scale-105'
                  : convState === 'speaking'
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
              title={
                convState === 'speaking'
                  ? 'Tap to Interrupt & Ask Question'
                  : convState === 'listening'
                  ? 'Stop Listening'
                  : 'Start Speaking'
              }
            >
              {convState === 'speaking' ? (
                <Square className="w-5 h-5 fill-current" />
              ) : convState === 'listening' ? (
                <Mic className="w-6 h-6 animate-pulse" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>

            {/* Play / Pause Toggle */}
            {lastAiResponse && (
              <button
                onClick={handleTogglePlayPause}
                className="w-11 h-11 rounded-full border border-zinc-700/60 bg-zinc-800/60 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
                title={playbackState.isPaused ? 'Resume speech' : 'Pause speech'}
              >
                {playbackState.isPlaying && !playbackState.isPaused ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>
            )}

            {/* Replay Button */}
            {lastAiResponse && (
              <button
                onClick={handleReplay}
                className="w-11 h-11 rounded-full border border-zinc-700/60 bg-zinc-800/60 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center transition-colors cursor-pointer"
                title="Replay AI response"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Send manual transcript if not in hands-free */}
            {!handsFree && userTranscript && (
              <button
                onClick={handleManualSend}
                className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md transition-all cursor-pointer"
              >
                Send Question
              </button>
            )}
          </div>

          {/* Secondary Controls Bar: Speed & Volume */}
          <div className="w-full flex items-center justify-between pt-3 border-t border-zinc-800/60 text-xs">
            {/* Speed Options */}
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400 text-[11px] font-medium mr-1">Speed:</span>
              {SPEED_OPTIONS.map((spd) => (
                <button
                  key={spd}
                  onClick={() => handleSpeedChange(spd)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all ${
                    settings.speechRate === spd
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400'
                  }`}
                >
                  {spd}×
                </button>
              ))}
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVolumeChange(volume > 0 ? 0 : 1)}
                className="text-zinc-400 hover:text-zinc-200"
                title={volume === 0 ? 'Unmute' : 'Mute'}
              >
                {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-16 sm:w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />
              <span className="text-[10px] text-zinc-400 w-7">{Math.round(volume * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
