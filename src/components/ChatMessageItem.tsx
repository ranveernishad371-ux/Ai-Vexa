import React, { useState } from 'react';
import Markdown from 'react-markdown';
import {
  Copy,
  Check,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  FileText,
  User as UserIcon,
  Sparkles,
  AlertCircle,
  Clock,
  ExternalLink,
  Calculator,
  Search,
  Image as ImageIcon,
  Pencil,
  Share2,
} from 'lucide-react';
import { ChatMessage, User } from '../types';
import { GeneratedImageCard } from './GeneratedImageCard';

interface ChatMessageItemProps {
  message: ChatMessage;
  user: User;
  isDark: boolean;
  onRegenerate?: () => void;
  onRegeneratePrompt?: (prompt: string) => void;
  onFeedback?: (id: string, type: 'like' | 'dislike') => void;
  onEditMessage?: (messageId: string, newText: string, shouldRegenerate?: boolean) => void;
  onShare?: () => void;
  isLastAssistant?: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  user,
  isDark,
  onRegenerate,
  onRegeneratePrompt,
  onFeedback,
  onEditMessage,
  onShare,
  isLastAssistant,
}) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const editInputRef = React.useRef<HTMLTextAreaElement | null>(null);

  const isUser = message.role === 'user';

  // Sync edit text when message text changes
  React.useEffect(() => {
    setEditText(message.text);
  }, [message.text]);

  // Focus and auto-size textarea when editing starts
  React.useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      const len = editInputRef.current.value.length;
      editInputRef.current.setSelectionRange(len, len);
      editInputRef.current.style.height = 'auto';
      editInputRef.current.style.height = `${Math.max(68, editInputRef.current.scrollHeight)}px`;
    }
  }, [isEditing]);

  const handleStartEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditText(message.text);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditText(message.text);
    setIsEditing(false);
  };

  const handleSaveEdit = (shouldRegenerate = false) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    if (onEditMessage) {
      onEditMessage(message.id, trimmed, shouldRegenerate);
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit(false);
    }
  };

  // Copy full message text
  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Text-To-Speech (SpeechSynthesis)
  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      setSpeechNotice('Not supported');
      setTimeout(() => setSpeechNotice(null), 3000);
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      // Clean markdown tags for natural speech
      const cleanText = message.text.replace(/[`*#_~[\]()]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      const md = `### AI Vexa\n\n${message.text}`;
      navigator.clipboard.writeText(md);
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      id={`message-${message.id}`}
      className={`py-4 sm:py-6 px-3 sm:px-6 transition-colors ${
        isUser
          ? isDark
            ? 'bg-transparent'
            : 'bg-transparent'
          : isDark
          ? 'bg-[#212121] border-y border-[#2b2b2b]'
          : 'bg-[#F9FAFB] border-y border-gray-100'
      }`}
    >
      <div className="max-w-3xl mx-auto flex items-start gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-gray-400/30 shadow-xs"
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                <UserIcon className="w-4 h-4" />
              </div>
            )
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Message Content Container */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header info */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs tracking-tight">
                {isUser ? user.name : 'AI Vexa'}
              </span>
              {isUser && message.isEdited && (
                <span className="text-[10px] text-gray-400 font-normal italic">
                  (edited)
                </span>
              )}
              {message.modelUsed && !isUser && (
                <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {message.modelUsed}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isUser && !isEditing && onEditMessage && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  title="Edit prompt"
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    isDark
                      ? 'text-gray-400 hover:text-white hover:bg-[#2e2e2e]'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  <Pencil className="w-3 h-3 text-indigo-400" />
                  <span>Edit</span>
                </button>
              )}
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3 opacity-60" />
                {formattedTime}
              </span>
            </div>
          </div>

          {/* Attached Files / Images Preview */}
          {message.files && message.files.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 pb-1.5">
              {message.files.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center gap-2 p-1.5 pr-3 rounded-lg border text-xs ${
                    isDark
                      ? 'bg-[#292929] border-[#383838] text-gray-200'
                      : 'bg-white border-gray-200 text-gray-800 shadow-xs'
                  }`}
                >
                  {file.isImage && file.previewUrl ? (
                    <img
                      src={file.previewUrl}
                      alt={file.name}
                      className="w-12 h-12 rounded object-cover border border-gray-400/20"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0 max-w-[160px]">
                    <span className="font-medium truncate text-xs">{file.name}</span>
                    <span className="text-[10px] text-gray-400">
                      {Math.round(file.size / 1024)} KB
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tool Verification Chips */}
          {message.toolsUsed && message.toolsUsed.length > 0 && !isUser && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2 select-none">
              {message.toolsUsed.map((tool, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                    tool === 'Image Generator'
                      ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                      : tool === 'Calculator'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : tool === 'Web Search'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}
                >
                  {tool === 'Image Generator' && <ImageIcon className="w-3 h-3" />}
                  {tool === 'Calculator' && <Calculator className="w-3 h-3" />}
                  {tool === 'Web Search' && <Search className="w-3 h-3" />}
                  {tool === 'Time & Calendar' && <Clock className="w-3 h-3" />}
                  <span>{tool}</span>
                </span>
              ))}
            </div>
          )}

          {/* Message Text / Markdown */}
          {message.isError ? (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span className="leading-relaxed">{message.text}</span>
              </div>
              {onRegenerate && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 transition-colors text-xs font-medium w-fit cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          ) : message.isStreaming && !message.text ? (
            <div className="flex items-center gap-2.5 py-1.5 text-xs text-gray-400 select-none">
              <span className="font-semibold text-gray-300">AI Vexa</span>
              <span className="inline-flex items-center gap-1.5 ml-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" />
              </span>
            </div>
          ) : isUser && isEditing ? (
            <div className="pt-1">
              <div
                className={`rounded-xl border p-2.5 transition-all ${
                  isDark
                    ? 'bg-[#181818] border-indigo-500/50 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20'
                    : 'bg-white border-indigo-400 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 shadow-sm'
                }`}
              >
                <textarea
                  ref={editInputRef}
                  value={editText}
                  onChange={(e) => {
                    setEditText(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.max(68, e.target.scrollHeight)}px`;
                  }}
                  onKeyDown={handleEditKeyDown}
                  rows={2}
                  className={`w-full bg-transparent resize-none outline-none text-xs sm:text-sm leading-relaxed ${
                    isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Edit your prompt..."
                />
              </div>

              {/* Edit Controls */}
              <div className="flex items-center justify-between gap-2 mt-2">
                <span className="text-[11px] text-gray-400 hidden sm:inline">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-gray-500/20 text-[10px] font-mono">Enter</kbd> to save, <kbd className="px-1.5 py-0.5 rounded bg-gray-500/20 text-[10px] font-mono">Shift+Enter</kbd> for new line
                </span>

                <div className="flex items-center gap-1.5 ml-auto">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-[#2a2a2a] hover:bg-[#353535] text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveEdit(false)}
                    disabled={!editText.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveEdit(true)}
                    disabled={!editText.trim()}
                    title="Save changes and generate new response"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Save & Submit</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={isUser && onEditMessage && !isEditing ? handleStartEdit : undefined}
              className={`text-xs sm:text-sm leading-relaxed ${
                isDark ? 'text-[#E5E5E5]' : 'text-gray-900'
              } ${
                isUser && onEditMessage
                  ? 'cursor-pointer hover:opacity-95 rounded-lg py-0.5 group/usermsg'
                  : ''
              }`}
              title={isUser && onEditMessage ? 'Click to edit your prompt' : undefined}
            >
              <div className="markdown-content">
                <Markdown
                  components={{
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      const isInline = !match && !codeString.includes('\n');

                      if (isInline) {
                        return (
                          <code
                            className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                              isDark
                                ? 'bg-[#2a2a2a] text-indigo-300 border border-[#3a3a3a]'
                                : 'bg-gray-100 text-indigo-700 border border-gray-200'
                            }`}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      const codeIdx = Math.random();
                      const isCodeCopied = copiedCodeIndex === codeIdx;

                      return (
                        <div className="my-3 rounded-xl overflow-hidden border border-gray-700/40 shadow-xs">
                          <div className="flex items-center justify-between px-3 py-1.5 bg-[#181818] border-b border-gray-700/30 text-[11px] text-gray-400">
                            <span className="font-mono lowercase">
                              {match ? match[1] : 'code'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(codeString);
                                setCopiedCodeIndex(codeIdx);
                                setTimeout(() => setCopiedCodeIndex(null), 2000);
                              }}
                              className="flex items-center gap-1 hover:text-white transition-colors"
                            >
                              {isCodeCopied ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3 bg-[#111111] overflow-x-auto text-[11px] sm:text-xs text-gray-200 font-mono leading-relaxed">
                            <code>{children}</code>
                          </pre>
                        </div>
                      );
                    },
                  }}
                >
                  {message.text}
                </Markdown>
                {message.isStreaming && (
                  <span className="inline-block w-1.5 h-3.5 ml-1 bg-indigo-500 rounded-xs animate-pulse align-middle" />
                )}
              </div>
            </div>
          )}

          {/* Active Neural Image Generator Progress Card */}
          {message.isStreaming && message.text && (message.text.includes('Creating your image') || message.text.includes('Generating your image') || message.text.includes('Rendering image')) && (
            <div className="mt-3 p-3.5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20 backdrop-blur-xs flex items-center gap-3 animate-pulse max-w-xl">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-spin [animation-duration:3s]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-indigo-300 block">Neural Image Engine Generating</span>
                <span className="text-[11px] text-gray-400">Rendering visual geometry, lighting & textures...</span>
              </div>
            </div>
          )}

          {/* Generated Image Result Card */}
          {message.generatedImage && (
            <GeneratedImageCard
              image={message.generatedImage}
              isDark={isDark}
              onRegenerate={onRegeneratePrompt || (() => onRegenerate?.())}
            />
          )}

          {/* Verified Web Sources Citations */}
          {message.sources && message.sources.length > 0 && !message.isStreaming && (
            <div className="mt-3 pt-2.5 border-t border-gray-700/20 max-w-xl">
              <span className="text-[11px] font-semibold text-gray-400 mb-1.5 flex items-center gap-1">
                <Search className="w-3 h-3 text-emerald-400" />
                Verified Sources:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {message.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors ${
                      isDark
                        ? 'bg-[#222222] border-[#383838] text-gray-300 hover:text-white hover:border-gray-500'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:text-black hover:border-gray-400'
                    }`}
                  >
                    <span className="truncate max-w-[160px]">{src.title || `Source ${i + 1}`}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action Toolbar for AI responses */}
          {!isUser && !message.isError && !message.isStreaming && message.text && (
            <div className="flex items-center gap-1 pt-2 select-none">
              {/* Copy */}
              <button
                onClick={handleCopy}
                title="Copy Response"
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                  isDark
                    ? 'hover:bg-[#2c2c2c] text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px] hidden sm:inline">Copy</span>
                  </>
                )}
              </button>

              {/* Share Conversation Button (copies markdown formatted version) */}
              <button
                type="button"
                onClick={handleShare}
                title="Share conversation (copies Markdown to clipboard)"
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  shared
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isDark
                    ? 'hover:bg-[#2c2c2c] text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                {shared ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] text-emerald-400 font-medium">Copied MD</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="text-[11px] hidden sm:inline">Share</span>
                  </>
                )}
              </button>

              {/* Text to Speech (Speaker) */}
              <button
                onClick={handleToggleSpeak}
                title={isSpeaking ? 'Stop voice readout' : 'Read aloud with voice'}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                  isSpeaking
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : isDark
                    ? 'hover:bg-[#2c2c2c] text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                {speechNotice ? (
                  <span className="text-[11px] text-amber-400">{speechNotice}</span>
                ) : isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                    <span className="text-[11px]">Speaking...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="text-[11px] hidden sm:inline">Speak</span>
                  </>
                )}
              </button>

              {/* Regenerate (if last message) */}
              {isLastAssistant && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  title="Regenerate Response"
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                    isDark
                      ? 'hover:bg-[#2c2c2c] text-gray-400 hover:text-gray-200'
                      : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">Regenerate</span>
                </button>
              )}

              {/* Like */}
              <button
                onClick={() => onFeedback?.(message.id, 'like')}
                title="Good response"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  message.feedback === 'like'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isDark
                    ? 'hover:bg-[#2c2c2c] text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              {/* Dislike */}
              <button
                onClick={() => onFeedback?.(message.id, 'dislike')}
                title="Poor response / Report"
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  message.feedback === 'dislike'
                    ? 'bg-rose-500/20 text-rose-400'
                    : isDark
                    ? 'hover:bg-[#2c2c2c] text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Action Toolbar for User messages (Edit & Copy) */}
          {isUser && !isEditing && (
            <div className="flex items-center gap-1 pt-1 select-none">
              {onEditMessage && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  title="Edit prompt"
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                    isDark
                      ? 'hover:bg-[#2c2c2c] text-gray-400 hover:text-gray-200'
                      : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Pencil className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[11px] font-medium text-indigo-400">Edit</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleCopy}
                title="Copy prompt"
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  isDark
                    ? 'hover:bg-[#2c2c2c] text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px] hidden sm:inline">Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
