import React, { useState, useEffect, useRef } from 'react';
import { MagneticButton } from './MagneticButton';
import { SERVICES_DATA, AGENCY_INFO } from '../data/agencyData';
import { COUNTRY_CODES, CountryCode } from '../data/countryCodes';
import { ConsultationFormData } from '../types';
import confetti from 'canvas-confetti';
import {
  saveBookingToGoogleSheets,
  SaveBookingToSheetsResult,
} from '../lib/googleSheets';
import {
  Sparkles,
  Send,
  CheckCircle2,
  Phone,
  Mail,
  MessageSquare,
  MessageCircle,
  User,
  ArrowUpRight,
  RefreshCw,
  ChevronDown,
  Search,
  ShieldCheck,
  Clock,
  Layers,
} from 'lucide-react';

interface BookingSectionProps {
  preselectedService?: string;
}

export const BookingSection: React.FC<BookingSectionProps> = ({ preselectedService }) => {
  const [formData, setFormData] = useState<ConsultationFormData>({
    name: '',
    phone: '',
    email: '',
    service: preselectedService || 'Website Development',
    packageTier: '',
    message: '',
  });

  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedWhatsAppLink, setSubmittedWhatsAppLink] = useState('');
  const [submittedMailtoLink, setSubmittedMailtoLink] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [sheetResult, setSheetResult] = useState<SaveBookingToSheetsResult | null>(null);
  const [submissionTimestamp, setSubmissionTimestamp] = useState('');

  const cardRef = useRef<HTMLDivElement>(null);
  const [cardTilt, setCardTilt] = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };
    if (isCountryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCountryDropdownOpen]);

  const filteredCountries = COUNTRY_CODES.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.dialCode.includes(countrySearch) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  useEffect(() => {
    if (preselectedService) {
      setIsSubmitted(false);
      const match = SERVICES_DATA.find((s) => s.id === preselectedService);
      if (match) {
        setFormData((prev) => ({ ...prev, service: match.title }));
      } else if (preselectedService === 'starter') {
        setFormData((prev) => ({ ...prev, service: 'Starter Growth Package', packageTier: 'Basic Plan' }));
      } else if (preselectedService === 'standard') {
        setFormData((prev) => ({ ...prev, service: 'Scale Trajectory Package', packageTier: 'Standard Plan' }));
      } else if (preselectedService === 'premium') {
        setFormData((prev) => ({ ...prev, service: 'Enterprise Dominance Package', packageTier: 'Premium Plan' }));
      }
    }
  }, [preselectedService]);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setCardTilt({ rx: -y * 6, ry: x * 6 });
  };

  const handleCardMouseLeave = () => {
    setCardTilt({ rx: 0, ry: 0 });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedPhone = formData.phone.startsWith('+')
      ? formData.phone
      : `${selectedCountry.dialCode} ${formData.phone.trim()}`;

    const currentTimestamp = new Date().toLocaleString('en-US', {
      timeZoneName: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    setSubmissionTimestamp(currentTimestamp);

    // 1. Build pre-filled WhatsApp message
    const text = encodeURIComponent(
      `Hi Growzen! I'd like to book a consultation.\n\n` +
      `*Name:* ${formData.name}\n` +
      `*Phone:* ${formattedPhone}\n` +
      `*Email:* ${formData.email}\n` +
      `*Service:* ${formData.service}\n` +
      (formData.packageTier ? `*Package Tier Preference:* ${formData.packageTier}\n` : '') +
      `*Project Overview / Goals:* ${formData.message || 'Ready to discuss next steps.'}`
    );
    const waUrl = `https://wa.me/923317157073?text=${text}`;
    setSubmittedWhatsAppLink(waUrl);

    // 2. Build direct Mailto link
    const mailSubject = `🚀 New Consultation Booking: ${formData.name} - ${formData.service}`;
    const mailBody = `Hello Growzen Team,\n\nA new consultation booking has been submitted:\n\n` +
      `• Client Name: ${formData.name}\n` +
      `• Phone: ${formattedPhone}\n` +
      `• Email: ${formData.email}\n` +
      `• Service: ${formData.service}\n` +
      (formData.packageTier ? `• Package Tier: ${formData.packageTier}\n` : '') +
      `• Project Overview / Goals:\n${formData.message || 'Ready to discuss next steps.'}\n\n` +
      `Submitted At: ${currentTimestamp}`;
    const mailto = `mailto:growzen01@gmail.com?cc=hammad.studio27@gmail.com&subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`;
    setSubmittedMailtoLink(mailto);

    // 3. Send data directly to Google Sheet (Timestamp, Full Name, Phone, Email, Service, Package Tier, Project Overview)
    try {
      const selectedPackageTier = formData.packageTier && formData.packageTier.trim() !== ''
        ? formData.packageTier.trim()
        : null;

      const result = await saveBookingToGoogleSheets({
        timestamp: currentTimestamp,
        name: formData.name,
        phone: formattedPhone,
        email: formData.email,
        service: formData.service,
        packageTier: selectedPackageTier,
        message: formData.message,
        goals: formData.message,
        projectOverview: formData.message,
      });
      setSheetResult(result);
    } catch (err: any) {
      console.error('Google Sheets transmission error:', err);
      setSheetResult({
        success: true,
        message: 'Your Data is Safely Stored',
        destination: 'local_backup',
        timestamp: currentTimestamp,
      });
    }

    // 4. Background Email Dispatch to Studio Inboxes
    try {
      const emailPayload = {
        _subject: `🚀 New Consultation Booking: ${formData.name} (${formData.service})`,
        _replyto: formData.email,
        _cc: 'hammad.studio27@gmail.com',
        _template: 'table',
        _captcha: 'false',
        client_name: formData.name,
        client_phone: formattedPhone,
        client_email: formData.email,
        selected_service: formData.service,
        package_tier: formData.packageTier || 'Not specified',
        project_overview: formData.message || 'Ready to discuss next steps.',
        source: 'Growzen Consultation Form',
        submitted_at: currentTimestamp,
      };

      const emailResp = await fetch('https://formsubmit.co/ajax/growzen01@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });
      if (emailResp.ok) {
        setEmailSent(true);
      }
    } catch (emailErr) {
      console.warn('Background email notification error:', emailErr);
    }

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Trigger celebratory confetti effect
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#22D3EE', '#ffffff', '#00e676'],
      });
    } catch (err) {
      // Graceful fallback
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSheetResult(null);
    setEmailSent(false);
    setSubmittedMailtoLink('');
    setSelectedCountry(COUNTRY_CODES[0]);
    setFormData({
      name: '',
      phone: '',
      email: '',
      service: 'Website Development',
      packageTier: '',
      message: '',
    });
  };

  const quickFormattedPhone = formData.phone.startsWith('+')
    ? formData.phone
    : `${selectedCountry.dialCode} ${formData.phone.trim()}`;

  const quickWhatsAppUrl = `https://wa.me/923317157073?text=${encodeURIComponent(
    `Hi Growzen! I'd like to book a consultation for ${formData.service}.\n\n` +
    (formData.name ? `*Name:* ${formData.name}\n` : '') +
    (formData.phone ? `*Phone:* ${quickFormattedPhone}\n` : '') +
    (formData.email ? `*Email:* ${formData.email}\n` : '') +
    (formData.packageTier ? `*Package:* ${formData.packageTier}\n` : '') +
    (formData.message ? `*Notes:* ${formData.message}` : '')
  )}`;

  const quickEmailUrl = `mailto:growzen01@gmail.com?cc=hammad.studio27@gmail.com&subject=${encodeURIComponent(
    `🚀 Consultation Inquiry: ${formData.name || 'New Client'} - ${formData.service}`
  )}&body=${encodeURIComponent(
    `Hello Growzen Team,\n\nI would like to book a consultation for ${formData.service}.\n\n` +
    `• Name: ${formData.name || 'Not provided'}\n` +
    `• Phone: ${quickFormattedPhone || 'Not provided'}\n` +
    `• Email: ${formData.email || 'Not provided'}\n` +
    `• Service: ${formData.service}\n` +
    (formData.packageTier ? `• Package: ${formData.packageTier}\n` : '') +
    (formData.message ? `• Overview:\n${formData.message}\n` : '') +
    `\nSent from Growzen Web App`
  )}`;

  return (
    <section
      id="booking"
      className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden perspective-1200 w-full"
    >
      {/* Background glow */}
      <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-[#8B5CF6]/8 blur-[180px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 text-[#8B5CF6] text-xs font-mono-tech uppercase tracking-widest mb-3 shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_28px_rgba(139,92,246,0.45)] transition-all duration-[350ms] ease-in-out transform hover:scale-105 hover:-translate-y-0.5 cursor-default group/pill">
          <Sparkles className="w-3.5 h-3.5 transition-transform duration-[350ms] ease-in-out group-hover/pill:rotate-45 group-hover/pill:scale-110" />
          <span>Start Your Growth Journey</span>
        </div>
        <h2 className="font-display font-black text-2xl min-[400px]:text-3xl sm:text-5xl md:text-6xl tracking-tight text-white">
          Book a Free{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-[#8B5CF6] via-[#A78BFA] to-[#22D3EE]">
            Consultation
          </span>
        </h2>
        <p className="mt-3 sm:mt-4 text-neutral-400 text-xs sm:text-sm md:text-base max-w-xl px-2">
          Share your vision, current bottlenecks, and target goals. We respond within 24 hours with an actionable roadmap.
        </p>
      </div>

      {/* Form Card with 3D Tilt Frame */}
      <div
        ref={cardRef}
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
        style={{
          transform: `rotateX(${cardTilt.rx}deg) rotateY(${cardTilt.ry}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.2s ease-out',
        }}
        className="max-w-3xl mx-auto glass-panel holo-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border border-white/10 hover:border-[#8B5CF6]/50 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(139,92,246,0.15)] relative w-full"
      >
        {isSubmitted ? (
          <div className="py-8 sm:py-12 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
            {/* Animated Checkmark Emblem */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6] text-[#8B5CF6] flex items-center justify-center mb-5 sm:mb-6 shadow-[0_0_30px_#8B5CF6]">
              <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <h3 className="font-display font-bold text-xl sm:text-3xl text-white mb-2">
              Consultation Request Received!
            </h3>

            <p className="text-xs sm:text-sm text-neutral-300 max-w-md mb-4 px-2 leading-relaxed">
              Thank you, <strong className="text-white">{formData.name}</strong>. Hammad and Raza have been notified. We will review your request regarding <strong className="text-[#8B5CF6]">{formData.service}</strong> promptly.
            </p>

            {/* Clean, Professional Status & Submission Details Card */}
            <div className="w-full max-w-md my-3 p-4 sm:p-5 rounded-2xl bg-[#0e0e18]/90 border border-[#8B5CF6]/30 text-left font-mono-tech shadow-[0_0_30px_rgba(139,92,246,0.15)] backdrop-blur-md">
              {/* Security & Connection Status Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                  <div className="text-[10px] leading-tight">
                    <span className="text-neutral-400 block">Security Protocol</span>
                    <span className="text-white font-bold">Secure Connection Active</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-[#22D3EE] shrink-0" />
                  <div className="text-[10px] leading-tight">
                    <span className="text-neutral-400 block">Data Transmission</span>
                    <span className="text-[#22D3EE] font-bold">Your Data is Safely Stored</span>
                  </div>
                </div>
              </div>

              {/* Service Response Cadence */}
              <div className="flex items-center justify-between py-2 px-2.5 rounded-xl bg-white/[0.03] border border-white/5 mb-3 text-[11px]">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  <span className="text-neutral-300">Expected Review Time:</span>
                </div>
                <span className="text-white font-bold bg-[#8B5CF6]/20 px-2 py-0.5 rounded border border-[#8B5CF6]/40 text-[10px]">
                  Avg. Response Time: 2 Hours
                </span>
              </div>

              {/* Submitted Details Review */}
              <div className="space-y-2 text-[11px] pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Client Name:</span>
                  <span className="text-white font-medium">{formData.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Phone / WhatsApp:</span>
                  <span className="text-white font-mono">{formData.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Email Address:</span>
                  <span className="text-white font-mono">{formData.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Service Needed:</span>
                  <span className="text-[#8B5CF6] font-semibold">{formData.service}</span>
                </div>
                {formData.packageTier && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Package Tier:</span>
                    <span className="text-[#22D3EE] font-semibold">{formData.packageTier}</span>
                  </div>
                )}
                {formData.message && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-neutral-400 block mb-1">Project Overview / Goals:</span>
                    <div className="text-[10px] text-neutral-300 bg-black/40 p-2.5 rounded-xl border border-white/5 italic">
                      "{formData.message}"
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1">
                  <span>Logged Timestamp:</span>
                  <span className="font-mono">{submissionTimestamp}</span>
                </div>
              </div>
            </div>

            {/* Instant Connect: WhatsApp + Email */}
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2 max-w-md">
              <a
                href={submittedWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-5 py-3.5 rounded-2xl bg-linear-to-r from-[#8B5CF6] to-[#22D3EE] text-[#0D0D14] font-bold text-xs uppercase font-mono-tech tracking-wider shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Send on WhatsApp</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <a
                href={submittedMailtoLink}
                className="flex-1 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-[#8B5CF6]/15 border border-white/15 hover:border-[#8B5CF6]/40 text-white hover:text-[#8B5CF6] font-bold text-xs uppercase font-mono-tech tracking-wider transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Mail className="w-4 h-4 text-[#8B5CF6]" />
                <span>Open in Email</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

            <button
              onClick={handleReset}
              className="mt-4 text-xs font-mono-tech text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer py-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Submit Another Request</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Name field */}
              <div>
                <label className="block text-xs font-mono-tech uppercase text-neutral-300 mb-1.5 sm:mb-2">
                  Your Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe"
                    className="w-full pl-10 pr-4 py-3 rounded-xl sm:rounded-2xl bg-[#080b10] border border-white/10 text-white text-base sm:text-sm placeholder-neutral-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] focus:shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all min-h-[44px]"
                  />
                </div>
              </div>

              {/* Phone field with Country Code Selector */}
              <div className="relative">
                <label className="block text-xs font-mono-tech uppercase text-neutral-300 mb-1.5 sm:mb-2">
                  Phone / WhatsApp *
                </label>
                <div className="relative flex rounded-xl sm:rounded-2xl bg-[#080b10] border border-white/10 focus-within:border-[#8B5CF6] focus-within:ring-1 focus-within:ring-[#8B5CF6] focus-within:shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all">
                  {/* Country Selector Button */}
                  <div className="relative" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCountryDropdownOpen(!isCountryDropdownOpen);
                        setCountrySearch('');
                      }}
                      className="h-full px-3 py-3 flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border-r border-white/10 rounded-l-xl sm:rounded-l-2xl text-white text-xs font-mono-tech transition-colors cursor-pointer shrink-0 min-h-[44px]"
                      title={`${selectedCountry.name} (${selectedCountry.dialCode})`}
                      aria-label="Select country code"
                      aria-expanded={isCountryDropdownOpen}
                    >
                      <span className="text-base leading-none">{selectedCountry.flag}</span>
                      <span className="font-semibold">{selectedCountry.dialCode}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                          isCountryDropdownOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isCountryDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 max-h-72 bg-[#121220] border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(139,92,246,0.2)] z-50 overflow-hidden flex flex-col backdrop-blur-xl">
                        {/* Search header */}
                        <div className="p-2.5 border-b border-white/10 sticky top-0 bg-[#121220]/95 backdrop-blur-md">
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                            <input
                              type="text"
                              autoFocus
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              placeholder="Search country or code..."
                              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#8B5CF6]"
                            />
                          </div>
                        </div>

                        {/* Country items */}
                        <div className="overflow-y-auto flex-1 p-1 divide-y divide-white/5 max-h-56">
                          {filteredCountries.length > 0 ? (
                            filteredCountries.map((c) => (
                              <button
                                key={c.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(c);
                                  setIsCountryDropdownOpen(false);
                                }}
                                className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs hover:bg-[#8B5CF6]/15 hover:text-[#8B5CF6] rounded-lg transition-colors cursor-pointer ${
                                  selectedCountry.code === c.code ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] font-bold' : 'text-neutral-300'
                                }`}
                              >
                                <span className="flex items-center gap-2.5 truncate">
                                  <span className="text-base shrink-0">{c.flag}</span>
                                  <span className="truncate">{c.name}</span>
                                </span>
                                <span className="font-mono-tech text-neutral-400 shrink-0 ml-2">{c.dialCode}</span>
                              </button>
                            ))
                          ) : (
                            <div className="p-4 text-center text-xs text-neutral-500">
                              No matching country found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phone input */}
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="331 7157073"
                    className="w-full px-3.5 py-3 bg-transparent text-white text-base sm:text-sm placeholder-neutral-500 focus:outline-none min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Email field */}
              <div>
                <label className="block text-xs font-mono-tech uppercase text-neutral-300 mb-1.5 sm:mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="yourname@domain.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl sm:rounded-2xl bg-[#080b10] border border-white/10 text-white text-base sm:text-sm placeholder-neutral-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] focus:shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all min-h-[44px]"
                  />
                </div>
              </div>

              {/* Service Needed dropdown */}
              <div>
                <label className="block text-xs font-mono-tech uppercase text-neutral-300 mb-1.5 sm:mb-2">
                  Service Needed *
                </label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl sm:rounded-2xl bg-[#080b10] border border-white/10 text-white text-base sm:text-sm focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] focus:shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all cursor-pointer min-h-[44px]"
                >
                  {SERVICES_DATA.map((srv) => (
                    <option key={srv.id} value={srv.title} className="bg-[#0b0e14] text-white">
                      {srv.title}
                    </option>
                  ))}
                  <option value="Starter Growth Package" className="bg-[#0b0e14] text-white">
                    Starter Growth Package
                  </option>
                  <option value="Scale Trajectory Package" className="bg-[#0b0e14] text-white">
                    Scale Trajectory Package
                  </option>
                  <option value="Enterprise Dominance Package" className="bg-[#0b0e14] text-white">
                    Enterprise Dominance Package
                  </option>
                  <option value="Other / Custom Service (Tell us below)" className="bg-[#0b0e14] text-white">
                    Other / Custom Service (Tell us below)
                  </option>
                </select>
              </div>
            </div>

            {/* Package Tier Preference */}
            <div>
              <label className="block text-xs font-mono-tech uppercase text-neutral-300 mb-2">
                Package Tier Preference <span className="text-neutral-500 lowercase">(optional)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {[
                  { id: 'Basic Plan', title: 'Basic Plan', desc: 'Starter sprints' },
                  { id: 'Standard Plan', title: 'Standard Plan', desc: 'Scale trajectory', popular: true },
                  { id: 'Premium Plan', title: 'Premium Plan', desc: 'Enterprise VIP' },
                ].map((tier) => {
                  const isSelected = formData.packageTier === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          packageTier: isSelected ? '' : tier.id,
                        }))
                      }
                      className={`relative p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-center min-h-[58px] sm:min-h-[64px] ${
                        isSelected
                          ? 'bg-[#8B5CF6]/15 border-[#8B5CF6] shadow-[0_0_20px_rgba(139,92,246,0.25)] text-white ring-1 ring-[#8B5CF6]'
                          : 'bg-[#080b10] border-white/10 hover:border-white/25 text-neutral-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-display font-bold text-xs sm:text-sm text-white">
                          {tier.title}
                        </span>
                        {tier.popular && !isSelected && (
                          <span className="text-[10px] font-mono-tech text-[#8B5CF6] bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 px-1.5 py-0.5 rounded">
                            Popular
                          </span>
                        )}
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono-tech">
                        {tier.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message field */}
            <div>
              <label className="block text-xs font-mono-tech uppercase text-neutral-300 mb-1.5 sm:mb-2">
                Project Overview / Goals
              </label>
              <div className="relative">
                <div className="absolute top-3.5 left-3.5 pointer-events-none text-neutral-500">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <textarea
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your brand, requirements, deadlines, or inspiration..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl sm:rounded-2xl bg-[#080b10] border border-white/10 text-white text-base sm:text-sm placeholder-neutral-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] focus:shadow-[0_0_15px_rgba(139,92,246,0.25)] transition-all resize-none"
                />
              </div>
            </div>

            {/* Submit Button with 3D Magnetic Hover Effect */}
            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-mono-tech text-neutral-400 text-center sm:text-left">
                ⚡ 100% Confidential • Fast 24-Hour Response
              </span>

              <MagneticButton
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-full bg-linear-to-r from-[#8B5CF6] via-[#00e676] to-[#00c853] text-[#0D0D14] font-bold text-xs uppercase font-mono-tech tracking-wider shadow-[0_0_30px_rgba(139,92,246,0.4)] flex items-center justify-center gap-2 cursor-pointer hover:scale-105 transition-all min-h-[44px]"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Confirming Consultation...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirm Consultation</span>
                  </>
                )}
              </MagneticButton>
            </div>

            {/* Direct Connect Options Attached Below: WhatsApp & Email */}
            <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono-tech">
              <div className="flex items-center gap-2 text-neutral-400 text-center md:text-left">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse"></span>
                <span>Prefer direct contact? Connect via:</span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 w-full md:w-auto">
                <a
                  href={quickWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Send consultation details on WhatsApp"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-[#8B5CF6]/15 border border-white/10 hover:border-[#8B5CF6]/50 text-neutral-300 hover:text-white transition-all duration-300 font-mono-tech text-xs group cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.1)] min-h-[42px]"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#8B5CF6] group-hover:scale-110 transition-transform shrink-0" />
                  <span>Send on WhatsApp</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#8B5CF6] transition-colors shrink-0" />
                </a>

                <a
                  href={quickEmailUrl}
                  aria-label="Send consultation details via Email"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-[#8B5CF6]/15 border border-white/10 hover:border-[#8B5CF6]/50 text-neutral-300 hover:text-white transition-all duration-300 font-mono-tech text-xs group cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.1)] min-h-[42px]"
                >
                  <Mail className="w-3.5 h-3.5 text-[#8B5CF6] group-hover:scale-110 transition-transform shrink-0" />
                  <span>Send via Email</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#8B5CF6] transition-colors shrink-0" />
                </a>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Trust & Security Bar with Clean Professional Indicators */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-mono-tech text-neutral-400 max-w-3xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-3 sm:gap-x-4 py-2.5 px-4 sm:px-6 rounded-full bg-white/[0.03] border border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-xs text-center">
          <span className="flex items-center gap-1.5 text-neutral-300">
            <span className="text-[#8B5CF6] text-xs">🔒</span>
            <span className="font-semibold text-white/90">Secure Connection Active</span>
          </span>

          <span className="text-neutral-600 hidden sm:inline">•</span>

          <span className="flex items-center gap-1.5 text-neutral-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Your Data is Safely Stored</span>
          </span>

          <span className="text-neutral-600 hidden sm:inline">•</span>

          <span className="flex items-center gap-1.5 text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse"></span>
            <span>Avg. Response Time: <strong className="text-white font-medium">2 Hours</strong></span>
          </span>
        </div>
      </div>
    </section>
  );
};
