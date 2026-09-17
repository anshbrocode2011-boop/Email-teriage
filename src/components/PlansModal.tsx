import React, { useState } from 'react';
import { Check, Star, X, ArrowRight, Shield, CreditCard } from 'lucide-react';
import type { PricingTierId } from './LandingView';

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PricingTierId;
  onSelectPlan: (plan: PricingTierId) => void;
  onOpenCheckout?: (plan: PricingTierId, amountINR: number, amountUSD: number) => void;
}

export const PlansModal: React.FC<PlansModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onSelectPlan,
  onOpenCheckout,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  if (!isOpen) return null;

  const plans = [
    {
      id: 'free' as PricingTierId,
      name: 'Starter Free',
      priceUSD: 0,
      priceINR: 0,
      description: 'Essential triage for individual inboxes with daily limits.',
      features: [
        'Analyze up to 50 unread inbox messages',
        'Standard 4-tier category classification',
        'One-sentence summaries & suggested action',
        '1 Daily Executive Digest generation/day',
      ],
    },
    {
      id: 'pro' as PricingTierId,
      name: 'Pro Professional',
      priceUSD: billingCycle === 'annual' ? 10 : 12,
      priceINR: billingCycle === 'annual' ? 799 : 999,
      badge: 'Current' + (currentPlan === 'pro' ? ' (Active)' : ''),
      isPopular: true,
      description: 'Ultra-fast triage, unlimited daily briefings & priority sync.',
      features: [
        'Unlimited inbox triage volume',
        'Gemini 2.5 Flash ultra-fast analysis',
        'Unlimited Executive Briefings on demand',
        'VIP Client & Deadline alert indicators',
        'Priority keyboard shortcuts & quick handle',
      ],
    },
    {
      id: 'executive' as PricingTierId,
      name: 'Executive Suite',
      priceUSD: billingCycle === 'annual' ? 24 : 29,
      priceINR: billingCycle === 'annual' ? 1999 : 2499,
      badge: currentPlan === 'executive' ? 'Active' : undefined,
      description: 'Tailored for founders, executives, and multiple delegated inboxes.',
      features: [
        'Multiple Gmail / Google Workspace accounts',
        'Deep Contextual AI Briefings with sender history',
        'Custom company domain security compliance',
        'Zero data retention encryption guarantee',
      ],
    },
  ];

  return (
    <div
      id="plans-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="plans-modal"
        className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-left my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1">
              <Star className="w-3.5 h-3.5" />
              <span>Subscription Plans</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Inbox Triage Membership Plans
            </h2>
            <p className="text-xs text-slate-500">
              Switch or upgrade your plan anytime to unlock unlimited triage. Supports UPI & Cards via Razorpay.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Billing cycle switch */}
        <div className="flex justify-center my-6">
          <div className="inline-flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === 'annual'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Annual</span>
              <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => {
            const isSelected = currentPlan === p.id;
            return (
              <div
                key={p.id}
                className={`relative p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  p.isPopular
                    ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-500 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {p.badge && (
                  <span className="absolute -top-2.5 left-4 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    {p.badge}
                  </span>
                )}

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 min-h-[32px] leading-relaxed">
                    {p.description}
                  </p>

                  <div className="my-4 pb-4 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">
                        ₹{p.priceINR}
                      </span>
                      <span className="text-xs text-slate-400 font-normal">
                        (${p.priceUSD})
                      </span>
                      <span className="text-xs text-slate-500 font-semibold ml-1">
                        {p.priceINR === 0 ? 'forever' : '/ mo'}
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-600 mb-6">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  {p.priceINR > 0 ? (
                    <button
                      onClick={() => {
                        onClose();
                        if (onOpenCheckout) {
                          onOpenCheckout(p.id, p.priceINR, p.priceUSD);
                        } else {
                          onSelectPlan(p.id);
                        }
                      }}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{isSelected ? 'Renew / Pay via UPI' : `Pay ₹${p.priceINR} via Razorpay`}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onSelectPlan(p.id);
                        onClose();
                      }}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      } cursor-pointer`}
                    >
                      {isSelected ? 'Currently Selected' : `Select ${p.name}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            Accepted via Razorpay: UPI (GPay, PhonePe, Paytm), RuPay, Visa, Mastercard
          </span>
          <button
            onClick={onClose}
            className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
