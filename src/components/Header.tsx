import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Moon,
  Sun,
  Settings,
  Shield,
  Menu,
  ChevronDown,
  LogOut,
  User as UserIcon,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { AppSettings, ModelOption, User } from '../types';

interface HeaderProps {
  user: User;
  settings: AppSettings;
  models: ModelOption[];
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: (tab?: string) => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  onOpenHelp: () => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  settings,
  models,
  onNewChat,
  onToggleSidebar,
  onOpenSettings,
  onOpenAdmin,
  onOpenAuth,
  onOpenHelp,
  onUpdateSettings,
  onLogout,
}) => {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const currentModel =
    models.find((m) => m.id === settings.selectedModel) || models[0] || {
      id: 'gemini-3.8-flash',
      name: 'AI Vexa Flash 3.8',
      badge: 'Fast & Smart',
    };

  const isDark = settings.theme === 'dark';

  return (
    <header
      id="vexa-header"
      className={`h-14 border-b px-3 sm:px-5 flex items-center justify-between transition-colors z-20 select-none ${
        isDark
          ? 'bg-[#1e1e1e] border-[#2e2e2e] text-white'
          : 'bg-white border-gray-200 text-gray-900 shadow-xs'
      }`}
    >
      {/* Left section: Hamburger + Brand + New Chat */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          id="sidebar-toggle-button"
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition-colors ${
            isDark
              ? 'hover:bg-[#2b2b2b] text-gray-300'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Toggle Sidebar"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onNewChat}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight">AI Vexa</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Quick New Chat Button (Desktop) */}
        <button
          id="header-new-chat-btn"
          onClick={onNewChat}
          className={`hidden md:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-all ${
            isDark
              ? 'border-[#383838] bg-[#282828] hover:bg-[#333333] text-gray-200'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-700'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Center section: Model Selector Badge */}
      <div className="relative">
        <button
          id="model-selector-dropdown-btn"
          onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
            isDark
              ? 'border-[#333333] bg-[#282828] hover:bg-[#303030] text-gray-200'
              : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="font-semibold">{currentModel.name}</span>
          <span className="hidden sm:inline text-[10px] opacity-75">
            • {currentModel.badge}
          </span>
          <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
        </button>

        {/* Model dropdown menu */}
        {modelDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setModelDropdownOpen(false)}
            />
            <div
              className={`absolute left-1/2 -translate-x-1/2 mt-2 w-72 rounded-xl border shadow-xl z-40 p-1.5 transition-all animate-in fade-in zoom-in-95 ${
                isDark
                  ? 'bg-[#252525] border-[#383838] text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <div className="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-500/10 mb-1">
                Select Intelligence Engine
              </div>
              {models.map((model) => {
                const isSelected = model.id === settings.selectedModel;
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      onUpdateSettings({ selectedModel: model.id });
                      setModelDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex flex-col gap-0.5 ${
                      isSelected
                        ? isDark
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : isDark
                        ? 'hover:bg-[#303030] text-gray-300'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold">{model.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 font-medium">
                        {model.badge}
                      </span>
                    </div>
                    <p className="text-[11px] opacity-75 line-clamp-1">
                      {model.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Right section: Theme Toggle, Admin (if admin), Settings, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Theme toggle */}
        <button
          id="theme-toggle-header-btn"
          onClick={() =>
            onUpdateSettings({ theme: isDark ? 'light' : 'dark' })
          }
          className={`p-2 rounded-lg transition-colors ${
            isDark
              ? 'hover:bg-[#2b2b2b] text-yellow-400'
              : 'hover:bg-gray-100 text-indigo-600'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Admin Dashboard button */}
        {user.role === 'admin' && (
          <button
            id="header-admin-btn"
            onClick={onOpenAdmin}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
              isDark
                ? 'border-purple-500/30 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300'
                : 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700'
            }`}
            title="Admin Dashboard"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        )}

        {/* Settings button */}
        <button
          id="header-settings-btn"
          onClick={() => onOpenSettings()}
          className={`p-2 rounded-lg transition-colors ${
            isDark
              ? 'hover:bg-[#2b2b2b] text-gray-300'
              : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User profile dropdown */}
        <div className="relative">
          <button
            id="user-profile-menu-btn"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-1.5 focus:outline-none"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full ring-2 ring-indigo-500/40 object-cover"
            />
          </button>

          {userDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setUserDropdownOpen(false)}
              />
              <div
                className={`absolute right-0 mt-2 w-56 rounded-xl border shadow-xl z-40 p-1.5 ${
                  isDark
                    ? 'bg-[#252525] border-[#383838] text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <div className="px-3 py-2 border-b border-gray-500/15 mb-1">
                  <div className="font-semibold text-xs truncate">{user.name}</div>
                  <div className="text-[11px] text-gray-400 truncate">
                    {user.email}
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                        user.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onOpenSettings('account');
                    setUserDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                    isDark ? 'hover:bg-[#303030]' : 'hover:bg-gray-100'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5 opacity-70" />
                  <span>Profile & Account</span>
                </button>

                {user.role === 'admin' && (
                  <button
                    onClick={() => {
                      onOpenAdmin();
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                      isDark ? 'hover:bg-[#303030]' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <span>Admin Panel</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onOpenHelp();
                    setUserDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                    isDark ? 'hover:bg-[#303030]' : 'hover:bg-gray-100'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 opacity-70" />
                  <span>Help & Shortcuts</span>
                </button>

                <div className="border-t border-gray-500/15 my-1" />

                <button
                  onClick={() => {
                    onOpenAuth();
                    setUserDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors text-indigo-400 ${
                    isDark ? 'hover:bg-[#303030]' : 'hover:bg-gray-100'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Switch Account / Login</span>
                </button>

                <button
                  onClick={() => {
                    onLogout();
                    setUserDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors text-red-400 ${
                    isDark ? 'hover:bg-[#303030]' : 'hover:bg-gray-100'
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
