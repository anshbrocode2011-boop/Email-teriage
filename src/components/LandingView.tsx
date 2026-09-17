import React, { useState } from 'react';
import {
  Mail,
  Shield,
  Zap,
  Sparkles,
  Check,
  Star,
  ArrowRight,
  Inbox,
  Lock,
  Bot,
  Menu,
  X,
  ChevronRight,
  CheckCircle2,
  Users,
  Building2,
  ShieldCheck,
  Eye,
  KeyRound,
  FileCheck,
  CreditCard,
  Smartphone
} from 'lucide-react';

export type PricingTierId = 'free' | 'pro' | 'executive';

interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface PricingPlan {
  id: PricingTierId;
  name: string;
  badge?: string;
  priceMonthly: number;
  priceAnnual: number;
  description: string;
  ctaText: string;
  isPopular?: boolean;
  features: PlanFeature[];
}

const PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Starter Free',
    priceMonthly: 0,
    priceAnnual: 0,
    description: 'Essential AI email triage for individual inboxes with zero cost forever.',
    ctaText: 'Start Free with Gmail',
    features: [
      { text: 'Analyze up to 50 unread inbox messages', included: true },
      { text: 'Standard 4-tier category classification', included: true },
      { text: 'One-sentence plain language summaries', included: true },
      { text: 'Suggested action recommendations', included: true },
      { text: '1 Daily Executive Digest generation/day', included: true },
      { text: 'Interactive priority dashboard & search', included: true },
      { text: 'VIP Client & Deadline alert badges', included: false },
      { text: 'Multi-inbox workspace aggregation', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro Professional',
    badge: 'Most Popular',
    priceMonthly: 12,
    priceAnnual: 10,
    description: 'High-speed autonomous triage, unlimited daily digests & priority sync.',
    ctaText: 'Upgrade to Pro & Connect',
    isPopular: true,
    features: [
      { text: 'Unlimited inbox triage volume', included: true, highlight: true },
      { text: 'Gemini 2.5 Flash ultra-fast analysis', included: true },
      { text: 'Unlimited Executive Briefing digests on demand', included: true, highlight: true },
      { text: 'VIP Client & Deadline alert badges', included: true },
      { text: 'Custom keywords & sender rules', included: true },
      { text: 'Batch mark-handled keyboard shortcuts', included: true },
      { text: 'Export summaries to Slack or Notion', included: true },
      { text: 'Dedicated priority email support', included: true },
    ],
  },
  {
    id: 'executive',
    name: 'Executive Suite',
    badge: 'Power Users',
    priceMonthly: 29,
    priceAnnual: 24,
    description: 'Tailored for founders, executives, and multiple delegated inboxes.',
    ctaText: 'Activate Executive & Connect',
    features: [
      { text: 'Multiple Gmail / Google Workspace accounts', included: true, highlight: true },
      { text: 'Deep Contextual AI Briefings with sender history', included: true, highlight: true },
      { text: 'Automated morning WhatsApp or email digests', included: true },
      { text: 'Custom company domain security compliance', included: true },
      { text: 'Zero data retention enterprise encryption', included: true },
      { text: 'Delegated assistant access support', included: true },
      { text: '1-on-1 priority onboarding', included: true },
      { text: '24/7 dedicated escalation channel', included: true },
    ],
  },
];

interface LandingViewProps {
  onConnect: (selectedPlan?: PricingTierId) => void;
  onExploreDemo?: () => void;
  onOpenDomainGuide?: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onConnect,
  onExploreDemo,
  onOpenDomainGuide,
  isLoading,
  error,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [selectedPlan, setSelectedPlan] = useState<PricingTierId>('pro');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-slate-50/70 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-200">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                  Inbox Triage
                </span>
                <span className="hidden xs:inline-block text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-full">
                  AI
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-400 font-medium">
                Executive Email Intelligence
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <button
              onClick={() => scrollToSection('plans-section')}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Plans & Pricing
            </button>
            <button
              onClick={() => scrollToSection('features-section')}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('security-section')}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Security & Privacy
            </button>
            {onExploreDemo && (
              <button
                onClick={onExploreDemo}
                className="text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer flex items-center gap-1 font-bold"
              >
                <span>Live Demo</span>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
              </button>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="top-nav-connect-btn"
              onClick={() => onConnect(selectedPlan)}
              disabled={isLoading}
              className="group inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0">
                <svg className="w-3 h-3" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <span className="hidden xs:inline">{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
              <span className="xs:hidden">{isLoading ? '...' : 'Sign In'}</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-3 pb-5 bg-white border-b border-slate-200 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
            <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
              <button
                onClick={() => scrollToSection('plans-section')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-indigo-600"
              >
                Plans & Pricing
              </button>
              <button
                onClick={() => scrollToSection('features-section')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-indigo-600"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('security-section')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-50 hover:text-indigo-600"
              >
                Security & Privacy
              </button>
              {onExploreDemo && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onExploreDemo();
                  }}
                  className="text-left px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-between"
                >
                  <span>Explore Live Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION WITH LUXURY BENTO LOGIN CARD */}
      <section className="relative pt-8 sm:pt-14 pb-14 sm:pb-20 px-4 sm:px-6 overflow-hidden border-b border-slate-200/80">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-indigo-100/50 via-slate-50/20 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto">
          {/* Main Grid: Headline Left / Premium Login Card Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Content (Cols 1-7) */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-indigo-100 text-indigo-700 text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Executive Intelligence · Gemini 2.5 Flash</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Reclaim 2 hours daily from your <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600">
                  Gmail inbox
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Inbox Triage autonomously scans incoming unread messages, categorizes them into
                <strong> Urgent</strong>, <strong>Worth a Look</strong>, <strong>Can Wait</strong>, and <strong>Ignore</strong>,
                and prepares a concise 1-minute morning briefing.
              </p>

              {/* Error Banner if triggered */}
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs max-w-lg mx-auto lg:mx-0 text-left space-y-2.5 shadow-xs">
                  <div>
                    <strong className="font-semibold block mb-0.5">Authentication Notice:</strong>
                    <span>{error}</span>
                  </div>
                  {onOpenDomainGuide && (
                    <button
                      id="open-domain-fix-btn"
                      onClick={onOpenDomainGuide}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-2xs"
                    >
                      <span>Fix Authorization / Add Test User</span>
                      <span>&rarr;</span>
                    </button>
                  )}
                </div>
              )}

              {/* Quick Feature Pill Strip */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 shadow-2xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Read-only access
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 shadow-2xs font-medium">
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  Transient memory only
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 shadow-2xs font-medium">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  Instant 60s setup
                </span>
              </div>
            </div>

            {/* Right: PREMIUM LOGIN & ACCESS CARD (Cols 8-12) */}
            <div className="lg:col-span-5 w-full max-w-md mx-auto">
              <div className="relative bg-white rounded-3xl p-6 sm:p-7 shadow-xl shadow-indigo-900/5 border border-slate-200/90 text-left">
                {/* Header inside Card */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                      Sign In & Access
                    </span>
                    <h2 className="text-xl font-black text-slate-900 mt-0.5">
                      Connect Workspace
                    </h2>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                    <KeyRound className="w-5 h-5" />
                  </div>
                </div>

                {/* Plan Selector preview in card */}
                <div className="pt-4 space-y-3">
                  <label className="block text-xs font-semibold text-slate-700">
                    Selected Membership:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/70 text-center">
                    {(['free', 'pro', 'executive'] as PricingTierId[]).map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setSelectedPlan(tier)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize ${
                          selectedPlan === tier
                            ? 'bg-white text-indigo-700 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {tier}
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>
                      {selectedPlan === 'free' && 'Starter Free tier ($0 forever)'}
                      {selectedPlan === 'pro' && 'Pro tier ($10/mo billed annually)'}
                      {selectedPlan === 'executive' && 'Executive Suite ($24/mo)'}
                    </span>
                    <button
                      onClick={() => scrollToSection('plans-section')}
                      className="text-indigo-600 hover:underline font-semibold"
                    >
                      Compare
                    </button>
                  </p>

                  {/* Primary Google Login Button */}
                  <div className="pt-2">
                    <button
                      id="hero-connect-btn"
                      onClick={() => onConnect(selectedPlan)}
                      disabled={isLoading}
                      className="group relative w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-indigo-500 shadow-sm hover:shadow-md active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {/* Google G Logo */}
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          fill="#EA4335"
                        />
                      </svg>
                      <span>{isLoading ? 'Connecting...' : 'Sign In with Google'}</span>
                    </button>
                  </div>

                  {/* Or Explore Live Demo */}
                  {onExploreDemo && (
                    <div className="pt-2">
                      <button
                        id="hero-explore-demo-btn"
                        onClick={onExploreDemo}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-100 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Or preview dashboard with sample data</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Trust details footer in card */}
                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Strict read-only permissions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>No credit card required for Starter Free</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Live Preview Card Teaser */}
        <div className="max-w-4xl mx-auto mt-12 sm:mt-16 p-2 bg-slate-200/80 rounded-2xl sm:rounded-3xl shadow-lg border border-slate-300/80">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Sample Active Triage Feed
                </span>
              </div>
              <span className="text-slate-400 text-[11px]">Preview layout below</span>
            </div>

            {/* Sample Mini Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                    URGENT
                  </span>
                  <span className="text-[10px] text-slate-400">42m ago</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                  Board deck revisions needed before 3pm presentation today
                </h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  <strong>Summary:</strong> CEO requires slide updates for investor presentation.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                    WORTH A LOOK
                  </span>
                  <span className="text-[10px] text-slate-400">2h ago</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                  Updated design system tokens and navigation hierarchy specs
                </h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  <strong>Summary:</strong> Product design team revised navigation mocks after user tests.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLANS & PRICING SECTION */}
      <section id="plans-section" className="py-16 sm:py-24 px-4 sm:px-6 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
              <Star className="w-3.5 h-3.5" />
              <span>Transparent Membership Plans</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Simple plans for every inbox volume
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal">
              Get started with Free to triage today's mail, or upgrade to Pro for autonomous continuous intelligence.
            </p>

            {/* Annual vs Monthly Toggle */}
            <div className="inline-flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Annual Billing</span>
                <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan) => {
              const price = billingCycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
              const isCurrentSelected = selectedPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl transition-all duration-200 cursor-pointer ${
                    plan.isPopular
                      ? 'bg-gradient-to-b from-indigo-50/70 to-white border-2 border-indigo-600 shadow-xl'
                      : 'bg-white border border-slate-200 hover:border-slate-300 shadow-sm'
                  } ${isCurrentSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-wider px-3.5 py-0.5 rounded-full shadow-sm">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    {/* Plan Name & Desc */}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                      <input
                        type="radio"
                        name="plan-radio"
                        checked={isCurrentSelected}
                        onChange={() => setSelectedPlan(plan.id)}
                        className="text-indigo-600 focus:ring-indigo-500 h-4 w-4 mt-1"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mb-6 leading-relaxed min-h-[36px]">
                      {plan.description}
                    </p>

                    {/* Price display */}
                    <div className="mb-6 pb-6 border-b border-slate-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-slate-900">
                          ${price}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {price === 0 ? 'forever' : '/ user / month'}
                        </span>
                      </div>
                      {price > 0 && billingCycle === 'annual' && (
                        <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                          Billed annually (${price * 12}/year)
                        </span>
                      )}
                    </div>

                    {/* Feature List */}
                    <ul className="space-y-3 text-xs text-slate-600 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          {feature.included ? (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <span className="w-4 h-4 text-slate-300 shrink-0 mt-0.5 font-bold text-center">
                              –
                            </span>
                          )}
                          <span
                            className={`${
                              feature.included ? 'text-slate-800' : 'text-slate-400 line-through'
                            } ${feature.highlight ? 'font-semibold text-indigo-950' : ''}`}
                          >
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Connect Email CTA */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onConnect(plan.id);
                    }}
                    disabled={isLoading}
                    className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                      plan.isPopular
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick reassurance strip */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">
              ⚡ No credit card required to get started with Free tier.
            </span>
            <div className="flex items-center gap-4 text-slate-500 flex-wrap">
              <span>✓ Cancel anytime</span>
              <span>✓ Upgrade as your inbox grows</span>
              <span>✓ Google Workspace supported</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES EXPLANATION */}
      <section id="features-section" className="py-16 sm:py-24 px-4 sm:px-6 bg-slate-50/50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5" />
              <span>Engineered for Focus</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How Inbox Triage Works
            </h2>
            <p className="text-sm text-slate-600">
              Three simple steps between inbox chaos and total communication clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">4-Tier Priority Classification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gemini analyzes subject, sender, and email body to separate high-stakes client requests from newsletters and cold outreach.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">One-Sentence Plain Summaries</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every thread receives a distilled one-sentence summary and a suggested next step, like "Confirm time for tomorrow" or "No action needed".
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Executive Daily Briefing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                One-click generates a clean executive paragraph synthesizing active deadlines, so you can prep in 30 seconds before your morning coffee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY & SECURITY SECTION */}
      <section id="security-section" className="py-16 sm:py-20 px-4 sm:px-6 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Built strictly on read-only permissions
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              We never request permission to send, edit, or delete emails. Your inbox remains your own, untouched.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h4 className="font-bold text-slate-900 text-xs mb-1">gmail.readonly Scope</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                The minimum OAuth scope necessary to analyze unread subjects and body snippets.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h4 className="font-bold text-slate-900 text-xs mb-1">In-Memory Triage</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Full email bodies are evaluated transiently with Gemini and never stored in a server database.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h4 className="font-bold text-slate-900 text-xs mb-1">Instant Disconnect</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Sign out at any moment to flush the memory access token and end session access.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => onConnect(selectedPlan)}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Get Started with Selected Plan ({PLANS.find((p) => p.id === selectedPlan)?.name})
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
