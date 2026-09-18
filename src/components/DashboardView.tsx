import React, { useState } from 'react';
import { LegalModal } from './LegalModal';
import {
  Sparkles,
  Inbox,
  AlertCircle,
  Eye,
  Clock,
  Trash2,
  CheckCheck,
  RefreshCw,
  HelpCircle,
  LogOut,
  Search,
  CheckCircle2,
  PieChart as PieIcon,
  Filter,
  ShieldCheck
} from 'lucide-react';
import type { EmailItem, EmailCategory, TriageStats } from '../types';
import { EmailCard } from './EmailCard';

interface DashboardViewProps {
  emails: EmailItem[];
  stats: TriageStats;
  selectedFilter: 'ALL' | EmailCategory | 'HANDLED';
  onSelectFilter: (filter: 'ALL' | EmailCategory | 'HANDLED') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onMarkHandled: (id: string) => void;
  onRestore: (id: string) => void;
  onOpenDigest: () => void;
  onOpenHelp: () => void;
  onRefresh: () => void;
  onLogout: () => void;
  onOpenPlans?: () => void;
  selectedPlan?: 'free' | 'pro' | 'executive';
  userEmail?: string | null;
  isRefreshing?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  emails,
  stats,
  selectedFilter,
  onSelectFilter,
  searchQuery,
  onSearchChange,
  onMarkHandled,
  onRestore,
  onOpenDigest,
  onOpenHelp,
  onRefresh,
  onLogout,
  onOpenPlans,
  selectedPlan = 'pro',
  userEmail,
  isRefreshing,
}) => {
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'google-disclosure' | null>(null);

  // Filter and search
  const filteredEmails = emails.filter((item) => {
    // Check filter tab
    if (selectedFilter === 'HANDLED') {
      if (!item.isHandled) return false;
    } else if (selectedFilter !== 'ALL') {
      if (item.category !== selectedFilter) return false;
      if (item.isHandled) return false;
    } else {
      if (item.isHandled) return false;
    }

    // Check search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.subject.toLowerCase().includes(q) ||
        item.sender.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.suggestedAction.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // Group filtered emails by category in priority order: URGENT -> WORTH_A_LOOK -> CAN_WAIT -> IGNORE
  const urgentGroup = filteredEmails.filter((e) => e.category === 'URGENT');
  const worthALookGroup = filteredEmails.filter((e) => e.category === 'WORTH_A_LOOK');
  const canWaitGroup = filteredEmails.filter((e) => e.category === 'CAN_WAIT');
  const ignoreGroup = filteredEmails.filter((e) => e.category === 'IGNORE');

  const showGroupedHeaders = selectedFilter === 'ALL';

  // Calculate percentage of handled
  const handledPct = stats.total > 0 ? Math.round((stats.handled / stats.total) * 100) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Email teriage
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
            {onOpenPlans && (
              <button
                id="header-plan-btn"
                onClick={onOpenPlans}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
                title="View and change subscription plan"
              >
                <span>Plan: {selectedPlan.toUpperCase()}</span>
                <span className="text-[10px] text-indigo-500 underline font-normal lowercase">change</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {userEmail ? `${userEmail} · ` : ''}
            AI priority triage for unread inbox messages
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="open-digest-btn"
            onClick={onOpenDigest}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-200" />
            Generate Today's Digest
          </button>

          <button
            id="refresh-inbox-btn"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-2xs transition-colors disabled:opacity-50"
            title="Re-check unread Gmail inbox messages"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            id="help-btn"
            onClick={onOpenHelp}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-2xs transition-colors"
            title="Help & FAQ"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            id="logout-btn"
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-600 bg-white hover:bg-rose-50 rounded-xl border border-slate-200 shadow-2xs transition-colors"
            title="Disconnect Gmail session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category Counts Bar at a Glance */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          id="filter-urgent-pill"
          onClick={() => onSelectFilter(selectedFilter === 'URGENT' ? 'ALL' : 'URGENT')}
          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
            selectedFilter === 'URGENT'
              ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-500/20 shadow-xs'
              : 'bg-white hover:bg-rose-50/40 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-600">Urgent</div>
              <div className="text-lg font-bold text-slate-900">{stats.urgent}</div>
            </div>
          </div>
          <span className="text-[11px] text-rose-700 bg-rose-100/70 px-1.5 py-0.5 rounded font-medium">
            Today
          </span>
        </button>

        <button
          id="filter-worth-pill"
          onClick={() => onSelectFilter(selectedFilter === 'WORTH_A_LOOK' ? 'ALL' : 'WORTH_A_LOOK')}
          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
            selectedFilter === 'WORTH_A_LOOK'
              ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white hover:bg-amber-50/40 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-600">Worth a Look</div>
              <div className="text-lg font-bold text-slate-900">{stats.worthALook}</div>
            </div>
          </div>
          <span className="text-[11px] text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded font-medium">
            Relevant
          </span>
        </button>

        <button
          id="filter-canwait-pill"
          onClick={() => onSelectFilter(selectedFilter === 'CAN_WAIT' ? 'ALL' : 'CAN_WAIT')}
          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
            selectedFilter === 'CAN_WAIT'
              ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/20 shadow-xs'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-600">Can Wait</div>
              <div className="text-lg font-bold text-slate-900">{stats.canWait}</div>
            </div>
          </div>
          <span className="text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
            Low
          </span>
        </button>

        <button
          id="filter-ignore-pill"
          onClick={() => onSelectFilter(selectedFilter === 'IGNORE' ? 'ALL' : 'IGNORE')}
          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
            selectedFilter === 'IGNORE'
              ? 'bg-zinc-100 border-zinc-400 ring-2 ring-zinc-400/20 shadow-xs'
              : 'bg-white hover:bg-zinc-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-600">Ignore</div>
              <div className="text-lg font-bold text-slate-900">{stats.ignore}</div>
            </div>
          </div>
          <span className="text-[11px] text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded font-medium">
            Noise
          </span>
        </button>

        <button
          id="filter-handled-pill"
          onClick={() => onSelectFilter(selectedFilter === 'HANDLED' ? 'ALL' : 'HANDLED')}
          className={`flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
            selectedFilter === 'HANDLED'
              ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white hover:bg-emerald-50/40 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-600">Handled</div>
              <div className="text-lg font-bold text-emerald-700">{stats.handled}</div>
            </div>
          </div>
          <span className="text-[11px] text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded font-medium">
            {handledPct}%
          </span>
        </button>
      </div>

      {/* Interactive Priority Distribution Analytics Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <PieIcon className="w-4 h-4 text-indigo-600" />
            <span>Real-time Triage Distribution</span>
            <span className="text-slate-400 font-normal">
              ({stats.pending} pending · {stats.handled} cleared)
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            {stats.urgent > 0 ? (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {stats.urgent} urgent action item{stats.urgent > 1 ? 's' : ''} require attention
              </span>
            ) : (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                No urgent bottlenecks!
              </span>
            )}
          </div>
        </div>

        {/* Visual progress bar distribution */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
          {stats.urgent > 0 && (
            <div
              style={{ width: `${(stats.urgent / (stats.total || 1)) * 100}%` }}
              className="bg-rose-500 transition-all duration-300"
              title={`Urgent: ${stats.urgent}`}
            />
          )}
          {stats.worthALook > 0 && (
            <div
              style={{ width: `${(stats.worthALook / (stats.total || 1)) * 100}%` }}
              className="bg-amber-400 transition-all duration-300"
              title={`Worth a Look: ${stats.worthALook}`}
            />
          )}
          {stats.canWait > 0 && (
            <div
              style={{ width: `${(stats.canWait / (stats.total || 1)) * 100}%` }}
              className="bg-slate-400 transition-all duration-300"
              title={`Can Wait: ${stats.canWait}`}
            />
          )}
          {stats.ignore > 0 && (
            <div
              style={{ width: `${(stats.ignore / (stats.total || 1)) * 100}%` }}
              className="bg-zinc-300 transition-all duration-300"
              title={`Ignore: ${stats.ignore}`}
            />
          )}
          {stats.handled > 0 && (
            <div
              style={{ width: `${(stats.handled / (stats.total || 1)) * 100}%` }}
              className="bg-emerald-500 transition-all duration-300"
              title={`Handled: ${stats.handled}`}
            />
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => onSelectFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Active ({stats.pending})
          </button>
          <button
            onClick={() => onSelectFilter('URGENT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedFilter === 'URGENT'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-rose-50 border border-slate-200'
            }`}
          >
            Urgent ({stats.urgent})
          </button>
          <button
            onClick={() => onSelectFilter('WORTH_A_LOOK')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedFilter === 'WORTH_A_LOOK'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-amber-50 border border-slate-200'
            }`}
          >
            Worth a Look ({stats.worthALook})
          </button>
          <button
            onClick={() => onSelectFilter('CAN_WAIT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedFilter === 'CAN_WAIT'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Can Wait ({stats.canWait})
          </button>
          <button
            onClick={() => onSelectFilter('IGNORE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedFilter === 'IGNORE'
                ? 'bg-zinc-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-zinc-100 border border-slate-200'
            }`}
          >
            Ignore ({stats.ignore})
          </button>
          <button
            onClick={() => onSelectFilter('HANDLED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedFilter === 'HANDLED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
            }`}
          >
            Handled Archive ({stats.handled})
          </button>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="email-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search sender, subject..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Main Email Feed List */}
      <div className="space-y-6">
        {filteredEmails.length === 0 ? (
          /* Graceful Inbox Clear / Empty State */
          <div
            id="inbox-empty-state"
            className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto my-8 shadow-xs"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-2xs">
              <CheckCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {searchQuery ? 'No matching emails found' : 'Inbox clear!'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
              {searchQuery
                ? `No emails match "${searchQuery}". Try clearing the search filter.`
                : selectedFilter === 'ALL'
                ? 'All unread inbox messages have been triaged or cleared. You are completely caught up!'
                : `No active messages in the ${selectedFilter.replace(/_/g, ' ')} category.`}
            </p>
            {searchQuery ? (
              <button
                onClick={() => onSearchChange('')}
                className="px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={onRefresh}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Check for New Mail
              </button>
            )}
          </div>
        ) : showGroupedHeaders ? (
          /* Grouped Priority Display: URGENT first */
          <div className="space-y-8">
            {/* 1. URGENT Group */}
            {urgentGroup.length > 0 && (
              <section id="section-urgent" className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-rose-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-rose-800">
                      URGENT — Needs Response Today ({urgentGroup.length})
                    </h2>
                  </div>
                  <span className="text-xs text-rose-600 font-medium">Top Priority</span>
                </div>
                <div className="grid grid-cols-1 gap-3.5">
                  {urgentGroup.map((email) => (
                    <EmailCard
                      key={email.id}
                      email={email}
                      onMarkHandled={onMarkHandled}
                      onRestore={onRestore}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 2. WORTH A LOOK Group */}
            {worthALookGroup.length > 0 && (
              <section id="section-worth-a-look" className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900">
                      WORTH A LOOK — Relevant & Important ({worthALookGroup.length})
                    </h2>
                  </div>
                  <span className="text-xs text-amber-700 font-medium">When you have time</span>
                </div>
                <div className="grid grid-cols-1 gap-3.5">
                  {worthALookGroup.map((email) => (
                    <EmailCard
                      key={email.id}
                      email={email}
                      onMarkHandled={onMarkHandled}
                      onRestore={onRestore}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 3. CAN WAIT Group */}
            {canWaitGroup.length > 0 && (
              <section id="section-can-wait" className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                      CAN WAIT — Newsletters & Receipts ({canWaitGroup.length})
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Low Priority</span>
                </div>
                <div className="grid grid-cols-1 gap-3.5">
                  {canWaitGroup.map((email) => (
                    <EmailCard
                      key={email.id}
                      email={email}
                      onMarkHandled={onMarkHandled}
                      onRestore={onRestore}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 4. IGNORE Group */}
            {ignoreGroup.length > 0 && (
              <section id="section-ignore" className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-zinc-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-600">
                      IGNORE — Marketing & Cold Outreach ({ignoreGroup.length})
                    </h2>
                  </div>
                  <span className="text-xs text-zinc-400 font-medium">Safe to Skip</span>
                </div>
                <div className="grid grid-cols-1 gap-3.5">
                  {ignoreGroup.map((email) => (
                    <EmailCard
                      key={email.id}
                      email={email}
                      onMarkHandled={onMarkHandled}
                      onRestore={onRestore}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* Single Selected Category or Handled View */
          <div className="grid grid-cols-1 gap-3.5">
            {filteredEmails.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                onMarkHandled={onMarkHandled}
                onRestore={onRestore}
              />
            ))}
          </div>
        )}
      </div>

      {/* Compliance & Verification Footer */}
      <footer className="mt-12 py-8 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Google API Limited Use & Privacy Compliant</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLegalModalType('privacy')}
            className="hover:text-slate-800 underline underline-offset-2 cursor-pointer"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setLegalModalType('terms')}
            className="hover:text-slate-800 underline underline-offset-2 cursor-pointer"
          >
            Terms of Service
          </button>
          <button
            onClick={() => setLegalModalType('google-disclosure')}
            className="hover:text-indigo-600 text-indigo-700 font-medium underline underline-offset-2 cursor-pointer"
          >
            Google API Disclosure
          </button>
        </div>
      </footer>

      {/* Legal Modal */}
      {legalModalType && (
        <LegalModal
          isOpen={Boolean(legalModalType)}
          onClose={() => setLegalModalType(null)}
          type={legalModalType}
        />
      )}
    </div>
  );
};
