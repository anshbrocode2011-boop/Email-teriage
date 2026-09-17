import React from 'react';
import { ExternalLink, Check, Clock, ArrowRight, Mail } from 'lucide-react';
import type { EmailItem, EmailCategory } from '../types';

interface EmailCardProps {
  email: EmailItem;
  onMarkHandled: (id: string) => void;
  onRestore?: (id: string) => void;
}

const CATEGORY_STYLES: Record<
  EmailCategory,
  {
    badge: string;
    label: string;
    border: string;
    accentDot: string;
    suggestedActionBg: string;
  }
> = {
  URGENT: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    label: 'URGENT',
    border: 'hover:border-rose-300 border-rose-100',
    accentDot: 'bg-rose-500',
    suggestedActionBg: 'bg-rose-50/80 text-rose-900 border-rose-200',
  },
  WORTH_A_LOOK: {
    badge: 'bg-amber-50 text-amber-800 border-amber-200 ring-amber-500/20',
    label: 'WORTH A LOOK',
    border: 'hover:border-amber-300 border-amber-100/80',
    accentDot: 'bg-amber-500',
    suggestedActionBg: 'bg-amber-50/70 text-amber-900 border-amber-200/80',
  },
  CAN_WAIT: {
    badge: 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-400/20',
    label: 'CAN WAIT',
    border: 'hover:border-slate-300 border-slate-200/60',
    accentDot: 'bg-slate-400',
    suggestedActionBg: 'bg-slate-50 text-slate-800 border-slate-200',
  },
  IGNORE: {
    badge: 'bg-zinc-100 text-zinc-500 border-zinc-200',
    label: 'IGNORE',
    border: 'hover:border-zinc-300 border-zinc-200/50 opacity-80 hover:opacity-100',
    accentDot: 'bg-zinc-400',
    suggestedActionBg: 'bg-zinc-50 text-zinc-600 border-zinc-200',
  },
};

export const EmailCard: React.FC<EmailCardProps> = ({
  email,
  onMarkHandled,
  onRestore,
}) => {
  const categoryConfig = CATEGORY_STYLES[email.category] || CATEGORY_STYLES.WORTH_A_LOOK;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffHours = Math.round((now.getTime() - d.getTime()) / (1000 * 60 * 60));
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const gmailOpenUrl = email.isMockDemo
    ? 'https://mail.google.com'
    : `https://mail.google.com/mail/u/0/#inbox/${email.id}`;

  return (
    <div
      id={`email-card-${email.id}`}
      className={`group relative bg-white rounded-xl border p-5 transition-all duration-200 shadow-sm hover:shadow-md ${categoryConfig.border} ${
        email.isHandled ? 'opacity-50 bg-slate-50/70 border-dashed' : ''
      }`}
    >
      {/* Top row: Category badge, Sender, Timestamp, and Actions */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border ring-1 ${categoryConfig.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${categoryConfig.accentDot}`} />
            {categoryConfig.label}
          </span>

          <span className="font-semibold text-slate-900 text-sm truncate max-w-[240px] sm:max-w-xs" title={email.sender}>
            {email.senderName || email.sender}
          </span>

          {email.senderEmail && email.senderEmail !== email.senderName && (
            <span className="text-xs text-slate-400 hidden sm:inline truncate max-w-[200px]" title={email.senderEmail}>
              &lt;{email.senderEmail}&gt;
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(email.date)}
          </span>

          {/* Quick open in Gmail */}
          <a
            id={`open-gmail-${email.id}`}
            href={gmailOpenUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open thread in Gmail"
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Mark Handled Button */}
          {email.isHandled ? (
            <button
              id={`restore-btn-${email.id}`}
              onClick={() => onRestore?.(email.id)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Undo
            </button>
          ) : (
            <button
              id={`mark-handled-${email.id}`}
              onClick={() => onMarkHandled(email.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-lg transition-all border border-slate-200/80 hover:border-emerald-200"
              title="Mark as handled to remove from active attention"
            >
              <Check className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
              Mark Handled
            </button>
          )}
        </div>
      </div>

      {/* Subject Line */}
      <h3 className="text-base font-semibold text-slate-900 mb-2 leading-snug">
        {email.subject}
      </h3>

      {/* AI One-Sentence Summary */}
      <div className="mb-3 text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
        <p className="flex items-baseline gap-2">
          <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider shrink-0">
            Summary:
          </span>
          <span className="text-slate-800 font-medium">{email.summary}</span>
        </p>
      </div>

      {/* Suggested Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${categoryConfig.suggestedActionBg}`}
        >
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          <span>
            <strong className="font-semibold">Suggested Action:</strong> {email.suggestedAction}
          </span>
        </div>

        <a
          href={gmailOpenUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 self-end sm:self-auto py-1"
        >
          <Mail className="w-3.5 h-3.5" />
          Open in Gmail
        </a>
      </div>
    </div>
  );
};
