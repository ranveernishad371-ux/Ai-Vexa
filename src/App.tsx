import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { AdminModal } from './components/AdminModal';
import { HelpModal } from './components/HelpModal';
import { useAutoUpdate } from './hooks/useAutoUpdate';
import {
  AttachedFile,
  ChatMessage,
  Conversation,
  ModelOption,
  User,
} from './types';
import {
  loadConversations,
  saveConversations,
  loadConversationsFromDB,
  loadActiveConversationId,
  saveActiveConversationId,
  loadUser,
  saveUser,
  loadSettings,
  saveSettings,
  DEFAULT_SETTINGS,
} from './utils/storage';

export default function App() {
  // Application State
  const [user, setUser] = useState<User>(loadUser);
  const [settings, setSettings] = useState(loadSettings);
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    loadActiveConversationId
  );
  const [models, setModels] = useState<ModelOption[]>([
    {
      id: 'gemini-3.1-flash-lite',
      name: 'AI Vexa Flash 3.1',
      badge: 'Fast & Reliable',
      description: 'Lightweight, ultra-fast engine optimized for instant answers, high availability & coding.',
      isDefault: true,
    },
    {
      id: 'gemini-3.8-flash',
      name: 'AI Vexa Flash 3.8',
      badge: 'Next-Gen',
      description: 'Versatile, advanced model for creative writing, deep context and analysis.',
      isDefault: false,
    },
    {
      id: 'gemini-3.6-flash',
      name: 'AI Vexa Flash 3.6',
      badge: 'High Stability',
      description: 'Ultra-stable, highly balanced multimodal model for everyday inquiries and high precision.',
      isDefault: false,
    },
    {
      id: 'gemini-3.1-pro-preview',
      name: 'AI Vexa Pro 3.1',
      badge: 'Deep Reasoning',
      description: 'High-intelligence model (auto-fallbacks to Flash if tier quota limit is reached).',
      isDefault: false,
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals state
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState('appearance');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Automatic Server Updates & Real-Time Sync Hook
  const autoUpdate = useAutoUpdate();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const isUserScrolledUp = useRef(false);
  const isHydratedRef = useRef(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    isUserScrolledUp.current = scrollHeight - scrollTop - clientHeight > 80;
  };

  const scrollToBottom = (smooth = false) => {
    if (isUserScrolledUp.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // Sync active conversation
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null;

  // Hydrate full uncompressed conversations from IndexedDB on startup
  useEffect(() => {
    loadConversationsFromDB()
      .then((dbConvs) => {
        if (dbConvs && dbConvs.length > 0) {
          setConversations(dbConvs);
        }
        isHydratedRef.current = true;
      })
      .catch(() => {
        isHydratedRef.current = true;
      });
  }, []);

  // Sync to local storage & IndexedDB only when not actively streaming to prevent thrashing storage on every token chunk
  useEffect(() => {
    if (!isHydratedRef.current) return;
    const hasStreaming = conversations.some((c) =>
      c.messages.some((m) => m.isStreaming)
    );
    if (hasStreaming) return;

    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    saveActiveConversationId(activeConversationId);
  }, [activeConversationId]);

  useEffect(() => {
    saveUser(user);
  }, [user]);

  useEffect(() => {
    saveSettings(settings);
    // Update HTML document class for theme if needed
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Fetch models from server
  useEffect(() => {
    fetch('/api/models')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.models) {
          setModels(data.models);
        }
      })
      .catch(() => {
        // use default models
      });
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K for new chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conversations]);

  // Reset scroll on changing conversation
  useEffect(() => {
    isUserScrolledUp.current = false;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversationId]);

  // Auto-scroll when messages stream or update
  useEffect(() => {
    scrollToBottom(false);
  }, [activeConversation?.messages]);

  // Actions: New Chat
  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  // Select conversation
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  // Delete conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (activeConversationId === id) {
        setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
      }
      return remaining;
    });
  };

  // Rename conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c
      )
    );
  };

  // Pin / Unpin conversation
  const handleTogglePinConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  // Clear all history
  const handleClearAllHistory = () => {
    setConversations([]);
    setActiveConversationId(null);
  };

  // Export conversations
  const handleExportHistory = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(conversations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vexa_ai_chats_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import conversations
  const handleImportHistory = (jsonStr: string) => {
    try {
      const imported = JSON.parse(jsonStr);
      if (Array.isArray(imported)) {
        setConversations(imported);
        if (imported.length > 0) setActiveConversationId(imported[0].id);
        showToast('Conversations imported successfully!', 'success');
      } else {
        showToast('Invalid JSON structure.', 'error');
      }
    } catch {
      showToast('Invalid JSON file format.', 'error');
    }
  };

  // Stop generating in-flight response
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  // Reusable streaming AI response processor
  const streamAIResponse = async (
    targetConvId: string,
    historyMessages: ChatMessage[],
    assistantId: string
  ) => {
    setIsLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Chat History Optimization: limit to recent 10 messages, exclude errors & placeholder
    const trimmedHistory = historyMessages
      .filter((m) => !m.isError && m.id !== assistantId)
      .slice(-10);

    const payloadMessages = trimmedHistory.map((m) => ({
      role: m.role,
      text: m.text,
      files: m.files?.map((f) => ({
        name: f.name,
        type: f.type,
        isImage: f.isImage,
        base64: f.base64,
        textContent: f.textContent,
      })),
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: payloadMessages,
          model: settings.selectedModel,
          systemInstruction: settings.systemPrompt,
          temperature: settings.temperature,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        let errMsg = errData.error || 'AI Vexa is taking longer than expected. Please try again.';
        throw new Error(errMsg);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Streaming is not supported by your browser.');
      }

      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';
      let actualModelUsed = settings.selectedModel;
      let receivedGeneratedImage: any = undefined;
      let receivedToolsUsed: string[] | undefined = undefined;
      let receivedSources: Array<{ title: string; url: string; snippet?: string }> | undefined = undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.replace(/^data:\s*/, '');
          try {
            const data = JSON.parse(jsonStr);
            if (data.chunk) {
              accumulatedText += data.chunk;
            }
            if (data.modelUsed) actualModelUsed = data.modelUsed;
            if (data.generatedImage) receivedGeneratedImage = data.generatedImage;
            if (data.toolsUsed) receivedToolsUsed = data.toolsUsed;
            if (data.sources) receivedSources = data.sources;

            setConversations((prev) =>
              prev.map((c) =>
                c.id === targetConvId
                  ? {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === assistantId
                          ? {
                              ...m,
                              text: accumulatedText,
                              modelUsed: actualModelUsed,
                              generatedImage: receivedGeneratedImage || m.generatedImage,
                              toolsUsed: receivedToolsUsed || m.toolsUsed,
                              sources: receivedSources || m.sources,
                              isStreaming: true,
                            }
                          : m
                      ),
                      updatedAt: Date.now(),
                    }
                  : c
              )
            );

            if (data.error) {
              throw new Error(data.error);
            }
          } catch (e: any) {
            if (e.message && !e.message.includes('JSON')) {
              throw e;
            }
          }
        }
      }

      // Finalize streaming state
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        text:
                          accumulatedText ||
                          'I was unable to generate a response. Please try again.',
                        modelUsed: actualModelUsed,
                        generatedImage: receivedGeneratedImage || m.generatedImage,
                        toolsUsed: receivedToolsUsed || m.toolsUsed,
                        sources: receivedSources || m.sources,
                        isStreaming: false,
                      }
                    : m
                ),
                updatedAt: Date.now(),
              }
            : c
        )
      );
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // User clicked "Stop generating"
        setConversations((prev) =>
          prev.map((c) =>
            c.id === targetConvId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantId ? { ...m, isStreaming: false } : m
                  ),
                  updatedAt: Date.now(),
                }
              : c
          )
        );
        return;
      }

      console.error('Chat streaming error:', error);
      let cleanMsg = error?.message || 'AI Vexa is taking longer than expected. Please try again.';
      try {
        if (typeof cleanMsg === 'string' && cleanMsg.includes('{') && cleanMsg.includes('}')) {
          const parsed = JSON.parse(
            cleanMsg.slice(cleanMsg.indexOf('{'), cleanMsg.lastIndexOf('}') + 1)
          );
          cleanMsg = parsed?.error?.message || parsed?.message || cleanMsg;
        }
      } catch {
        // ignore
      }

      if (
        cleanMsg.includes('503') ||
        cleanMsg.includes('UNAVAILABLE') ||
        cleanMsg.includes('high demand') ||
        cleanMsg.includes('timeout')
      ) {
        cleanMsg = 'AI Vexa is taking longer than expected. Please try again.';
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        text: m.text ? m.text : cleanMsg,
                        isError: !m.text,
                        isStreaming: false,
                      }
                    : m
                ),
                updatedAt: Date.now(),
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Send message
  const handleSendMessage = async (text: string, files: AttachedFile[]) => {
    if ((!text.trim() && files.length === 0) || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
      files,
    };

    const assistantId = `msg-ai-${Date.now() + 1}`;
    const placeholderAssistant: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      text: '',
      timestamp: Date.now() + 1,
      modelUsed: settings.selectedModel,
      isStreaming: true,
    };

    let targetConvId = activeConversationId;
    let currentConv = conversations.find((c) => c.id === targetConvId);

    // If starting a new conversation
    if (!currentConv) {
      targetConvId = `conv-${Date.now()}`;
      const initialTitle = text.trim()
        ? text.trim().slice(0, 32) + (text.trim().length > 32 ? '...' : '')
        : files[0]?.name || 'New Conversation';

      currentConv = {
        id: targetConvId,
        title: initialTitle,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [userMessage, placeholderAssistant],
      };

      setConversations((prev) => [currentConv!, ...prev]);
      setActiveConversationId(targetConvId);
      await streamAIResponse(targetConvId, [userMessage], assistantId);
    } else {
      // Append user message and streaming placeholder to existing conversation
      const updatedMessages = [...currentConv.messages, userMessage, placeholderAssistant];
      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? { ...c, messages: updatedMessages, updatedAt: Date.now() }
            : c
        )
      );
      await streamAIResponse(
        targetConvId,
        [...currentConv.messages, userMessage],
        assistantId
      );
    }
  };

  // Regenerate last assistant response
  const handleRegenerate = async () => {
    if (!activeConversation || isLoading) return;
    const msgs = activeConversation.messages;
    if (msgs.length === 0) return;

    // Remove the last assistant or error message
    let filtered = [...msgs];
    if (filtered[filtered.length - 1].role === 'assistant') {
      filtered.pop();
    }

    const lastUser = filtered[filtered.length - 1];
    if (!lastUser || lastUser.role !== 'user') return;

    const assistantId = `msg-ai-${Date.now()}`;
    const placeholderAssistant: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      text: '',
      timestamp: Date.now(),
      modelUsed: settings.selectedModel,
      isStreaming: true,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversation.id
          ? { ...c, messages: [...filtered, placeholderAssistant], updatedAt: Date.now() }
          : c
      )
    );

    await streamAIResponse(activeConversation.id, filtered, assistantId);
  };

  // Feedback (Like / Dislike)
  const handleFeedback = (messageId: string, type: 'like' | 'dislike') => {
    setConversations((prev) =>
      prev.map((c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === messageId
            ? { ...m, feedback: m.feedback === type ? null : type }
            : m
        ),
      }))
    );

    // If dislike, submit report to server
    if (type === 'dislike') {
      fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          user: user.name,
          reason: 'User provided negative thumbs-down feedback on response.',
        }),
      }).catch(() => {});
    }
  };

  // Edit user prompt in chat history
  const handleEditMessage = async (
    messageId: string,
    newText: string,
    shouldRegenerate = false
  ) => {
    if (!newText.trim() || !activeConversation) return;

    const convId = activeConversation.id;
    const msgIndex = activeConversation.messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    const targetMsg = activeConversation.messages[msgIndex];
    const updatedMsg: ChatMessage = {
      ...targetMsg,
      text: newText.trim(),
      isEdited: true,
      editedAt: Date.now(),
    };

    if (shouldRegenerate) {
      // Re-run conversation from this edited message forward
      const historyUpToEdited = [
        ...activeConversation.messages.slice(0, msgIndex),
        updatedMsg,
      ];

      const assistantId = `msg-ai-${Date.now()}`;
      const placeholderAssistant: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        text: '',
        timestamp: Date.now(),
        modelUsed: settings.selectedModel,
        isStreaming: true,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                messages: [...historyUpToEdited, placeholderAssistant],
                updatedAt: Date.now(),
              }
            : c
        )
      );

      await streamAIResponse(convId, historyUpToEdited, assistantId);
    } else {
      // Update the user prompt in the chat history
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? {
                ...c,
                updatedAt: Date.now(),
                messages: c.messages.map((m) =>
                  m.id === messageId ? updatedMsg : m
                ),
              }
            : c
        )
      );
    }
  };

  const handleShareConversation = (conv?: Conversation) => {
    if (!conv || !conv.messages.length) return;
    const conversationTitle = conv.title || 'Chat';
    const formattedDate = new Date().toLocaleString();
    let md = `# AI Vexa Conversation: ${conversationTitle}\n*Exported on ${formattedDate}*\n\n---\n\n`;

    conv.messages.forEach((m) => {
      const sender = m.role === 'user' ? (user.name || 'User') : 'AI Vexa';
      const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      md += `### ${sender} (${time})\n\n${m.text || ''}\n\n`;
      if (m.generatedImage?.url) {
        md += `![Generated Image](${m.generatedImage.url})\n*Prompt: ${m.generatedImage.prompt || ''}*\n\n`;
      }
      md += `---\n\n`;
    });

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(md.trim()).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = md.trim();
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = md.trim();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  };

  const isDark = settings.theme === 'dark';

  return (
    <div
      id="vexa-app-root"
      className={`h-screen w-screen flex flex-col overflow-hidden transition-colors ${
        isDark ? 'bg-[#212121] text-white' : 'bg-white text-gray-900'
      }`}
    >
      {/* Top Header */}
      <Header
        user={user}
        settings={settings}
        models={models}
        onNewChat={handleNewChat}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenSettings={(tab) => {
          setSettingsInitialTab(tab || 'appearance');
          setSettingsModalOpen(true);
        }}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenHelp={() => setHelpModalOpen(true)}
        onUpdateSettings={(newVals) =>
          setSettings((prev) => ({ ...prev, ...newVals }))
        }
        onLogout={() => {
          setUser({
            id: 'guest',
            name: 'Guest User',
            email: 'guest@example.com',
            avatar:
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            role: 'user',
            createdAt: Date.now(),
          });
        }}
      />

      {/* Dynamic Server Update Notification Banner */}
      {autoUpdate.hasUpdate && (
        <div
          id="vexa-live-update-banner"
          className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md z-30 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 animate-pulse shrink-0" />
            <span className="font-medium">
              <strong>AI Vexa Server Update Ready:</strong> A new version or updated AI instructions have been deployed.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={autoUpdate.applyUpdate}
              className="px-3 py-1 bg-white text-gray-900 rounded-lg font-semibold text-xs hover:bg-gray-100 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Now</span>
            </button>
            <button
              onClick={autoUpdate.dismissUpdate}
              className="text-white/80 hover:text-white p-1 rounded-md transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace: Sidebar + Chat Stream */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
          onTogglePinConversation={handleTogglePinConversation}
          onClearAll={handleClearAllHistory}
          user={user}
          settings={settings}
          onUpdateSettings={(newVals) =>
            setSettings((prev) => ({ ...prev, ...newVals }))
          }
          onOpenSettings={() => {
            setSettingsInitialTab('appearance');
            setSettingsModalOpen(true);
          }}
          onOpenAdmin={() => setAdminModalOpen(true)}
          onOpenHelp={() => setHelpModalOpen(true)}
          onLogout={() => {
            setUser({
              id: 'guest',
              name: 'Guest User',
              email: 'guest@example.com',
              avatar:
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
              role: 'user',
              createdAt: Date.now(),
            });
          }}
        />

        {/* Central Chat Workspace */}
        <main
          id="chat-main-area"
          className="flex-1 flex flex-col h-full overflow-hidden relative"
        >
          {/* Scrollable Messages Area or Welcome Screen */}
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto flex flex-col"
          >
            {!activeConversation || activeConversation.messages.length === 0 ? (
              <WelcomeScreen
                settings={settings}
                onSelectPrompt={(promptText) => handleSendMessage(promptText, [])}
              />
            ) : (
              <div className="w-full flex-1 pb-4">
                {activeConversation.messages.map((msg, index) => {
                  const isLastAssistant =
                    index === activeConversation.messages.length - 1 &&
                    msg.role === 'assistant';
                  return (
                    <ChatMessageItem
                      key={msg.id}
                      message={msg}
                      user={user}
                      isDark={isDark}
                      onRegenerate={handleRegenerate}
                      onRegeneratePrompt={(prompt) => handleSendMessage(prompt, [])}
                      onFeedback={handleFeedback}
                      onEditMessage={handleEditMessage}
                      onShare={() => handleShareConversation(activeConversation)}
                      isLastAssistant={isLastAssistant}
                    />
                  );
                })}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Fixed Chat Input Box */}
          <ChatInput
            onSendMessage={handleSendMessage}
            onStopGenerating={handleStopGenerating}
            isLoading={isLoading}
            isDark={isDark}
          />
        </main>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        initialTab={settingsInitialTab}
        user={user}
        onUpdateUser={(updated) => setUser((prev) => ({ ...prev, ...updated }))}
        settings={settings}
        onUpdateSettings={(newVals) =>
          setSettings((prev) => ({ ...prev, ...newVals }))
        }
        models={models}
        onClearHistory={handleClearAllHistory}
        onExportHistory={handleExportHistory}
        onImportHistory={handleImportHistory}
        serverInfo={autoUpdate.serverInfo}
        hasUpdate={autoUpdate.hasUpdate}
        isCheckingUpdates={autoUpdate.isChecking}
        onCheckForUpdates={autoUpdate.checkForUpdates}
        onApplyUpdate={autoUpdate.applyUpdate}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
        isDark={isDark}
      />

      <AdminModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        isDark={isDark}
        currentUser={user}
      />

      <HelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        isDark={isDark}
      />

      {/* In-App Toast Notification (Replaces window.alert, completely iframe safe) */}
      {toastMessage && (
        <div
          id="in-app-toast"
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl text-xs font-medium shadow-xl border flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-800/60 shadow-rose-950/40'
              : toastMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800/60 shadow-emerald-950/40'
              : 'bg-zinc-900/90 text-zinc-100 border-zinc-700/60 shadow-black/40'
          }`}
        >
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
