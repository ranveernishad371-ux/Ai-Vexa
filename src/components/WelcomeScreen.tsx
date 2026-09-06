import React from 'react';
import {
  Sparkles,
  BookOpen,
  PenTool,
  Code2,
  Lightbulb,
  Image as ImageIcon,
  Mic,
  FileText,
  Calculator,
} from 'lucide-react';
import { AppSettings } from '../types';

interface WelcomeScreenProps {
  settings: AppSettings;
  onSelectPrompt: (prompt: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  settings,
  onSelectPrompt,
}) => {
  const isDark = settings.theme === 'dark';

  const suggestionCards = [
    {
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      title: 'Explain something to me',
      description: 'Explain quantum computing or black holes like I am five',
      prompt: 'Explain quantum computing in simple, easy-to-understand terms with everyday analogies.',
    },
    {
      icon: ImageIcon,
      color: 'from-purple-500 to-pink-500',
      title: 'Generate AI Images',
      description: 'Create Minecraft thumbnails, futuristic cities, Discord logos & landscapes',
      prompt: 'Create a Minecraft thumbnail',
    },
    {
      icon: Code2,
      color: 'from-emerald-500 to-teal-500',
      title: 'Help me with coding',
      description: 'Write a responsive TypeScript component with Tailwind',
      prompt: 'Write a clean, responsive TypeScript React component for an image gallery with Tailwind CSS.',
    },
    {
      icon: Lightbulb,
      color: 'from-amber-500 to-orange-500',
      title: 'Give me creative ideas',
      description: 'Brainstorm 5 innovative startup ideas using AI automation',
      prompt: 'Give me 5 unique, viable startup ideas in AI automation that solve everyday business problems.',
    },
  ];

  const capabilityHighlights = [
    { icon: ImageIcon, label: 'Neural Image Generation' },
    { icon: FileText, label: 'Document & PDF Ingestion' },
    { icon: Mic, label: 'Voice Input & Read Aloud' },
    { icon: Calculator, label: 'Math & STEM Logic' },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full text-center">
      {/* Center Icon Glow */}
      <div className="mb-5 relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 mx-auto">
          <Sparkles className="w-8 h-8 text-white animate-pulse" />
        </div>
      </div>

      {/* Main Center Headline */}
      <h1
        id="welcome-heading"
        className={`text-2xl sm:text-4xl font-bold tracking-tight mb-2.5 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
      >
        How can I help you today?
      </h1>

      {/* Short Description */}
      <p
        className={`text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed ${
          isDark ? 'text-[#A0A0A0]' : 'text-gray-600'
        }`}
      >
        Ask questions, learn new things, write content and get help with your ideas.
      </p>

      {/* 4 Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full mb-8">
        {suggestionCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              id={`welcome-suggestion-${idx}`}
              onClick={() => onSelectPrompt(card.prompt)}
              className={`p-4 rounded-2xl text-left border transition-all duration-200 group flex items-start gap-3.5 ${
                isDark
                  ? 'bg-[#252525] border-[#343434] hover:border-indigo-500/50 hover:bg-[#2c2c2c] text-white'
                  : 'bg-white border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-gray-900 shadow-xs'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color} text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs sm:text-sm mb-1 group-hover:text-indigo-400 transition-colors">
                  {card.title}
                </div>
                <div
                  className={`text-xs line-clamp-2 leading-relaxed ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  {card.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Capability badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs opacity-75">
        {capabilityHighlights.map((cap, i) => {
          const Icon = cap.icon;
          return (
            <div
              key={i}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-medium ${
                isDark
                  ? 'border-[#333333] bg-[#222222] text-gray-300'
                  : 'border-gray-200 bg-gray-100/80 text-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-indigo-400" />
              <span>{cap.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
