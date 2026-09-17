import React, { useState } from 'react';
import { Sparkles, Loader2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { EmailItem } from '../types';

interface DailyDigestModalProps {
  emails: EmailItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const DailyDigestModal: React.FC<DailyDigestModalProps> = ({
  emails,
  isOpen,
  onClose,
}) => {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen) return null;

  const urgentItems = emails.filter((e) => e.category === 'URGENT' && !e.isHandled);
  const worthALookItems = emails.filter((e) => e.category === 'WORTH_A_LOOK' && !e.isHandled);
  const canWaitItems = emails.filter((e) => e.category === 'CAN_WAIT' && !e.isHandled);
  const ignoreItems = emails.filter((e) => e.category === 'IGNORE' && !e.isHandled);

  const generateDigest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urgentItems,
          worthALookItems,
          totalCount: emails.length,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate briefing');
      }

      const data = await response.json();
      setBriefing(data.briefing);
    } catch (err) {
      // Friendly fallback briefing if network issue
      const urgentCount = urgentItems.length;
      if (urgentCount > 0) {
        setBriefing(
          `Good day! You currently have ${urgentCount} urgent item${
            urgentCount > 1 ? 's' : ''
          } requiring prompt decisions today, led by "${urgentItems[0].subject}". In addition, there are ${
            worthALookItems.length
          } relevant updates worth a look before week's end. The remaining ${
            canWaitItems.length + ignoreItems.length
          } emails are receipts or low-priority notifications that can wait comfortably.`
        );
      } else {
        setBriefing(
          `Good day! Your inbox is in great shape with zero urgent emergencies requiring your attention today. You have ${worthALookItems.length} relevant updates when you have a free moment, while the remaining messages are newsletters and low-priority notices.`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger generation automatically on open if not generated yet
  if (!briefing && !isLoading) {
    generateDigest();
  }

  const handleCopy = () => {
    if (!briefing) return;
    navigator.clipboard.writeText(briefing);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="daily-digest-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="daily-digest-dialog"
        className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Today's Executive Briefing</h2>
              <p className="text-xs text-slate-500">
                AI synthesis of your unread inbox priorities
              </p>
            </div>
          </div>
          <button
            id="close-digest-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 text-sm font-medium"
          >
            ✕
          </button>
        </div>

        {/* Content Box */}
        <div className="py-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm font-medium text-slate-800">Composing your briefing...</p>
              <p className="text-xs text-slate-500 mt-1">
                Gemini is synthesizing urgent deadlines and key updates into one briefing
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-indigo-50/50 border border-indigo-100/80 rounded-xl p-5 text-slate-800 leading-relaxed text-sm shadow-sm font-normal">
                <p className="italic text-slate-800 font-serif text-[15px] leading-relaxed">
                  "{briefing}"
                </p>
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-indigo-100/60">
                  <span className="text-xs text-slate-500 font-mono">
                    Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    id="copy-digest-btn"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100/70 px-2.5 py-1 rounded-md transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Copied to clipboard
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Briefing
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Collapsible Key Metrics breakdown */}
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full flex items-center justify-between p-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>Priority Breakdown Metrics</span>
                  {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showDetails && (
                  <div className="p-3.5 pt-0 grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-lg">
                      <div className="text-rose-700 font-bold text-base">{urgentItems.length}</div>
                      <div className="text-rose-600 text-[11px] font-medium">Urgent</div>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 p-2.5 rounded-lg">
                      <div className="text-amber-800 font-bold text-base">{worthALookItems.length}</div>
                      <div className="text-amber-700 text-[11px] font-medium">Worth a Look</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg">
                      <div className="text-slate-700 font-bold text-base">{canWaitItems.length}</div>
                      <div className="text-slate-600 text-[11px] font-medium">Can Wait</div>
                    </div>
                    <div className="bg-zinc-100 border border-zinc-200 p-2.5 rounded-lg">
                      <div className="text-zinc-600 font-bold text-base">{ignoreItems.length}</div>
                      <div className="text-zinc-500 text-[11px] font-medium">Ignore</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2.5 pt-2">
          <button
            id="regenerate-digest-btn"
            onClick={generateDigest}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Re-analyze
          </button>
          <button
            id="dismiss-digest-btn"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
