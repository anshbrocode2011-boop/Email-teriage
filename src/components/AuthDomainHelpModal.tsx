import React, { useState } from 'react';
import { ExternalLink, Copy, Check, ShieldAlert, UserCheck, X, ChevronRight } from 'lucide-react';

interface AuthDomainHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  authDomain: string;
  projectId: string;
}

export const AuthDomainHelpModal: React.FC<AuthDomainHelpModalProps> = ({
  isOpen,
  onClose,
  authDomain,
  projectId,
}) => {
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [copiedOrigin, setCopiedOrigin] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = window.location.origin;
  const testUserEmail = 'anshbrocode2011@gmail.com';

  const copyToClipboard = (text: string, type: 'domain' | 'origin' | 'email') => {
    navigator.clipboard.writeText(text);
    if (type === 'domain') {
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    } else if (type === 'origin') {
      setCopiedOrigin(true);
      setTimeout(() => setCopiedOrigin(false), 2000);
    } else {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const gcpConsentScreenUrl = `https://console.cloud.google.com/apis/credentials/consent?project=${projectId}`;
  const firebaseAuthSettingsUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;
  const gcpCredentialsUrl = `https://console.cloud.google.com/apis/credentials?project=${projectId}`;

  return (
    <div
      id="auth-domain-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="auth-domain-modal"
        className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Fix "App has not completed Google verification"
              </h3>
              <p className="text-xs text-slate-500">
                How to allow your email account in testing mode (takes 30 seconds)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs text-slate-600 max-h-[70vh] overflow-y-auto pr-1">
          {/* PRIMARY FIX: Add Test User */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2.5">
            <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-amber-950 font-semibold">
                <UserCheck className="w-4 h-4 text-amber-600" />
                Step 1: Add Your Email as a "Test User" (Required)
              </span>
              <a
                href={gcpConsentScreenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-indigo-200 shadow-2xs"
              >
                Open OAuth Consent Screen <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="leading-relaxed text-slate-700">
              Because Gmail (<code>gmail.readonly</code>) is a restricted Google API, development apps in "Testing" mode will block any user not explicitly added to the <strong>Test users</strong> list:
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-800">
              <li>Click <strong>Open OAuth Consent Screen</strong> above.</li>
              <li>Scroll down to the <strong>"Test users"</strong> section.</li>
              <li>Click <strong>"+ ADD USERS"</strong>.</li>
              <li>Enter your email address and click <strong>Save</strong>:</li>
            </ol>
            <div className="flex items-center justify-between bg-white border border-amber-200 rounded-lg px-3 py-2 font-mono text-slate-800 text-[11px]">
              <span className="truncate font-semibold">{testUserEmail}</span>
              <button
                onClick={() => copyToClipboard(testUserEmail, 'email')}
                className="ml-2 inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-sans font-semibold shrink-0"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedEmail ? 'Copied' : 'Copy Email'}
              </button>
            </div>
            <p className="text-[11px] text-amber-800 font-medium">
              After adding your email as a test user, click "Connect Gmail" in the app, and you can log in immediately! (If Google shows a warning screen "Google hasn't verified this app", simply click <em>Advanced &rarr; Go to Inbox Triage (unsafe)</em> to proceed).
            </p>
          </div>

          {/* Secondary: Authorized Domains */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
            <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
              <span>Step 2: Verify Firebase Authorized Domain</span>
              <a
                href={firebaseAuthSettingsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
              >
                Firebase Settings <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="leading-relaxed text-slate-600">
              In Firebase Console &rarr; <strong>Authentication</strong> &rarr; <strong>Settings</strong> tab &rarr; <strong>Authorized domains</strong>, ensure this domain is added:
            </p>
            <div className="flex items-center justify-between bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-slate-800 text-[11px]">
              <span className="truncate">{window.location.hostname}</span>
              <button
                onClick={() => copyToClipboard(window.location.hostname, 'domain')}
                className="ml-2 inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-sans font-semibold shrink-0"
              >
                {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedDomain ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Instant Demo Preview Option */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 text-slate-700">
            <strong className="block font-semibold text-slate-900 mb-1">
              Want to explore the app right away?
            </strong>
            <p className="leading-relaxed">
              Click <strong>"preview with sample triage data"</strong> on the main screen to test the full priority dashboard, interactive Gemini filters, and one-click Executive Briefing digest while setting up test user permissions.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
          >
            I've Added the Test User / Got It
          </button>
        </div>
      </div>
    </div>
  );
};
