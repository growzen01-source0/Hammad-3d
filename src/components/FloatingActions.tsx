import React, { useState, useEffect } from 'react';
import { AGENCY_INFO } from '../data/agencyData';
import { ArrowUp, MessageCircle } from 'lucide-react';

export const FloatingActions: React.FC = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 350);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {/* Floating Back to Top Button (Vertically Centered on Right Side) */}
      <div className="fixed top-1/2 -translate-y-1/2 right-3 sm:right-6 z-40 pointer-events-none">
        <div
          className={`transition-all duration-[300ms] ease-in-out transform ${
            showBackToTop
              ? 'opacity-100 translate-x-0 scale-100 pointer-events-auto'
              : 'opacity-0 translate-x-6 scale-90 pointer-events-none'
          }`}
        >
          <button
            onClick={scrollToTop}
            aria-label="Scroll back to top"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#090d14]/90 backdrop-blur-xl border border-white/15 hover:border-[#10f48e]/70 text-neutral-300 hover:text-[#10f48e] flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_0_32px_rgba(16,244,142,0.55)] transition-all duration-[350ms] ease-in-out transform hover:scale-110 hover:-translate-x-1 active:scale-95 cursor-pointer group relative overflow-hidden"
          >
            {/* Soft inner ambient glow aura on hover */}
            <div className="absolute inset-0 bg-radial from-[#10f48e]/30 via-[#10f48e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-[350ms] ease-in-out pointer-events-none" />

            <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-[350ms] ease-in-out group-hover:-translate-y-0.5 group-hover:scale-110 relative z-10" />

            {/* Hover Tooltip */}
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-[#0a0d13]/90 border border-white/15 text-neutral-300 text-[11px] font-mono-tech whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-[250ms] ease-in-out pointer-events-none shadow-xl backdrop-blur-md hidden sm:block">
              Back to Top
            </div>
          </button>
        </div>
      </div>

      {/* Floating WhatsApp Button (Bottom-Left) */}
      <div className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-40">
        <a
          href={AGENCY_INFO.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Growzen on WhatsApp"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-linear-to-br from-[#10f48e] to-[#00d075] text-[#060709] flex items-center justify-center shadow-[0_0_25px_rgba(16,244,142,0.45)] hover:shadow-[0_0_40px_rgba(16,244,142,0.85)] transition-all duration-[300ms] ease-in-out transform hover:scale-110 hover:-translate-y-1 active:scale-95 group relative cursor-pointer"
        >
          {/* Outer radar wave */}
          <span className="absolute inset-0 rounded-full bg-[#10f48e] opacity-40 animate-ping pointer-events-none" />

          <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-current relative z-10" />

          {/* Hover Tooltip */}
          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-[#0a0d13]/90 border border-[#10f48e]/30 text-[#10f48e] text-xs font-mono-tech whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-[300ms] ease-in-out pointer-events-none shadow-xl backdrop-blur-md hidden sm:block">
            Chat on WhatsApp (0331-7157073)
          </div>
        </a>
      </div>
    </>
  );
};
