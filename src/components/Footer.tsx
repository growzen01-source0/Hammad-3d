import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AGENCY_INFO } from '../data/agencyData';
import {
  Sparkles,
  MessageCircle,
  Instagram,
  Facebook,
  ShieldCheck,
  CreditCard,
  FileText,
  X,
} from 'lucide-react';

type PolicyType = 'privacy' | 'refund' | 'terms';

interface PolicyContent {
  id: PolicyType;
  title: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string;
}

const POLICIES: Record<PolicyType, PolicyContent> = {
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    badge: 'Confidentiality & Data Protection',
    icon: ShieldCheck,
    content:
      'At Growzen, we respect your privacy. Any information you share with us — including your name, phone number, and project details — is used solely to understand your requirements and provide our services. We do not sell, rent, or share your personal data with third parties. All communication remains confidential and secure.',
  },
  refund: {
    id: 'refund',
    title: 'Payment & Refund Policy',
    badge: 'Transparent Milestone Terms',
    icon: CreditCard,
    content:
      'Payments are agreed upon before project commencement based on the scope of work discussed. Advance payment may be required to begin work, with the remaining balance due upon project completion or as per milestone agreement. Refunds are considered on a case-by-case basis if work has not yet started; once a project is in progress, partial refunds may apply depending on completed milestones.',
  },
  terms: {
    id: 'terms',
    title: 'Terms of Service',
    badge: 'Collaboration & Deliverables',
    icon: FileText,
    content:
      'By using our services or submitting a request through this website, you agree to work with Growzen in good faith, provide accurate project information, and communicate clearly regarding requirements and feedback. Growzen reserves the right to decline projects that do not align with our capabilities or values.',
  },
};

export const Footer: React.FC = () => {
  const [activePolicy, setActivePolicy] = useState<PolicyType | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActivePolicy(null);
      }
    };
    if (activePolicy) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activePolicy]);

  const socialLinks = [
    {
      name: 'WhatsApp',
      href: AGENCY_INFO.socials.whatsapp,
      icon: MessageCircle,
      color: 'hover:text-[#10f48e] hover:border-[#10f48e]/50 hover:shadow-[0_0_20px_rgba(16,244,142,0.4)]',
    },
    {
      name: 'Instagram',
      href: AGENCY_INFO.socials.instagram,
      icon: Instagram,
      color: 'hover:text-[#e1306c] hover:border-[#e1306c]/50 hover:shadow-[0_0_20px_rgba(225,48,108,0.4)]',
    },
    {
      name: 'Facebook',
      href: AGENCY_INFO.socials.facebook,
      icon: Facebook,
      color: 'hover:text-[#1877f2] hover:border-[#1877f2]/50 hover:shadow-[0_0_20px_rgba(24,119,242,0.4)]',
    },
    {
      name: 'TikTok',
      href: AGENCY_INFO.socials.tiktok,
      // TikTok custom SVG icon wrapper
      customSvg: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.16 1.19 2.09 2.38 2.26.98.15 2-.11 2.72-.78.67-.61.99-1.52 1.01-2.42.04-4.8.02-9.61.03-14.41z" />
        </svg>
      ),
      color: 'hover:text-[#00f2fe] hover:border-[#00f2fe]/50 hover:shadow-[0_0_20px_rgba(0,242,254,0.4)]',
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      className="relative z-10 bg-linear-to-b from-[#06080d]/95 via-[#040508]/98 to-[#020304] backdrop-blur-xl border-t border-white/10 hover:border-white/20 pt-12 sm:pt-16 pb-8 sm:pb-10 px-4 sm:px-6 lg:px-8 overflow-hidden w-full transition-all duration-[350ms] ease-in-out md:hover:scale-[1.002] origin-bottom hover:shadow-[0_-16px_50px_rgba(16,244,142,0.12)] group/footer"
    >
      {/* Background ambient radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[560px] h-32 bg-radial from-[#10f48e]/12 to-transparent blur-3xl pointer-events-none group-hover/footer:from-[#10f48e]/22 transition-all duration-[350ms] ease-in-out" />

      {/* Top neon accent line with hover bloom */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-px bg-linear-to-r from-transparent via-[#10f48e]/60 to-transparent group-hover/footer:via-[#10f48e] group-hover/footer:shadow-[0_0_15px_#10f48e] transition-all duration-[350ms] ease-in-out" />

      {/* Subtle tech grid background pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col gap-8 sm:gap-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 sm:gap-10">
          {/* Brand Col */}
          <div className="sm:col-span-2 md:col-span-6 flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-[34px] h-[34px] rounded-xl bg-linear-to-br from-[#10f48e] to-[#059669] p-px flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,244,142,0.3)]">
                <div className="w-full h-full bg-[#07090e] rounded-[11px] flex items-center justify-center">
                  <span className="font-display font-black text-xl text-[#10f48e]">G</span>
                </div>
              </div>
              <span className="font-['Arial',sans-serif] font-black text-[30px] tracking-tight text-white leading-none">
                {AGENCY_INFO.name}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10f48e] shadow-[0_0_8px_#10f48e]" />
            </div>

            <p className="text-[17px] text-neutral-400 max-w-md leading-relaxed">
              Great brands don't happen by accident — they're built with the right partner. At Growzen, we combine creativity with strategy to deliver real results. Your growth story starts here.
            </p>

            {/* Founded By Callout */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-[#10f48e]/10 border border-white/10 hover:border-[#10f48e]/50 text-[11px] sm:text-xs font-mono-tech text-neutral-300 hover:text-white w-fit transition-all duration-[350ms] ease-in-out transform hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_0_22px_rgba(16,244,142,0.3)] cursor-default group/callout">
              <Sparkles className="w-3.5 h-3.5 text-[#10f48e] transition-transform duration-[350ms] ease-in-out group-hover/callout:rotate-12 group-hover/callout:scale-110" />
              <span>Founded by Hammad & Raza</span>
            </div>

            <div className="text-xs font-mono-tech text-neutral-500">
              Location: {AGENCY_INFO.location}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="sm:col-span-1 md:col-span-3 flex flex-col gap-2.5 sm:gap-3">
            <h4 className="text-xs font-mono-tech uppercase text-white tracking-wider font-semibold mb-1">
              Navigation
            </h4>
            <a href="#services" className="text-xs text-neutral-400 hover:text-[#10f48e] transition-colors duration-[350ms] ease-in-out w-fit py-0.5">Services</a>
            <a href="#about" className="text-xs text-neutral-400 hover:text-[#10f48e] transition-colors duration-[350ms] ease-in-out w-fit py-0.5">About Growzen</a>
            <a href="#portfolio" className="text-xs text-neutral-400 hover:text-[#10f48e] transition-colors duration-[350ms] ease-in-out w-fit py-0.5">Portfolio & Work</a>
            <a href="#reviews" className="text-xs text-neutral-400 hover:text-[#10f48e] transition-colors duration-[350ms] ease-in-out w-fit py-0.5">Client Reviews</a>
            <a href="#pricing" className="text-xs text-neutral-400 hover:text-[#10f48e] transition-colors duration-[350ms] ease-in-out w-fit py-0.5">Pricing Architecture</a>
            <a href="#booking" className="text-xs text-neutral-400 hover:text-[#10f48e] transition-colors duration-[350ms] ease-in-out w-fit py-0.5">Book Consultation</a>
          </div>

          {/* Socials & 3D Rotate Icons */}
          <div className="sm:col-span-1 md:col-span-3 flex flex-col gap-3 sm:gap-4">
            <h4 className="text-xs font-mono-tech uppercase text-white tracking-wider font-semibold">
              Connect With Us
            </h4>
            <p className="text-xs text-neutral-400">
              Follow our viral creative experiments and case studies across social platforms:
            </p>

            {/* 3D rotate-on-hover social icons */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Growzen on ${item.name}`}
                    className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-2xl glass-panel flex items-center justify-center text-neutral-300 border border-white/10 transition-all duration-[350ms] ease-in-out transform hover:-translate-y-1.5 hover:rotate-6 ${item.color}`}
                  >
                    {item.customSvg ? item.customSvg : Icon && <Icon className="w-5 h-5" />}
                  </a>
                );
              })}
            </div>

            <div className="text-xs font-mono-tech text-neutral-400 mt-2">
              WhatsApp Direct: <a href={AGENCY_INFO.whatsappUrl} className="text-[#10f48e] underline underline-offset-2 break-all">{AGENCY_INFO.phone}</a>
            </div>
          </div>
        </div>

        {/* Subtle Horizontal Divider */}
        <div className="w-full h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

        {/* Footer Bottom Row: Copyright + Legal Policy Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-tech text-neutral-400">
          <div className="text-center sm:text-left text-neutral-400">
            © {currentYear} <span className="text-white font-medium">Growzen</span> Creative & Growth Studio. All rights reserved.
          </div>

          {/* Three Legal Policy Links separated by dot divider */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-xs">
            <button
              type="button"
              id="footer-link-privacy"
              onClick={() => setActivePolicy('privacy')}
              className="text-neutral-400 hover:text-[#10f48e] transition-colors cursor-pointer py-1 px-1 min-h-[36px] flex items-center focus:outline-none focus:text-[#10f48e]"
            >
              Privacy Policy
            </button>

            <span className="text-neutral-600 select-none">•</span>

            <button
              type="button"
              id="footer-link-refund"
              onClick={() => setActivePolicy('refund')}
              className="text-neutral-400 hover:text-[#10f48e] transition-colors cursor-pointer py-1 px-1 min-h-[36px] flex items-center focus:outline-none focus:text-[#10f48e]"
            >
              Payment & Refund Policy
            </button>

            <span className="text-neutral-600 select-none">•</span>

            <button
              type="button"
              id="footer-link-terms"
              onClick={() => setActivePolicy('terms')}
              className="text-neutral-400 hover:text-[#10f48e] transition-colors cursor-pointer py-1 px-1 min-h-[36px] flex items-center focus:outline-none focus:text-[#10f48e]"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* Policy Modal Popup */}
      <AnimatePresence>
        {activePolicy && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setActivePolicy(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-xl bg-[#080c12] border border-[#10f48e]/35 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(16,244,142,0.2)] text-left font-sans max-h-[90vh] overflow-y-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="policy-modal-title"
            >
              {/* Glow Accent */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-[#10f48e]/10 to-transparent blur-2xl pointer-events-none rounded-tr-3xl" />

              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#10f48e]/15 border border-[#10f48e]/30 text-[#10f48e] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,244,142,0.25)]">
                    {React.createElement(POLICIES[activePolicy].icon, { className: 'w-5 h-5' })}
                  </div>
                  <div>
                    <h3 id="policy-modal-title" className="font-display font-bold text-xl sm:text-2xl text-white">
                      {POLICIES[activePolicy].title}
                    </h3>
                    <p className="text-xs font-mono-tech text-[#10f48e] mt-0.5">
                      {POLICIES[activePolicy].badge}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActivePolicy(null)}
                  aria-label="Close modal"
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/20 flex items-center justify-center text-neutral-400 hover:text-white transition-all cursor-pointer shrink-0 min-w-[36px] min-h-[36px]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Policy Tab Switcher */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/[0.03] rounded-xl border border-white/10 mb-5">
                {(['privacy', 'refund', 'terms'] as PolicyType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActivePolicy(type)}
                    className={`text-xs font-mono-tech py-1.5 px-3 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      activePolicy === type
                        ? 'bg-[#10f48e] text-[#05070a] font-bold shadow-[0_0_12px_rgba(16,244,142,0.4)]'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {type === 'privacy' && 'Privacy'}
                    {type === 'refund' && 'Payment & Refund'}
                    {type === 'terms' && 'Terms'}
                  </button>
                ))}
              </div>

              {/* Modal Body / Content */}
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5 sm:p-6 mb-6">
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-normal">
                  {POLICIES[activePolicy].content}
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between gap-4 pt-2">
                <span className="text-[11px] font-mono-tech text-neutral-500">
                  Growzen Studio Legal Documentation
                </span>
                <button
                  type="button"
                  onClick={() => setActivePolicy(null)}
                  className="px-5 py-2.5 rounded-full bg-[#10f48e] hover:bg-[#00e676] text-[#05070a] font-bold text-xs font-mono-tech tracking-wider uppercase shadow-[0_0_20px_rgba(16,244,142,0.3)] transition-all cursor-pointer min-h-[40px] flex items-center justify-center hover:scale-105"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.footer>
  );
};
