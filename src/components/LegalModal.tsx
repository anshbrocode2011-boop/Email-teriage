import React from 'react';
import { X, Shield, Lock, FileText, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms' | 'google-disclosure';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[88vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              {type === 'privacy' && <Shield className="w-5 h-5" />}
              {type === 'terms' && <FileText className="w-5 h-5" />}
              {type === 'google-disclosure' && <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {type === 'privacy' && 'Privacy Policy'}
                {type === 'terms' && 'Terms of Service'}
                {type === 'google-disclosure' && 'Google API Limited Use & Security Disclosure'}
              </h2>
              <p className="text-xs text-slate-500">
                Inbox Triage • Last updated: September 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm leading-relaxed">
          {type === 'privacy' && (
            <>
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 space-y-1.5">
                <p className="font-semibold text-indigo-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  Google API Services User Data Policy Compliance Summary
                </p>
                <p>
                  Inbox Triage's use and transfer to any other app of information received from Google APIs adheres to the{' '}
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline hover:text-indigo-700 inline-flex items-center gap-0.5"
                  >
                    Google API Services User Data Policy <ExternalLink className="w-3 h-3" />
                  </a>
                  , including the <strong>Limited Use</strong> requirements.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                  1. Information We Access
                </h3>
                <p>
                  When you authenticate via Google OAuth, Inbox Triage requests access strictly to the{' '}
                  <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs text-slate-800 font-mono">
                    https://www.googleapis.com/auth/gmail.readonly
                  </code>{' '}
                  scope. This allows the application to read your unread message snippets, subject lines, senders, and timestamps.
                </p>
                <p className="text-slate-600 text-xs">
                  We <strong>never</strong> request or obtain write, modify, send, or delete permissions for your emails.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                  2. How We Use Google User Data
                </h3>
                <p>
                  User data obtained through Google APIs is used solely to provide user-facing features:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                  <li>Categorizing unread emails into actionable priority tiers (Action Required, Important, Fiscal, Informational).</li>
                  <li>Generating one-sentence summaries and recommended next actions.</li>
                  <li>Compiling an optional executive daily digest synthesized across your inbox.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                  3. In-Memory Processing & Zero Permanent Storage of Email Content
                </h3>
                <p>
                  Inbox Triage processes email bodies <strong>transiently in memory</strong>. Your email contents are never stored on any permanent server database, never serialized to disk, and never shared with third parties. Once your browser session ends or you disconnect your account, access tokens are flushed.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                  4. Artificial Intelligence & Machine Learning Policy
                </h3>
                <p>
                  We do <strong>NOT</strong> use Google user data (such as Gmail email bodies, subjects, or sender metadata) to train, retrain, fine-tune, or improve generalized machine learning or artificial intelligence models.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                  5. Revocation and Data Deletion
                </h3>
                <p>
                  You can revoke Inbox Triage's access at any time directly through your{' '}
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 font-medium underline inline-flex items-center gap-0.5"
                  >
                    Google Account Security Settings <ExternalLink className="w-3 h-3" />
                  </a>
                  {' '}or by clicking "Disconnect & Sign Out" inside the application.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                  6. Contact & Data Protection Officer
                </h3>
                <p className="text-xs text-slate-600">
                  For privacy inquiries, audit requests, or data deletion confirmations, reach our team at{' '}
                  <span className="font-semibold text-slate-900">support@inboxtriage.app</span> or submit through the in-app help desk.
                </p>
              </section>
            </>
          )}

          {type === 'terms' && (
            <>
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                  1. Agreement to Terms
                </h3>
                <p>
                  By accessing or using Inbox Triage, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                  2. Description of Service
                </h3>
                <p>
                  Inbox Triage is a productivity assistant designed to synthesize and prioritize email messages. The service provides read-only analysis to aid communication workflow efficiency.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                  3. User Responsibilities
                </h3>
                <p>
                  You represent that you have legal authority to connect the associated Google/Gmail account and that doing so does not violate your employer's or institution's corporate data security policies.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                  4. Intellectual Property & Trademarks
                </h3>
                <p className="text-xs text-slate-600">
                  Gmail and Google Workspace are registered trademarks of Google LLC. Inbox Triage is an independent application and is not endorsed by or affiliated with Google LLC.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                  5. Limitation of Liability
                </h3>
                <p className="text-xs text-slate-600">
                  The service is provided on an "AS IS" and "AS AVAILABLE" basis. Inbox Triage shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
                </p>
              </section>
            </>
          )}

          {type === 'google-disclosure' && (
            <>
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                <p className="font-semibold text-amber-950 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  Mandatory Google API Verification Notice
                </p>
                <p>
                  This disclosure outlines our application's exact compliance with Google's API Services User Data Policy, specifically the <strong>Limited Use</strong> requirements for Restricted Scopes.
                </p>
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                  A. Requested Scopes & Justification
                </h3>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-mono font-semibold text-indigo-700">https://www.googleapis.com/auth/gmail.readonly</div>
                  <p className="text-slate-600">
                    <strong>Why requested:</strong> Required exclusively to read message headers (from, subject, date) and message bodies of unread emails to produce user-visible priority categories and summaries.
                  </p>
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                  B. Strict Limited Use Guarantees
                </h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>No Secondary Use:</strong> Data accessed via Gmail API is strictly used to provide or improve prominent user-facing triage features visible in the Inbox Triage dashboard.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>No Transfers to Third Parties:</strong> We do not sell, rent, or transfer email data to third parties, advertising platforms, data brokers, or information resellers under any circumstances.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>No Advertising or Targeted Profiling:</strong> Email content is never used for serving advertisements, retargeting, or consumer profiling.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>No Human Inspection:</strong> No human employees or contractors ever read your email contents, unless required by applicable law or you provide explicit written authorization for technical support.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>No AI Model Training:</strong> Email body text is never stored or used to train foundational AI/ML models.</span>
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                  C. Security & Encryption Standards
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All communication between your client browser, our secure application server, and Google API servers occurs exclusively over industry-standard TLS 1.3 encryption. Auth tokens are maintained with short expirations and are strictly memory-resident.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Compliant with Google API Services User Data Policy
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
