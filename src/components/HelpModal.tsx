import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  ShieldCheck,
  FileText,
  Mic,
  Image as ImageIcon,
  Command,
  Lock,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  isDark,
}) => {
  const [activeSection, setActiveSection] = useState<'faq' | 'privacy' | 'terms'>('faq');

  if (!isOpen) return null;

  return (
    <div
      id="help-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        id="help-modal-card"
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${
          isDark
            ? 'bg-[#1e1e1e] border-[#303030] text-white'
            : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-500/15">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-sm tracking-tight">AI Vexa Support & Docs</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-gray-500/15 text-xs font-medium">
          <button
            onClick={() => setActiveSection('faq')}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeSection === 'faq'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Help & User Guide
          </button>
          <button
            onClick={() => setActiveSection('privacy')}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeSection === 'privacy'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveSection('terms')}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeSection === 'terms'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Terms of Service
          </button>
        </div>

        {/* Modal content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1 leading-relaxed">
          {activeSection === 'faq' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl border border-gray-500/20 bg-indigo-500/5">
                <h4 className="font-semibold text-xs flex items-center gap-2 mb-1 text-indigo-400">
                  <Mic className="w-4 h-4" /> Voice Input & Speech Synthesis
                </h4>
                <p className="text-gray-400 text-xs">
                  Click the microphone icon in the chat box to dictate questions verbally. AI Vexa transcribes your words in real time. To hear any AI response spoken aloud, click the <strong>Speak</strong> (speaker) button beneath the answer.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-500/20 bg-indigo-500/5">
                <h4 className="font-semibold text-xs flex items-center gap-2 mb-1 text-indigo-400">
                  <ImageIcon className="w-4 h-4" /> Multimodal Image & Document Analysis
                </h4>
                <p className="text-gray-400 text-xs">
                  Click the paperclip button to upload PNG, JPG, or WEBP photos, code files, TXT, or documents. You can ask <em>"Is image me kya hai?"</em>, <em>"Is PDF ka summary batao"</em>, or <em>"Solve this math equation"</em>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-gray-500/20 bg-indigo-500/5">
                <h4 className="font-semibold text-xs flex items-center gap-2 mb-1 text-indigo-400">
                  <Command className="w-4 h-4" /> Keyboard Shortcuts
                </h4>
                <ul className="text-gray-400 text-xs list-disc pl-4 space-y-1">
                  <li><kbd className="px-1.5 py-0.5 rounded bg-black/30 border border-gray-600 font-mono text-[10px]">Enter</kbd>: Send prompt immediately</li>
                  <li><kbd className="px-1.5 py-0.5 rounded bg-black/30 border border-gray-600 font-mono text-[10px]">Shift + Enter</kbd>: Insert new line</li>
                  <li><kbd className="px-1.5 py-0.5 rounded bg-black/30 border border-gray-600 font-mono text-[10px]">⌘K / Ctrl+K</kbd>: Open a new chat</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="space-y-3 text-gray-300">
              <h4 className="font-bold text-sm text-white">Privacy Policy</h4>
              <p className="text-xs text-gray-400">
                At AI Vexa, your data confidentiality and privacy are paramount.
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Server-Side Security:</strong> All API keys are securely guarded on the server side and never sent to the browser.</span>
                </div>
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Client Storage:</strong> Your private conversations are stored locally in your browser's encrypted sandbox unless you choose to export them.</span>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>No Third-Party Sharing:</strong> We do not sell or monetize personal chat queries or uploaded attachments.</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'terms' && (
            <div className="space-y-3 text-gray-300">
              <h4 className="font-bold text-sm text-white">Terms of Service</h4>
              <p className="text-xs text-gray-400">
                By accessing AI Vexa, you agree to these fair usage policies:
              </p>
              <ul className="text-xs text-gray-400 list-disc pl-4 space-y-1.5">
                <li>AI Vexa is an experimental AI platform powered by state-of-the-art Gemini intelligence models.</li>
                <li>Users agree not to generate harmful, harassing, or illegal content.</li>
                <li>AI responses are generated automatically; users should verify critical code, medical, legal, or financial advice independently.</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 px-5 border-t border-gray-500/15 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
