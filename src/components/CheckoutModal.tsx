import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  CreditCard,
  QrCode,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Building2,
  Lock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { PricingTierId } from './LandingView';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: PricingTierId;
  planName: string;
  amountINR: number;
  amountUSD: number;
  userEmail?: string | null;
  onPaymentSuccess: (planId: PricingTierId) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  planId,
  planName,
  amountINR,
  amountUSD,
  userEmail,
  onPaymentSuccess,
}) => {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [paymentMethod, setPaymentMethod] = useState<'upi_qr' | 'upi_id' | 'card' | 'netbanking'>('upi_qr');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gatewayConfig, setGatewayConfig] = useState<{ isConfigured: boolean; keyId: string | null } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPaymentSuccess(false);
      setErrorMessage(null);
      setIsProcessing(false);
      // Fetch Razorpay config
      fetch('/api/payment/config')
        .then((res) => res.json())
        .then((data) => setGatewayConfig(data))
        .catch(() => setGatewayConfig({ isConfigured: false, keyId: null }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentAmount = currency === 'INR' ? amountINR : amountUSD;
  const displayPrice = currency === 'INR' ? `₹${amountINR}` : `$${amountUSD}`;

  // Handle standard payment initiation
  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Create order on server
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: currentAmount,
          currency,
          planId,
          planName,
          customerEmail: userEmail || 'user@example.com',
        }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.error || 'Failed to initialize payment');
      }

      const orderData = await orderRes.json();

      // If Razorpay Key is configured and window.Razorpay script exists, open Razorpay popup
      const win = window as any;
      if (orderData.keyId && win.Razorpay && !orderData.isSimulated) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Inbox Triage AI',
          description: `${planName} Subscription`,
          order_id: orderData.id,
          prefill: {
            email: userEmail || 'user@example.com',
          },
          theme: {
            color: '#4f46e5',
          },
          handler: async (response: any) => {
            // Verify payment on backend
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                planId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              triggerSuccess();
            } else {
              setErrorMessage('Payment verification failed. Please contact support.');
            }
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            },
          },
        };
        const rzp = new win.Razorpay(options);
        rzp.open();
      } else {
        // Simulated UPI / Card checkout verification flow
        // Simulates instant UPI bank confirmation after 1.5s
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isSimulated: true,
            planId,
            razorpay_order_id: orderData.id,
            razorpay_payment_id: `pay_upi_${Date.now()}`,
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyData.verified) {
          triggerSuccess();
        } else {
          setErrorMessage('Payment verification failed.');
        }
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Payment could not be processed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerSuccess = () => {
    setPaymentSuccess(true);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      onPaymentSuccess(planId);
      onClose();
    }, 2200);
  };

  return (
    <div
      id="checkout-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="checkout-modal"
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-left my-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/70">
                Razorpay Checkout
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                India (UPI & Cards)
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Upgrade to {planName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {paymentSuccess ? (
          /* Payment Success View */
          <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black text-slate-900">
              Payment Successful!
            </h4>
            <p className="text-sm text-slate-600 max-w-sm mx-auto">
              Your account has been upgraded to <strong>{planName}</strong>. Unlocking unlimited priority triage and executive briefings...
            </p>
          </div>
        ) : (
          /* Main Checkout Details */
          <div className="py-5 space-y-5">
            {/* Price & Currency Switch */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Total Payable</span>
                <span className="text-3xl font-black text-slate-900">
                  {displayPrice}
                </span>
                <span className="text-xs text-slate-500 font-semibold ml-1">/ month</span>
              </div>

              {/* Currency Selector */}
              <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs text-xs font-bold">
                <button
                  onClick={() => setCurrency('INR')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    currency === 'INR'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ₹ INR (UPI)
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    currency === 'USD'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  $ USD
                </button>
              </div>
            </div>

            {/* Indian Payment Options Tabs */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Choose Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi_qr')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'upi_qr'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-500 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs">UPI QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi_id')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'upi_id'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-500 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs">UPI ID / App</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-500 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs">Cards / RuPay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'netbanking'
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-500 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs">Net Banking</span>
                </button>
              </div>
            </div>

            {/* Selected Method View */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              {paymentMethod === 'upi_qr' && (
                <div className="text-center space-y-3">
                  <div className="inline-block p-3 bg-white rounded-xl border border-slate-300 shadow-xs">
                    {/* Visual simulated UPI QR code */}
                    <div className="w-36 h-36 bg-slate-900 rounded-lg p-2 flex flex-col items-center justify-between text-white text-[10px] mx-auto relative overflow-hidden">
                      <div className="grid grid-cols-6 gap-1 w-full h-full p-1 opacity-90">
                        {Array.from({ length: 36 }).map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-xs ${
                              (i % 2 === 0 || i % 7 === 0 || i < 6 || i > 30) ? 'bg-white' : 'bg-transparent'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-indigo-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow">
                          UPI
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">
                    Scan with <strong>Google Pay</strong>, <strong>PhonePe</strong>, <strong>Paytm</strong>, or any BHIM UPI app to pay <strong>{displayPrice}</strong>.
                  </p>
                </div>
              )}

              {paymentMethod === 'upi_id' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    Enter your Virtual Payment Address (VPA / UPI ID)
                  </label>
                  <input
                    type="text"
                    placeholder="yourname@okhdfcbank / mobile@ybl"
                    value={upiIdInput}
                    onChange={(e) => setUpiIdInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200">@okaxis</span>
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200">@ybl</span>
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200">@paytm</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>Domestic & International Cards Accepted:</span>
                    <div className="flex gap-1.5 text-[10px] font-bold text-slate-700">
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200">RuPay</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Visa</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Mastercard</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Supports Indian RBI 2FA verification via SMS OTP and recurring e-mandates.
                  </p>
                </div>
              )}

              {paymentMethod === 'netbanking' && (
                <div className="space-y-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800 block">Popular Indian Banks:</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-1.5 font-medium">
                      <span>🏛️ HDFC Bank</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-1.5 font-medium">
                      <span>🏛️ ICICI Bank</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-1.5 font-medium">
                      <span>🏛️ State Bank of India</span>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center gap-1.5 font-medium">
                      <span>🏛️ Axis Bank</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Gateway notice */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong>Razorpay Sandbox Mode:</strong>
                <span className="block mt-0.5">
                  {gatewayConfig?.isConfigured
                    ? 'Connected with live Razorpay Key.'
                    : 'Interactive simulation active. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env for production merchant checkout.'}
                </span>
              </div>
            </div>

            {/* Action Pay Button */}
            <button
              type="button"
              onClick={handleInitiatePayment}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authorizing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay {displayPrice} via Razorpay</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Trust Footer */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                100% Encrypted Payment
              </span>
              <span>•</span>
              <span>Instant Plan Activation</span>
              <span>•</span>
              <span>Cancel Anytime</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
