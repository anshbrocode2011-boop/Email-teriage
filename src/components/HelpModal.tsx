import React from 'react';
import {
  HelpCircle,
  ShieldCheck,
  Zap,
  Lock,
  LogOut,
  MailCheck,
  CheckCircle2
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDisconnect?: () => void;
  isConnected: boolean;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  onDisconnect,
  isConnected,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="help-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="help-modal-dialog"
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Inbox Triage Guide & FAQ</h2>
              <p className="text-xs text-slate-500">Security, classification, and support</p>
            </div>
          </div>
          <button
            id="close-help-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 text-sm font-medium"
          >
            ✕
          </button>
        </div>

        <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-slate-700">
          {/* FAQ 1: Security & Storage */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-emerald-600" />
              Is my email content stored?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No. We request strictly read-only access (<code>gmail.readonly</code>). Full email body text is processed transiently in memory to extract your concise 1-sentence summary and classification, and is never written to a permanent database or server storage.
            </p>
          </div>

          {/* FAQ 2: AI Logic */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-600" />
              How does the AI decide what is urgent?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gemini evaluates sender identity, subject cues, direct questions, and explicit time pressure (e.g. today's deadlines, client escalations, critical system alerts). Non-urgent messages are sorted into Worth a Look, Can Wait (newsletters/receipts), or Ignore (unsolicited cold outreach).
            </p>
          </div>

          {/* FAQ 3: Disconnecting */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Can I disconnect my Gmail account?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              Yes, at any time with one click. Signing out flushes the in-memory access token immediately.
            </p>
            {isConnected && onDisconnect && (
              <button
                id="disconnect-gmail-btn"
                onClick={() => {
                  onDisconnect();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                Disconnect Gmail Now
              </button>
            )}
          </div>

          {/* Contact Support */}
          <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 mb-1">
              <MailCheck className="w-4 h-4 text-indigo-600" />
              Need Assistance or Have Feedback?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              Have questions about priority scoring or custom triage rules? Reach out directly to our team.
            </p>
            <a
              id="support-email-link"
              href="mailto:support@inboxtriage.internal?subject=Inbox%20Triage%20Feedback"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
            >
              Contact Support: support@inboxtriage.internal
            </a>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            id="close-faq-btn"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
