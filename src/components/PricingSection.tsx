import React, { useRef, useState, useEffect } from 'react';
import { PRICING_PACKAGES } from '../data/agencyData';
import { PricingPackage } from '../types';
import { Check, Clock, Sparkles, Zap, ArrowRight, Shield, BarChart3, MessageSquare } from 'lucide-react';

interface PricingSectionProps {
  onSelectPackage: (packageId: string) => void;
}

interface PricingCardProps {
  pkg: PricingPackage;
  index: number;
  inView: boolean;
  onSelect: (id: string) => void;
}

const PricingCard: React.FC<PricingCardProps> = ({ pkg, index, inView, onSelect }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const isPopular = !!pkg.popular;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotate({
      x: ((y - centerY) / centerY) * -12,
      y: ((x - centerX) / centerX) * 12,
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
      className={`rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 flex flex-col justify-between transition-all duration-300 relative cursor-pointer group glass-panel select-none perspective-1000 ${
        isHovered
          ? 'border-[#8B5CF6]/70 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(139,92,246,0.3)] bg-[#121220]/95'
          : 'border-white/10 hover:border-white/20'
      } ${isPopular ? 'border-[#8B5CF6]/50 holo-border' : ''}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView
          ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(${
              isHovered ? 20 : 0
            }px)`
          : 'translateY(50px) rotateX(-8deg)',
        transformStyle: 'preserve-3d',
        transition: 'transform 0.2s ease-out, opacity 0.6s ease-out, border 0.3s ease',
        transitionDelay: `${index * 100}ms`,
      }}
    >
      {/* Popular Glow Ribbon */}
      {isPopular && (
        <div
          style={{ transform: isHovered ? 'translateZ(35px)' : 'translateZ(10px)', transition: 'transform 0.2s ease-out' }}
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-linear-to-r from-[#8B5CF6] to-[#22D3EE] text-[#0D0D14] text-[11px] font-bold font-mono-tech uppercase tracking-wider shadow-[0_0_25px_#8B5CF6] flex items-center gap-1.5 z-30"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          Most Popular
        </div>
      )}

      {/* Card Top */}
      <div style={{ transform: isHovered ? 'translateZ(25px)' : 'translateZ(0px)', transition: 'transform 0.2s ease-out' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-2xl text-white group-hover:text-[#8B5CF6] transition-colors">
            {pkg.name}
          </h3>
          <span className="text-xs font-mono-tech text-neutral-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
            {pkg.bestFor}
          </span>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed min-h-[36px] mb-6">
          {pkg.tagline}
        </p>

        {/* Price Display */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-6 flex items-baseline gap-2 shadow-inner">
          <span className="font-display font-black text-3xl sm:text-4xl text-white group-hover:text-[#8B5CF6] transition-colors drop-shadow-[0_0_12px_rgba(139,92,246,0.4)]">
            {pkg.price}
          </span>
          <span className="text-xs font-mono-tech text-neutral-400">
            {pkg.period}
          </span>
        </div>

        {/* Delivery Time */}
        <div className="flex items-center gap-2 text-xs font-mono-tech text-[#8B5CF6] mb-6">
          <Clock className="w-4 h-4" />
          <span>{pkg.deliveryTime}</span>
        </div>

        {/* Features List */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="text-[11px] font-mono-tech uppercase text-neutral-400 tracking-wider">
            Included Architecture:
          </div>
          {pkg.features.map((feat, fIdx) => (
            <div key={fIdx} className="flex items-start gap-2.5 text-xs text-neutral-300 group-hover:text-white transition-colors">
              <div className="w-4 h-4 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_8px_rgba(139,92,246,0.3)]">
                <Check className="w-2.5 h-2.5" />
              </div>
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action */}
      <div
        style={{ transform: isHovered ? 'translateZ(30px)' : 'translateZ(0px)', transition: 'transform 0.2s ease-out' }}
        className="mt-8 pt-6 border-t border-white/10"
      >
        <button
          type="button"
          onClick={() => onSelect(pkg.id)}
          className={`w-full py-3.5 rounded-2xl text-xs font-bold uppercase font-mono-tech tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
            isPopular
              ? 'bg-linear-to-r from-[#8B5CF6] to-[#22D3EE] text-[#0D0D14] shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-105'
              : 'bg-white/10 text-white hover:bg-[#8B5CF6] hover:text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]'
          }`}
        >
          <span>{pkg.buttonText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPackage }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden perspective-1200 w-full"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/3 w-96 h-96 rounded-full bg-[#8B5CF6]/8 blur-[170px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 text-[#8B5CF6] text-xs font-mono-tech uppercase tracking-widest mb-3 shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_28px_rgba(139,92,246,0.45)] transition-all duration-[350ms] ease-in-out transform hover:scale-105 hover:-translate-y-0.5 cursor-default group/tag">
          <Sparkles className="w-3.5 h-3.5 transition-transform duration-[350ms] ease-in-out group-hover/tag:rotate-45 group-hover/tag:scale-110" />
          <span>Transparent Agency Packages</span>
        </div>
        <h2 className="font-display font-black text-2xl min-[400px]:text-3xl sm:text-5xl md:text-6xl tracking-tight text-white">
          Predictable Pricing.{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-[#8B5CF6] via-[#A78BFA] to-[#22D3EE]">
            Zero Surprises.
          </span>
        </h2>
        <p className="mt-3 sm:mt-4 text-neutral-400 text-xs sm:text-sm md:text-base max-w-xl px-2">
          From micro-task sprints starting at $28 to full-funnel 3D WebGL and Meta Ad retainers.
        </p>
      </div>

      {/* 3 Cards Grid with 3D Lift & Glow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch perspective-1000">
        {PRICING_PACKAGES.map((pkg, index) => (
          <PricingCard
            key={pkg.id}
            pkg={pkg}
            index={index}
            inView={inView}
            onSelect={onSelectPackage}
          />
        ))}
      </div>

      {/* Safety / SLA Tag */}
      <div className="mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-mono-tech text-neutral-400 px-2">
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-[#8B5CF6]/5 border border-white/10 hover:border-[#8B5CF6]/40 hover:text-neutral-200 transition-all duration-[350ms] ease-in-out transform hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(139,92,246,0.18)] cursor-default group">
          <Shield className="w-4 h-4 text-[#8B5CF6] transition-transform duration-[350ms] ease-in-out group-hover:scale-110 group-hover:rotate-6" />
          <span>No Long-Term Lock-in — Cancel or upgrade anytime</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-[#8B5CF6]/5 border border-white/10 hover:border-[#8B5CF6]/40 hover:text-neutral-200 transition-all duration-[350ms] ease-in-out transform hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(139,92,246,0.18)] cursor-default group">
          <BarChart3 className="w-4 h-4 text-[#8B5CF6] transition-transform duration-[350ms] ease-in-out group-hover:scale-110 group-hover:-translate-y-0.5" />
          <span>Transparent Milestones — Track progress every step of the way</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-[#8B5CF6]/5 border border-white/10 hover:border-[#8B5CF6]/40 hover:text-neutral-200 transition-all duration-[350ms] ease-in-out transform hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(139,92,246,0.18)] cursor-default group">
          <MessageSquare className="w-4 h-4 text-[#8B5CF6] transition-transform duration-[350ms] ease-in-out group-hover:scale-110 group-hover:rotate-3" />
          <span>Direct Communication — Reach us instantly via WhatsApp or Slack</span>
        </div>
      </div>
    </section>
  );
};
