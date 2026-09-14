import React, { useState, useEffect } from 'react';
import { X, Sparkles, MessageCircle, ArrowRight, Gift, CheckCircle2 } from 'lucide-react';
import { AGENCY_INFO } from '../data/agencyData';

interface PromoModalProps {
  onClaimTrial: () => void;
}

export const PromoModal: React.FC<PromoModalProps> = ({ onClaimTrial }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check session storage so it triggers once per session
    const hasSeenPromo = sessionStorage.getItem('growzen_promo_seen');
    if (!hasSeenPromo) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('growzen_promo_seen', 'true');
      }, 6500); // 6.5 seconds after load as requested (5-8s range)

      return () => clearTimeout(timer);
    }
  }, []);

  if (!isOpen) return null;

  const handleWhatsAppClaim = () => {
    setIsOpen(false);
    const text = encodeURIComponent(
      "Hi Growzen! I'd like to claim the FREE 3-Day Trial for Social Media Handling."
    );
    window.open(`${AGENCY_INFO.whatsappUrl}?text=${text}`, '_blank');
  };

  const handleBookingClaim = () => {
    setIsOpen(false);
    onClaimTrial();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in zoom-in-95 duration-300"
    >
      <div className="w-full max-w-md rounded-3xl glass-panel p-6 sm:p-8 border border-[#10f48e]/40 shadow-[0_0_50px_rgba(16,244,142,0.3)] relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#10f48e]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close promotion dialog"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Ribbon */}
        <div className="flex items-center gap-3.5 mb-4 text-[28px]">
          <div className="w-14 h-14 rounded-2xl bg-[#10f48e]/20 text-[#10f48e] flex items-center justify-center border border-[#10f48e]/40 shadow-[0_0_20px_rgba(16,244,142,0.3)] shrink-0">
            <Gift className="w-7 h-7" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-mono-tech uppercase tracking-wider font-bold bg-[#10f48e]/20 text-[#10f48e] border border-[#10f48e]/30">
              Limited Opportunity
            </span>
            <div className="text-sm text-neutral-300 mt-1 font-mono-tech font-medium">
              Exclusive New Client Perk
            </div>
          </div>
        </div>

        {/* Content */}
        <h3 className="font-display font-black text-2xl text-white mb-2 leading-tight">
          🎉 Get a <span className="text-[#10f48e]">FREE 3-Day Trial</span>
        </h3>
        <p className="text-sm font-semibold text-neutral-200 mb-3">
          Social Media Handling & Content Growth
        </p>

        {/* Value Points */}
        <div className="space-y-2.5 mb-6 bg-white/[0.04] border border-white/10 rounded-2xl p-3.5 sm:p-4 text-xs font-mono-tech">
          <div className="flex items-start gap-2.5 text-neutral-200">
            <CheckCircle2 className="w-4 h-4 text-[#10f48e] shrink-0 mt-0.5" />
            <span>Custom post designs & conversion-focused copy</span>
          </div>
          <div className="flex items-start gap-2.5 text-neutral-200">
            <CheckCircle2 className="w-4 h-4 text-[#10f48e] shrink-0 mt-0.5" />
            <span>Targeted daily audience engagement & hashtag research</span>
          </div>
          <div className="flex items-start gap-2.5 text-[#10f48e] font-semibold">
            <CheckCircle2 className="w-4 h-4 text-[#10f48e] shrink-0 mt-0.5" />
            <span>100% Free • No credit card or upfront deposit require</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleBookingClaim}
            className="w-full py-3.5 rounded-2xl bg-linear-to-r from-[#10f48e] to-[#00d075] text-[#060709] text-xs font-bold font-mono-tech uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,244,142,0.4)] hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Claim Free 3-Day Trial</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleWhatsAppClaim}
            className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono-tech uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-[#10f48e]" />
            <span>Claim Instantly via WhatsApp</span>
          </button>
        </div>

        <div className="mt-4 text-center text-[10px] font-mono-tech text-neutral-500">
          No credit card required • Zero lock-in
        </div>
      </div>
    </div>
  );
};
