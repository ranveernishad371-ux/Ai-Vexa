import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Edit2,
  Trash2,
  Check,
  X,
  Settings,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Shield,
  Pin,
  PinOff,
} from 'lucide-react';
import { AppSettings, Conversation, User } from '../types';
import { groupConversations } from '../utils/storage';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePinConversation: (id: string) => void;
  onClearAll: () => void;
  user: User;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenSettings: () => void;
  onOpenAdmin: () => void;
  onOpenHelp: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onTogglePinConversation,
  onClearAll,
  user,
  settings,
  onUpdateSettings,
  onOpenSettings,
  onOpenAdmin,
  onOpenHelp,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState('');

  const isDark = settings.theme === 'dark';

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.messages.some((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const { pinned, today, yesterday, pastSevenDays, older } = groupConversations(
    filteredConversations
  );

  const startRename = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitleText(c.title);
  };

  const submitRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitleText.trim()) {
      onRenameConversation(id, editTitleText.trim());
    }
    setEditingId(null);
  };

  const renderConversationItem = (conv: Conversation) => {
    const isActive = conv.id === activeConversationId;
    const isEditing = editingId === conv.id;

    return (
      <div
        key={conv.id}
        id={`chat-item-${conv.id}`}
        onClick={() => {
          onSelectConversation(conv.id);
          // On mobile, auto close sidebar when chat is selected
          if (window.innerWidth < 768) onClose();
        }}
        className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all text-xs select-none ${
          isActive
            ? isDark
              ? 'bg-[#2a2a2a] text-white font-medium border border-[#3a3a3a]'
              : 'bg-indigo-50 text-indigo-900 font-medium border border-indigo-200/70 shadow-xs'
            : isDark
            ? 'text-[#d0d0d0] hover:bg-[#202020] hover:text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <MessageSquare
            className={`w-4 h-4 shrink-0 ${
              isActive
                ? isDark
                  ? 'text-indigo-400'
                  : 'text-indigo-600'
                : 'opacity-50'
            }`}
          />

          {isEditing ? (
            <form
              onSubmit={(e) => submitRename(conv.id, e)}
              className="flex items-center gap-1 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                autoFocus
                value={editTitleText}
                onChange={(e) => setEditTitleText(e.target.value)}
                onBlur={() => submitRename(conv.id)}
                className={`w-full text-xs px-1.5 py-0.5 rounded outline-none border ${
                  isDark
                    ? 'bg-[#1f1f1f] border-indigo-500 text-white'
                    : 'bg-white border-indigo-400 text-gray-900'
                }`}
              />
              <button
                type="submit"
                className="p-1 text-emerald-400 hover:text-emerald-300"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="p-1 text-gray-400 hover:text-gray-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <span className="truncate flex-1 font-normal tracking-tight">
              {conv.title || 'Untitled Conversation'}
            </span>
          )}
        </div>

        {/* Hover / Actions */}
        {!isEditing && (
          <div
            className={`flex items-center gap-1 shrink-0 ${
              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            } transition-opacity`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              title={conv.pinned ? 'Unpin chat' : 'Pin chat to top'}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePinConversation(conv.id);
              }}
              className={`p-1 rounded hover:bg-black/20 ${
                conv.pinned ? 'text-amber-400 opacity-100' : 'text-gray-400'
              }`}
            >
              {conv.pinned ? (
                <PinOff className="w-3.5 h-3.5" />
              ) : (
                <Pin className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              title="Rename conversation"
              onClick={(e) => startRename(conv, e)}
              className="p-1 rounded hover:bg-black/20 text-gray-400 hover:text-white"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              title="Delete conversation"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(conv.id);
              }}
              className="p-1 rounded hover:bg-black/20 text-gray-400 hover:text-rose-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (title: string, items: Conversation[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-4">
        <div className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400/80">
          {title}
        </div>
        <div className="space-y-1">{items.map(renderConversationItem)}</div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-30 transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="vexa-sidebar"
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 flex flex-col transition-transform duration-200 ease-in-out border-r ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${
          isDark
            ? 'bg-[#171717] border-[#262626] text-white'
            : 'bg-[#F7F7F8] border-gray-200 text-gray-800'
        }`}
      >
        {/* Top Header & New Chat button */}
        <div className="p-3 pb-2 space-y-2.5">
          <div className="flex items-center justify-between md:hidden">
            <span className="font-bold text-sm tracking-tight px-1">AI Vexa</span>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg ${
                isDark ? 'hover:bg-[#252525]' : 'hover:bg-gray-200'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            id="sidebar-new-chat-btn"
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </div>
            <span className="text-[10px] opacity-75 bg-black/20 px-1.5 py-0.5 rounded">
              ⌘K
            </span>
          </button>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="sidebar-search-input"
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-xs pl-8 pr-3 py-1.5 rounded-lg outline-none border transition-colors ${
                isDark
                  ? 'bg-[#222222] border-[#303030] text-gray-200 placeholder-gray-500 focus:border-indigo-500'
                  : 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-indigo-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Chat History List */}
        <div
          id="sidebar-chat-list"
          className="flex-1 overflow-y-auto px-2 py-2 space-y-1"
        >
          {filteredConversations.length === 0 ? (
            <div className="text-center py-10 text-xs text-gray-400 px-4">
              {searchQuery
                ? `No conversations match "${searchQuery}"`
                : 'No conversations yet. Start a new chat!'}
            </div>
          ) : (
            <>
              {renderSection('Pinned', pinned)}
              {renderSection('Today', today)}
              {renderSection('Yesterday', yesterday)}
              {renderSection('Previous 7 Days', pastSevenDays)}
              {renderSection('Older', older)}
            </>
          )}
        </div>

        {/* Sidebar Footer Actions */}
        <div
          className={`p-3 border-t space-y-1 text-xs select-none ${
            isDark ? 'border-[#262626] bg-[#141414]' : 'border-gray-200 bg-[#EFEFF1]'
          }`}
        >
          {/* Admin Dashboard */}
          {user.role === 'admin' && (
            <button
              id="sidebar-admin-link"
              onClick={() => {
                onOpenAdmin();
                if (window.innerWidth < 768) onClose();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors font-medium ${
                isDark
                  ? 'text-purple-300 hover:bg-purple-900/20'
                  : 'text-purple-700 hover:bg-purple-100'
              }`}
            >
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Admin Dashboard</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() =>
              onUpdateSettings({ theme: isDark ? 'light' : 'dark' })
            }
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-[#202020] text-gray-300' : 'hover:bg-gray-200 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isDark ? (
                <Sun className="w-4 h-4 text-yellow-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
              <span>Theme</span>
            </div>
            <span className="text-[11px] font-medium opacity-60">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </button>

          {/* Settings */}
          <button
            id="sidebar-settings-link"
            onClick={() => {
              onOpenSettings();
              if (window.innerWidth < 768) onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-[#202020] text-gray-300' : 'hover:bg-gray-200 text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4 opacity-70" />
            <span>Settings</span>
          </button>

          {/* Help */}
          <button
            onClick={() => {
              onOpenHelp();
              if (window.innerWidth < 768) onClose();
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-[#202020] text-gray-300' : 'hover:bg-gray-200 text-gray-700'
            }`}
          >
            <HelpCircle className="w-4 h-4 opacity-70" />
            <span>Help & FAQ</span>
          </button>

          {/* User Profile Bar */}
          <div
            className={`mt-2 pt-2 border-t flex items-center justify-between px-2 ${
              isDark ? 'border-[#262626]' : 'border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-400/30"
              />
              <div className="min-w-0">
                <div className="font-semibold text-xs truncate leading-tight">
                  {user.name}
                </div>
                <div className="text-[10px] text-gray-400 truncate">
                  {user.role === 'admin' ? 'Super Admin' : 'Free Tier'}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-black/20"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
