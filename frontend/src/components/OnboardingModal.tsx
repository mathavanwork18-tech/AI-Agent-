import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Phone,
  Database,
  Lock
} from 'lucide-react';
import { api } from '../services/api.js';

export interface UserSessionData {
  userId: string;
  name: string;
  mobile: string;
  createdAt?: string;
}

interface OnboardingModalProps {
  onComplete: (user: UserSessionData) => void;
}

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+65', country: 'SG', flag: '🇸🇬' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+49', country: 'DE', flag: '🇩🇪' }
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [savedUser, setSavedUser] = useState<UserSessionData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const cleanNumber = mobileNumber.trim().replace(/[^0-9]/g, '');

    if (!trimmedName || trimmedName.length < 2) {
      setError('Please enter your full name (minimum 2 characters).');
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
        const session: UserSessionData = {
          userId: res.data.userId,
          name: res.data.name,
          mobile: res.data.mobile || fullMobile,
          createdAt: res.data.createdAt || new Date().toISOString()
        };

        setSavedUser(session);
        setIsSuccess(true);

        // Store user profile in localStorage so returning visits are recognized
        localStorage.setItem('agentheal_user', JSON.stringify(session));

        setTimeout(() => {
          onComplete(session);
        }, 1200);
      } else {
        setError(res.error?.message || 'Failed to register your details in database.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to connect to AgentHeal database server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030712] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-600/25 via-indigo-500/20 to-accent-cyan/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-accent-emerald/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Decorative Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Main Gatekeeper Card */}
      <div className="relative w-full max-w-lg p-8 md:p-10 rounded-3xl bg-[#080d1a]/95 border border-slate-700/60 shadow-[0_0_60px_rgba(79,70,229,0.3)] backdrop-blur-2xl transition-all duration-300">
        {isSuccess && savedUser ? (
          /* Success Screen */
          <div className="py-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-accent-emerald/20 border border-accent-emerald/40 flex items-center justify-center shadow-glow-emerald">
              <CheckCircle2 className="w-9 h-9 text-accent-emerald animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-white tracking-tight">
                Welcome, {savedUser.name}! 🎉
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Your details have been successfully saved to the database.
              </p>
            </div>

            {/* Stored Details Confirmation Pill */}
            <div className="p-4 rounded-2xl bg-[#050914] border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800/80">
                <span className="flex items-center space-x-1.5 font-medium">
                  <Database className="w-3.5 h-3.5 text-accent-emerald" />
                  <span>Database Status</span>
                </span>
                <span className="text-accent-emerald font-mono font-bold text-[11px] bg-accent-emerald/10 px-2 py-0.5 rounded-full">
                  ● Stored in DB
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-500">Name:</span>
                <span className="font-semibold text-white">{savedUser.name}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-500">Mobile:</span>
                <span className="font-mono text-slate-200">{savedUser.mobile}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-500">User ID:</span>
                <span className="font-mono text-[11px] text-brand-300">{savedUser.userId}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center space-x-2 text-xs text-brand-300">
              <div className="w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
              <span>Entering AgentHeal Workspace...</span>
            </div>
          </div>
        ) : (
          /* Gatekeeper Form */
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold shadow-glow">
                <Sparkles className="w-3.5 h-3.5 text-brand-400 fill-brand-400" />
                <span>✦ AgentHeal Gatekeeper</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Enter Your Details First
              </h2>
              <p className="text-xs md:text-sm text-slate-400 font-medium">
                Please provide your name and phone number to unlock the platform. Your details will be registered in the database.
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
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-brand-400" />
                    <span>Your Full Name</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Required</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name (e.g. Mathavan)"
                  disabled={isLoading}
                  autoFocus
                  required
                  className="w-full bg-[#050813] border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 transition-all disabled:opacity-50"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-brand-400" />
                    <span>Mobile / Phone Number</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">10 Digits</span>
                </label>
                <div className="flex space-x-2">
                  {/* Country Selector */}
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    disabled={isLoading}
                    aria-label="Country Code"
                    className="bg-[#050813] border border-slate-700/80 rounded-xl px-2.5 py-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    {COUNTRY_CODES.map((item) => (
                      <option key={item.code} value={item.code} className="bg-[#050813] text-white">
                        {item.flag} {item.code}
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter phone number (e.g. 9876543210)"
                    disabled={isLoading}
                    required
                    className="flex-1 bg-[#050813] border border-slate-700/80 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/40 transition-all disabled:opacity-50 font-mono"
                  />
                </div>
              </div>

              {/* Storage & Security Notice */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start space-x-2.5 text-[11px] text-slate-400">
                <Database className="w-4 h-4 shrink-0 text-accent-emerald mt-0.5" />
                <span>
                  Your profile is securely written to the database (<strong className="text-slate-300">MongoDB Atlas</strong> or persistent local store).
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-cyan hover:from-brand-500 hover:to-accent-cyan text-white text-xs font-bold shadow-glow flex items-center justify-center space-x-2 transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering details in database...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-white/80" />
                    <span>Save to DB & Enter Website</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>

            {/* Privacy Guarantee */}
            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
              <span>Strict Privacy: Details stored exclusively for your session.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
