import React, { useRef, useState, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Paperclip,
  Mic,
  MicOff,
  Image as ImageIcon,
  FileText,
  X,
  Sparkles,
} from 'lucide-react';
import { AttachedFile } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string, files: AttachedFile[]) => void;
  onStopGenerating?: () => void;
  isLoading: boolean;
  isDark: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGenerating,
  isLoading,
  isDark,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<any>(null);

  const isImageMode =
    inputText.toLowerCase().startsWith('/image') ||
    inputText.toLowerCase().startsWith('/imagine') ||
    inputText.toLowerCase().startsWith('/draw') ||
    inputText.toLowerCase().includes('thumbnail') ||
    inputText.toLowerCase().includes('discord logo') ||
    inputText.toLowerCase().includes('cyberpunk') ||
    inputText.toLowerCase().includes('gaming banner') ||
    (inputText.toLowerCase().startsWith('create a') && (inputText.toLowerCase().includes('city') || inputText.toLowerCase().includes('landscape') || inputText.toLowerCase().includes('logo') || inputText.toLowerCase().includes('setup'))) ||
    (inputText.toLowerCase().startsWith('generate a') && (inputText.toLowerCase().includes('city') || inputText.toLowerCase().includes('landscape') || inputText.toLowerCase().includes('logo')));

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [inputText]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          setVoiceError(`Mic notice: ${event.error}`);
          setTimeout(() => setVoiceError(null), 3000);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      setVoiceError('Speech recognition is not supported in this browser.');
      setTimeout(() => setVoiceError(null), 3000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  };

  // Handle file picker selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: AttachedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isImage = file.type.startsWith('image/');
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      if (isImage) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        newAttachments.push({
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          isImage: true,
          base64,
          previewUrl: URL.createObjectURL(file),
        });
      } else {
        // Read text content for TXT, MD, CSV, JSON, JS, PY, code, doc
        const textContent = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsText(file);
        });

        newAttachments.push({
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          isImage: false,
          textContent,
        });
      }
    }

    setAttachedFiles((prev) => [...prev, ...newAttachments]);
    // Reset file input value so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSend = () => {
    const text = inputText.trim();
    if ((!text && attachedFiles.length === 0) || isLoading) return;

    onSendMessage(text, attachedFiles);
    setInputText('');
    setAttachedFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasContent = inputText.trim().length > 0 || attachedFiles.length > 0;

  return (
    <div className="max-w-3xl mx-auto w-full px-3 sm:px-4 pb-3 sm:pb-5">
      {/* Voice feedback alert */}
      {voiceError && (
        <div className="mb-2 text-center text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 py-1 px-3 rounded-lg">
          {voiceError}
        </div>
      )}

      {/* Main input wrapper */}
      <div
        className={`rounded-2xl border transition-all shadow-md ${
          isDark
            ? 'bg-[#2F2F2F] border-[#404040] focus-within:border-indigo-500/70'
            : 'bg-white border-gray-300 focus-within:border-indigo-500 shadow-sm'
        }`}
      >
        {/* Attached Files / Images Preview Tray */}
        {attachedFiles.length > 0 && (
          <div className="p-2.5 pb-1 flex flex-wrap gap-2 border-b border-gray-500/20">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl text-xs border ${
                  isDark
                    ? 'bg-[#222222] border-[#383838] text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-800'
                }`}
              >
                {file.isImage && file.previewUrl ? (
                  <img
                    src={file.previewUrl}
                    alt={file.name}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                ) : (
                  <FileText className="w-4 h-4 text-indigo-400" />
                )}
                <span className="truncate max-w-[120px] font-medium text-[11px]">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(file.id)}
                  className="p-1 rounded-full hover:bg-black/20 text-gray-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Area */}
        <div className="px-3 pt-2.5 sm:px-4">
          <textarea
            id="chat-input-textarea"
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? 'Listening to your voice... (Speak now)'
                : 'Message AI Vexa... (Ask a question, analyze image, write code)'
            }
            className={`w-full resize-none outline-none text-xs sm:text-sm bg-transparent placeholder-gray-400 max-h-48 leading-relaxed ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          />
        </div>

        {/* Controls row: Attachment, Mic, Model Hint, Send Button */}
        <div className="flex items-center justify-between px-2.5 py-2">
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*,.txt,.pdf,.md,.csv,.json,.js,.py,.html,.css,.ts"
              className="hidden"
            />

            {/* Attach File Button */}
            <button
              id="chat-attach-button"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Attach File or Image"
              className={`p-2 rounded-xl transition-colors ${
                isDark
                  ? 'hover:bg-[#3d3d3d] text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice Input Button */}
            <button
              id="chat-voice-button"
              type="button"
              onClick={toggleVoice}
              title={isListening ? 'Stop voice recording' : 'Voice input (Speech to text)'}
              className={`p-2 rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                  : isDark
                  ? 'hover:bg-[#3d3d3d] text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Image Generator Shortcut Button */}
            <button
              id="chat-image-mode-button"
              type="button"
              onClick={() => {
                if (!inputText) {
                  setInputText('Create a ');
                  textareaRef.current?.focus();
                } else if (!isImageMode) {
                  setInputText(`Generate an image of ${inputText}`);
                  textareaRef.current?.focus();
                }
              }}
              title="Generate AI Image"
              className={`p-2 rounded-xl transition-all ${
                isImageMode
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : isDark
                  ? 'hover:bg-[#3d3d3d] text-gray-300'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Hint tag */}
            <span className="hidden sm:inline text-[11px] text-gray-400 pl-1">
              {isListening ? (
                <span className="text-rose-400 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
                  Recording voice...
                </span>
              ) : isImageMode ? (
                <span className="text-purple-400 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Image Mode Active
                </span>
              ) : (
                'Attach files, ask questions or generate AI images'
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Enter/Shift+Enter hint */}
            <span className="hidden md:inline text-[10px] text-gray-400 pr-1">
              Enter ↵ to send
            </span>

            {/* Send or Stop Button */}
            {isLoading ? (
              <button
                id="chat-stop-button"
                type="button"
                onClick={onStopGenerating}
                className="p-2 rounded-xl font-medium transition-all bg-red-500/90 hover:bg-red-600 text-white shadow-xs active:scale-95 cursor-pointer flex items-center justify-center"
                title="Stop generating"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                id="chat-send-button"
                type="button"
                disabled={!hasContent}
                onClick={handleSend}
                className={`p-2 rounded-xl font-medium transition-all ${
                  hasContent
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm active:scale-95 cursor-pointer'
                    : isDark
                    ? 'bg-[#3b3b3b] text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Security & Disclaimer Footer */}
      <div className="mt-2 text-center text-[11px] text-gray-400/80">
        AI Vexa can make mistakes. Verify critical facts and code.
      </div>
    </div>
  );
};
