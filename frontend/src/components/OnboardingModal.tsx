import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api.js';

interface OnboardingModalProps {
  onComplete: (user: { userId: string; name: string }) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [savedName, setSavedName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const cleanNumber = mobileNumber.trim().replace(/[^0-9]/g, '');

    if (!trimmedName || trimmedName.length < 2) {
      setError('Please enter your name (at least 2 characters).');
      return;
    }

    if (!cleanNumber || cleanNumber.length < 10 || cleanNumber.length > 15) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const fullMobile = `${countryCode} ${cleanNumber}`;

    setIsLoading(true);

    try {
      const res = await api.onboardUser({
        name: trimmedName,
        mobile: fullMobile
      });

      if (res.success && res.data) {
        setSavedName(res.data.name);
        setIsSuccess(true);
        // Save safe session locally for duplicate visit detection
        localStorage.setItem('agentheal_user', JSON.stringify({
          userId: res.data.userId,
          name: res.data.name
        }));

        setTimeout(() => {
          onComplete({
            userId: res.data.userId,
            name: res.data.name
          });
        }, 1200);
      } else {
        setError(res.error?.message || 'Something went wrong while creating your profile.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to AgentHeal server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712]/95 backdrop-blur-2xl">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-brand-600/25 via-indigo-500/20 to-accent-cyan/20 rounded-full blur-[110px] pointer-events-none" />

      {/* Main Card */}
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-surface-100/90 border border-slate-700/60 shadow-[0_0_50px_rgba(79,70,229,0.25)] backdrop-blur-xl transition-all duration-300">
        {isSuccess ? (
          /* Success Screen */
          <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 mx-auto rounded-full bg-accent-emerald/20 border border-accent-emerald/40 flex items-center justify-center shadow-glow-emerald">
              <CheckCircle2 className="w-9 h-9 text-accent-emerald animate-bounce" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                You're all set, {savedName}! 🎉
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Personalizing your autonomous AI engineering workspace...
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        ) : (
          /* Onboarding Form */
          <div className="space-y-6">
            {/* Header / Brand */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold shadow-glow">
                <Sparkles className="w-3.5 h-3.5 text-brand-400 fill-brand-400" />
                <span>✦ AgentHeal</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                Welcome to AgentHeal
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Let's personalize your AI engineering workspace.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-2.5 text-xs text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Your name</span>
                  <span className="text-[10px] text-slate-500 font-mono">Required</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name (e.g. Mathavan)"
                  disabled={isLoading}
                  autoFocus
                  className="w-full bg-[#080c16] border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 transition-all disabled:opacity-50"
                />
              </div>

              {/* Mobile Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Mobile number</span>
                  <span className="text-[10px] text-slate-500 font-mono">Required</span>
                </label>
                <div className="flex space-x-2">
                  <div className="flex items-center px-3 bg-[#080c16] border border-slate-700/80 rounded-xl text-xs font-mono text-slate-300 select-none">
                    <span>{countryCode}</span>
                  </div>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter mobile number"
                    disabled={isLoading}
                    className="flex-1 bg-[#080c16] border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving your profile...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to AgentHeal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Privacy note */}
            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
              <span>Stored securely in MongoDB. Never shared publicly.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
