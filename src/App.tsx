import React, { useState, useEffect, useTransition } from 'react';
import confetti from 'canvas-confetti';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  setCachedAccessToken,
} from './lib/firebase';
import { fetchUnreadGmailMessages } from './lib/gmail';
import { SAMPLE_INBOX_EMAILS } from './data/mockData';
import { LandingView } from './components/LandingView';
import { LoadingState } from './components/LoadingState';
import { DashboardView } from './components/DashboardView';
import { DailyDigestModal } from './components/DailyDigestModal';
import { HelpModal } from './components/HelpModal';
import { AuthDomainHelpModal } from './components/AuthDomainHelpModal';
import { PlansModal } from './components/PlansModal';
import { OnboardingWalkthrough } from './components/OnboardingWalkthrough';
import type { PricingTierId } from './components/LandingView';
import firebaseConfig from '../firebase-applet-config.json';
import type { EmailItem, EmailCategory, TriageStats } from './types';
import type { User } from 'firebase/auth';

const STORAGE_KEY_EMAILS = 'inbox_triage_emails_v1';
const STORAGE_KEY_WALKTHROUGH = 'inbox_triage_walkthrough_dismissed';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricingTierId>('pro');
  const [isPlansModalOpen, setIsPlansModalOpen] = useState(false);

  // Email state
  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [loadingSubtext, setLoadingSubtext] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });

  // UI state
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | EmailCategory | 'HANDLED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDigestOpen, setIsDigestOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDomainGuideOpen, setIsDomainGuideOpen] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize Firebase Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setIsAuthChecking(false);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setIsAuthChecking(false);
      }
    );

    // Check if walkthrough was previously dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY_WALKTHROUGH);
    if (!dismissed) {
      setShowWalkthrough(true);
    }

    return () => unsubscribe();
  }, []);

  // Handle Google Sign-in
  const handleConnectGmail = async (plan?: PricingTierId) => {
    if (plan) {
      setSelectedPlan(plan);
    }
    setIsConnecting(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        // Immediately fetch and triage inbox
        await fetchAndTriageGmail(result.accessToken);
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        // User closed or dismissed the popup voluntarily; no persistent error needed
        setAuthError(null);
      } else if (
        err.code === 'auth/unauthorized-domain' ||
        err.message?.includes('unauthorized domain') ||
        err.message?.includes('access_blocked') ||
        err.message?.includes('origin')
      ) {
        setAuthError(
          `The current domain (${window.location.hostname}) is not yet added to your Firebase Authorized Domains or Google Cloud OAuth origins. Click the button below for quick instructions to allow it.`
        );
        setIsDomainGuideOpen(true);
      } else {
        console.error('Sign-in error:', err);
        setAuthError(err.message || 'Could not connect to Google. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Preview with sample data
  const handleExploreDemo = () => {
    setEmails(SAMPLE_INBOX_EMAILS);
  };

  // Disconnect / Sign out
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setEmails([]);
    localStorage.removeItem(STORAGE_KEY_EMAILS);
  };

  // Fetch unread messages from Gmail and triage with Gemini
  const fetchAndTriageGmail = async (token: string) => {
    setIsLoadingEmails(true);
    setLoadingStatus('Connecting to your Gmail inbox...');
    setLoadingSubtext('Pulling the most recent unread messages securely via gmail.readonly');
    setLoadingProgress({ current: 0, total: 0 });

    try {
      // 1. Fetch raw messages from Gmail REST API
      const rawMessages = await fetchUnreadGmailMessages(
        token,
        50,
        (current, total) => {
          setLoadingStatus(`Reading inbox messages (${current} of ${total})...`);
          setLoadingProgress({ current, total });
        }
      );

      if (rawMessages.length === 0) {
        setEmails([]);
        setIsLoadingEmails(false);
        return;
      }

      // 2. Prepare payload for Gemini API triage
      setLoadingStatus('Sorting the important stuff with Gemini...');
      setLoadingSubtext('Evaluating urgent deadlines, key questions, newsletters, and noise');
      setLoadingProgress({ current: 0, total: rawMessages.length });

      // Call our server-side /api/triage endpoint
      const triagePayload = rawMessages.map((m) => ({
        id: m.id,
        sender: m.sender,
        subject: m.subject,
        body: m.bodySnippet,
      }));

      const triageRes = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: triagePayload }),
      });

      if (!triageRes.ok) {
        const errorData = await triageRes.json().catch(() => ({}));
        throw new Error(errorData.error || `Triage error (${triageRes.status})`);
      }

      const { results } = await triageRes.json();
      const resultsMap = new Map<string, { category: EmailCategory; summary: string; suggestedAction: string }>();
      results.forEach((r: any) => {
        resultsMap.set(r.id, {
          category: r.category,
          summary: r.summary,
          suggestedAction: r.suggestedAction,
        });
      });

      // 3. Assemble triaged EmailItem list
      const triagedItems: EmailItem[] = rawMessages.map((msg) => {
        const aiInfo = resultsMap.get(msg.id) || {
          category: 'WORTH_A_LOOK' as EmailCategory,
          summary: msg.subject ? `Subject: ${msg.subject}` : 'Email requiring review',
          suggestedAction: 'Review details in Gmail',
        };

        return {
          id: msg.id,
          threadId: msg.threadId,
          sender: msg.sender,
          senderName: msg.senderName,
          senderEmail: msg.senderEmail,
          subject: msg.subject,
          date: msg.date,
          snippet: msg.snippet || '',
          category: aiInfo.category,
          summary: aiInfo.summary,
          suggestedAction: aiInfo.suggestedAction,
          isHandled: false,
          analyzedAt: Date.now(),
        };
      });

      setEmails(triagedItems);
    } catch (err: any) {
      console.error('Fetch and triage error:', err);
      if (err.message === 'AUTH_EXPIRED') {
        setAuthError('Your Gmail session expired. Please sign in again.');
        setUser(null);
        setAccessToken(null);
      } else {
        setAuthError(`Unable to complete triage: ${err.message}. Showing preview workspace.`);
        // Fallback to sample data if user wants to inspect UI
        if (emails.length === 0) {
          setEmails(SAMPLE_INBOX_EMAILS);
        }
      }
    } finally {
      setIsLoadingEmails(false);
      setIsRefreshing(false);
    }
  };

  // Re-check inbox
  const handleRefresh = async () => {
    if (accessToken) {
      setIsRefreshing(true);
      await fetchAndTriageGmail(accessToken);
    } else {
      // In demo mode, reset sample
      setEmails(SAMPLE_INBOX_EMAILS.map((e) => ({ ...e, isHandled: false })));
    }
  };

  // Mark as handled with satisfying celebration animation
  const handleMarkHandled = (id: string) => {
    setEmails((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isHandled: true, handledAt: Date.now() } : item
      )
    );

    // Subtle micro-confetti burst from click
    try {
      confetti({
        particleCount: 18,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#4f46e5', '#10b981', '#f59e0b'],
        disableForReducedMotion: true,
      });
    } catch (e) {
      // ignore
    }
  };

  // Restore handled email
  const handleRestore = (id: string) => {
    setEmails((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isHandled: false, handledAt: undefined } : item
      )
    );
  };

  // Dismiss Walkthrough banner
  const handleDismissWalkthrough = () => {
    setShowWalkthrough(false);
    localStorage.setItem(STORAGE_KEY_WALKTHROUGH, 'true');
  };

  // Calculate statistics
  const activeEmails = emails.filter((e) => !e.isHandled);
  const handledEmails = emails.filter((e) => e.isHandled);

  const stats: TriageStats = {
    total: emails.length,
    urgent: activeEmails.filter((e) => e.category === 'URGENT').length,
    worthALook: activeEmails.filter((e) => e.category === 'WORTH_A_LOOK').length,
    canWait: activeEmails.filter((e) => e.category === 'CAN_WAIT').length,
    ignore: activeEmails.filter((e) => e.category === 'IGNORE').length,
    handled: handledEmails.length,
    pending: activeEmails.length,
  };

  // If initial auth check is in flight
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingState statusText="Starting Inbox Triage..." subText="Checking session state..." />
      </div>
    );
  }

  // Not connected yet and no demo emails loaded
  if (!user && emails.length === 0 && !isLoadingEmails) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
        <AuthDomainHelpModal
          isOpen={isDomainGuideOpen}
          onClose={() => setIsDomainGuideOpen(false)}
          authDomain={firebaseConfig.authDomain}
          projectId={firebaseConfig.projectId}
        />
        <LandingView
          onConnect={handleConnectGmail}
          onExploreDemo={handleExploreDemo}
          onOpenDomainGuide={() => setIsDomainGuideOpen(true)}
          isLoading={isConnecting}
          error={authError}
        />
        <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200/60 flex items-center justify-center gap-4">
          <span>Inbox Triage · Powered by Google Gemini 2.5 Flash & Gmail API · Read-only access</span>
          <button
            onClick={() => setIsDomainGuideOpen(true)}
            className="text-indigo-600 hover:text-indigo-800 underline font-medium"
          >
            Domain / Origin Setup Help
          </button>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 pb-16">
      {/* Auth Domain Guide Modal */}
      <AuthDomainHelpModal
        isOpen={isDomainGuideOpen}
        onClose={() => setIsDomainGuideOpen(false)}
        authDomain={firebaseConfig.authDomain}
        projectId={firebaseConfig.projectId}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onDisconnect={handleLogout}
        isConnected={Boolean(user)}
      />

      {/* Daily Digest Modal */}
      <DailyDigestModal
        emails={emails}
        isOpen={isDigestOpen}
        onClose={() => setIsDigestOpen(false)}
      />

      {/* Plans & Pricing Modal */}
      <PlansModal
        isOpen={isPlansModalOpen}
        onClose={() => setIsPlansModalOpen(false)}
        currentPlan={selectedPlan}
        onSelectPlan={(plan) => setSelectedPlan(plan)}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto pt-6 px-4">
        {/* Onboarding Walkthrough Banner if first time */}
        {showWalkthrough && emails.length > 0 && !isLoadingEmails && (
          <OnboardingWalkthrough onDismiss={handleDismissWalkthrough} />
        )}

        {/* Loading Screen during email retrieval/analysis */}
        {isLoadingEmails ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <LoadingState
              statusText={loadingStatus}
              subText={loadingSubtext}
              progress={loadingProgress}
            />
          </div>
        ) : (
          <DashboardView
            emails={emails}
            stats={stats}
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onMarkHandled={handleMarkHandled}
            onRestore={handleRestore}
            onOpenDigest={() => setIsDigestOpen(true)}
            onOpenHelp={() => setIsHelpOpen(true)}
            onOpenPlans={() => setIsPlansModalOpen(true)}
            selectedPlan={selectedPlan}
            onRefresh={handleRefresh}
            onLogout={handleLogout}
            userEmail={user?.email || (emails[0]?.isMockDemo ? 'demo@inboxtriage.preview' : null)}
            isRefreshing={isRefreshing}
          />
        )}
      </main>
    </div>
  );
}
