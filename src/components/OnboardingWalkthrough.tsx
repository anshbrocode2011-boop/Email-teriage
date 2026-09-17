import React from 'react';
import { CheckCircle, Sparkles, Filter, X } from 'lucide-react';

interface OnboardingWalkthroughProps {
  onDismiss: () => void;
}

export const OnboardingWalkthrough: React.FC<OnboardingWalkthroughProps> = ({ onDismiss }) => {
  return (
    <div
      id="onboarding-walkthrough-banner"
      className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 mb-6 shadow-lg relative overflow-hidden border border-indigo-700/50"
    >
      <button
        id="dismiss-walkthrough-btn"
        onClick={onDismiss}
        className="absolute top-4 right-4 text-indigo-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        title="Dismiss guide"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold mb-3 border border-indigo-400/20">
          <Sparkles className="w-3.5 h-3.5" />
          Welcome to Inbox Triage
        </div>
        <h3 className="text-lg font-bold text-white mb-2">
          Your AI Executive Filter is Ready
        </h3>
        <p className="text-sm text-indigo-100/90 mb-5 leading-relaxed">
          Here is how to get the most value in 60 seconds without manually opening dozens of emails:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Step 1 */}
          <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
            <div className="flex items-center gap-2 font-bold text-indigo-200 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[11px]">
                1
              </span>
              Category Filter Bar
            </div>
            <p className="text-indigo-100/80 leading-relaxed">
              Scan emails grouped by <strong>URGENT</strong>, <strong>Worth a Look</strong>, <strong>Can Wait</strong>, and <strong>Ignore</strong>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
            <div className="flex items-center gap-2 font-bold text-indigo-200 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[11px]">
                2
              </span>
              Executive Digest
            </div>
            <p className="text-indigo-100/80 leading-relaxed">
              Click <strong>"Generate Today's Digest"</strong> for a single briefing paragraph written like your personal chief of staff.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white/10 rounded-xl p-3.5 border border-white/10">
            <div className="flex items-center gap-2 font-bold text-indigo-200 mb-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[11px]">
                3
              </span>
              Mark as Handled
            </div>
            <p className="text-indigo-100/80 leading-relaxed">
              Click <strong>"Mark Handled"</strong> on any item to clear it from your active list with a single click.
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onDismiss}
            className="px-4 py-1.5 bg-white text-indigo-950 font-semibold text-xs rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
          >
            Got it, let's triage!
          </button>
        </div>
      </div>
    </div>
  );
};
