import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Radio,
} from 'lucide-react';
import { AppSettings } from '../types';
import {
  SPEED_OPTIONS,
  SpeedOption,
  VOICE_LANGUAGES,
  VOICE_PROFILES,
  VoicePlaybackState,
  voiceEngine,
} from '../utils/voiceSystem';

interface VoicePlayerBarProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenVoiceMode: () => void;
  isDark: boolean;
}

export const VoicePlayerBar: React.FC<VoicePlayerBarProps> = ({
  settings,
  onUpdateSettings,
  onOpenVoiceMode,
  isDark,
}) => {
  const [playbackState, setPlaybackState] = useState<VoicePlaybackState>(voiceEngine.getState());
  const [volume, setVolume] = useState(settings.voiceVolume || 1);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const unsub = voiceEngine.subscribe((state) => {
      setPlaybackState(state);
      if (state.isPlaying) {
        setIsDismissed(false);
      }
    });
    return unsub;
  }, []);

  if (isDismissed || (!playbackState.isPlaying && !playbackState.activeText)) {
    return null;
  }

  const activeProfile =
    VOICE_PROFILES.find((p) => p.id === playbackState.profileId) || VOICE_PROFILES[0];
  const activeLang =
    VOICE_LANGUAGES.find((l) => l.id === playbackState.languageId) || VOICE_LANGUAGES[0];

  const handlePlayPause = () => {
    if (playbackState.isPlaying) {
      if (playbackState.isPaused) {
        voiceEngine.resume();
      } else {
        voiceEngine.pause();
      }
    } else {
      voiceEngine.replay();
    }
  };

  const handleStop = () => {
    voiceEngine.stop();
  };

  const handleReplay = () => {
    voiceEngine.replay();
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

  const progressPercent =
    playbackState.totalChunks > 0
      ? Math.round(((playbackState.currentChunkIndex + 1) / playbackState.totalChunks) * 100)
      : 0;

  return (
    <div
      id="voice-player-bar"
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-xl rounded-2xl border shadow-2xl backdrop-blur-md px-4 py-2.5 transition-all duration-300 animate-in slide-in-from-bottom-3 ${
        isDark
          ? 'bg-[#18181b]/95 border-zinc-700/80 text-white shadow-black/60'
          : 'bg-white/95 border-gray-200 text-gray-900 shadow-xl'
      }`}
    >
      {/* Top row: Voice Info & Close */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-2 h-2 rounded-full ${
              playbackState.isPlaying && !playbackState.isPaused
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-zinc-500'
            }`}
          />
          <span className="font-semibold text-xs tracking-wide truncate">
            {activeProfile.name}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 whitespace-nowrap">
            {activeLang.flag} {activeLang.nativeName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVoiceMode}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <Radio className="w-3 h-3" />
            <span>Voice Mode</span>
          </button>
          <button
            onClick={() => {
              voiceEngine.stop();
              setIsDismissed(true);
            }}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200"
            title="Dismiss player"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Middle row: Progress Bar */}
      {playbackState.totalChunks > 1 && (
        <div className="w-full bg-zinc-700/40 rounded-full h-1 mb-2 overflow-hidden">
          <div
            className="bg-indigo-500 h-full rounded-full transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Bottom Controls Row: Play/Pause, Replay, Stop, Speed, Volume */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Playback buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePlayPause}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors cursor-pointer"
            title={playbackState.isPlaying && !playbackState.isPaused ? 'Pause' : 'Play'}
          >
            {playbackState.isPlaying && !playbackState.isPaused ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5 ml-0.5" />
            )}
          </button>

          <button
            onClick={handleReplay}
            className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
            title="Replay"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleStop}
            className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
            title="Stop"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Buttons */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-zinc-400 font-medium mr-0.5">Speed:</span>
          {SPEED_OPTIONS.map((spd) => (
            <button
              key={spd}
              onClick={() => handleSpeedChange(spd)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                settings.speechRate === spd
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800/40 hover:bg-zinc-700 text-zinc-400'
              }`}
            >
              {spd}×
            </button>
          ))}
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleVolumeChange(volume > 0 ? 0 : 1)}
            className="text-zinc-400 hover:text-zinc-200"
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
            className="w-14 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
        </div>
      </div>
    </div>
  );
};
