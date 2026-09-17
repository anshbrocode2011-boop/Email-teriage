import React from 'react';
import { Loader2, Mail, Sparkles, CheckCircle } from 'lucide-react';

interface LoadingStateProps {
  statusText: string;
  subText?: string;
  progress?: { current: number; total: number };
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  statusText,
  subText,
  progress,
}) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm animate-pulse">
          <Mail className="w-8 h-8" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow-md border border-indigo-100 flex items-center justify-center">
          <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2">
        {statusText || 'Reading your inbox...'}
      </h3>

      <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
        {subText || 'Fetching unread messages and triaging priorities with Gemini 2.5 Flash'}
      </p>

      {progress && progress.total > 0 && (
        <div className="w-full max-w-xs space-y-2">
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.round((progress.current / progress.total) * 100))}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Progress</span>
            <span>
              {progress.current} of {progress.total} emails
            </span>
          </div>
        </div>
      )}

      {/* Friendly tips rotating */}
      <div className="mt-8 flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-full">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
        <span>Categorizing into Urgent, Worth a Look, Can Wait, and Ignore</span>
      </div>
    </div>
  );
};
