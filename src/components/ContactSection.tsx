import React, { useRef, useState } from 'react';
import { AGENCY_INFO } from '../data/agencyData';
import { Phone, Mail, MapPin, Copy, Check, ExternalLink, MessageCircle, Sparkles } from 'lucide-react';

interface ContactCardProps {
  icon: React.ElementType;
  badge: string;
  category: string;
  value: string;
  description: string;
  actionButton: React.ReactNode;
  copyValue: string;
  copyField: string;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  iconRotateDir?: 'left' | 'right';
}

const ContactCard: React.FC<ContactCardProps> = ({
  icon: Icon,
  badge,
  category,
  value,
  description,
  actionButton,
  copyValue,
  copyField,
  copiedField,
  onCopy,
  iconRotateDir = 'right',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotate({
      x: ((y - centerY) / centerY) * -10,
      y: ((x - centerX) / centerX) * 10,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setRotate({ x: 0, y: 0 });
      }}
      className="glass-panel p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/10 hover:border-[#10f48e]/60 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden shadow-xl perspective-1000 select-none w-full"
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(${
          isHovered ? 20 : 0
        }px)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.2s ease-out, border-color 0.3s ease',
      }}
    >
      <div
        style={{ transform: isHovered ? 'translateZ(25px)' : 'translateZ(0px)', transition: 'transform 0.2s ease-out' }}
        className="flex items-start justify-between mb-5 sm:mb-6"
      >
        <div
          className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-[#10f48e]/10 text-[#10f48e] flex items-center justify-center transition-transform duration-300 shadow-[0_0_15px_rgba(16,244,142,0.2)] ${
            iconRotateDir === 'right' ? 'group-hover:rotate-12' : 'group-hover:-rotate-12'
          } group-hover:scale-110`}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <span className="px-3 py-1 rounded-full text-[10px] font-mono-tech uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          {badge}
        </span>
      </div>

      <div style={{ transform: isHovered ? 'translateZ(20px)' : 'translateZ(0px)', transition: 'transform 0.2s ease-out' }}>
        <span className="text-[11px] font-mono-tech uppercase text-neutral-400">
          {category}
        </span>
        <h3 className="font-display font-bold text-lg sm:text-xl text-white mt-1 mb-2 group-hover:text-[#10f48e] transition-colors truncate">
          {value}
        </h3>
        <p className="text-xs text-neutral-400 leading-relaxed mb-5 sm:mb-6">
          {description}
        </p>
      </div>

      <div
        style={{ transform: isHovered ? 'translateZ(25px)' : 'translateZ(0px)', transition: 'transform 0.2s ease-out' }}
        className="flex items-center gap-2 pt-4 border-t border-white/10 z-10"
      >
        {actionButton}
        <button
          onClick={() => onCopy(copyValue, copyField)}
          aria-label={`Copy ${category}`}
          className="p-2.5 min-w-[44px] min-h-[44px] rounded-xl bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white transition-all cursor-pointer shadow-sm flex items-center justify-center"
        >
          {copiedField === copyField ? (
            <Check className="w-4 h-4 text-[#10f48e]" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export const ContactSection: React.FC = () => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <section
      id="contact"
      className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden perspective-1200 w-full"
    >
      {/* Ambient glow */}
      <div className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-[#10f48e]/8 blur-[160px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10f48e]/10 border border-[#10f48e]/30 text-[#10f48e] text-xs font-mono-tech uppercase tracking-widest mb-3 shadow-[0_0_20px_rgba(16,244,142,0.2)]">
          <Sparkles className="w-3.5 h-3.5" />
          Direct Dispatch
        </div>
        <h2 className="font-display font-black text-2xl min-[400px]:text-3xl sm:text-5xl md:text-6xl tracking-tight text-white">
          Let's Start the{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-[#10f48e] to-emerald-400">
            Conversation
          </span>
        </h2>
        <p className="mt-3 sm:mt-4 text-neutral-400 text-xs sm:text-sm md:text-base max-w-xl px-2">
          We're ready to elevate your brand presence. Reach out via WhatsApp, phone, or email — we typically respond within a few hours.
        </p>
      </div>

      {/* 3 Contact Cards Grid with 3D Tilt */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
        {/* Phone / WhatsApp Card */}
        <ContactCard
          icon={Phone}
          badge="Instant"
          category="Phone / WhatsApp"
          value={AGENCY_INFO.phone}
          description="Available 7 days a week for immediate project onboarding and consultation."
          copyValue={AGENCY_INFO.phone}
          copyField="phone"
          copiedField={copiedField}
          onCopy={copyToClipboard}
          iconRotateDir="right"
          actionButton={
            <a
              href={AGENCY_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-xl bg-[#10f48e]/15 hover:bg-[#10f48e] text-[#10f48e] hover:text-[#060709] text-xs font-bold font-mono-tech uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm group-hover:shadow-[0_0_15px_rgba(16,244,142,0.3)]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          }
        />

        {/* Email Address Card */}
        <ContactCard
          icon={Mail}
          badge="Inquiries"
          category="Official Email"
          value={AGENCY_INFO.email}
          description="Send RFP documents, brand guidelines, or collaboration proposals."
          copyValue={AGENCY_INFO.email}
          copyField="email"
          copiedField={copiedField}
          onCopy={copyToClipboard}
          iconRotateDir="left"
          actionButton={
            <a
              href={`mailto:${AGENCY_INFO.email}`}
              className="flex-1 py-2.5 rounded-xl bg-[#10f48e]/15 hover:bg-[#10f48e] text-[#10f48e] hover:text-[#060709] text-xs font-bold font-mono-tech uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm group-hover:shadow-[0_0_15px_rgba(16,244,142,0.3)]"
            >
              <Mail className="w-4 h-4" />
              <span>Send Mail</span>
            </a>
          }
        />

        {/* Location Card */}
        <ContactCard
          icon={MapPin}
          badge="HQ Campus"
          category="Studio Location"
          value={AGENCY_INFO.location}
          description="Located in the commercial heart of the district, driving innovation for regional and global brands."
          copyValue={AGENCY_INFO.location}
          copyField="location"
          copiedField={copiedField}
          onCopy={copyToClipboard}
          iconRotateDir="right"
          actionButton={
            <div className="flex-1 py-2.5 rounded-xl bg-white/5 text-neutral-300 text-xs font-mono-tech text-center">
              Active Studio Hub
            </div>
          }
        />
      </div>
    </section>
  );
};
