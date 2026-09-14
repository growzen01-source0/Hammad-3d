import React, { useState, useEffect, useRef } from 'react';
import { MagneticButton } from './MagneticButton';
import { ArrowDown, Sparkles, Flame, ShieldCheck, ChevronRight, Layers, Zap, Gamepad2, TrendingUp } from 'lucide-react';
import { AGENCY_INFO } from '../data/agencyData';

interface HeroSectionProps {
  onOpenBooking: () => void;
  onExploreWork: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenBooking, onExploreWork }) => {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const heroCardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const taglines = [
    'We Build Digital Solutions That Convert',
    'From Scroll-Stopping Designs to High-Converting Stores',
    'Turning Ideas Into Digital Growth',
    'Websites, Stores & Designs Built to Perform',
    'Your Vision. Our Design. Real Results',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [taglines.length]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    if (!heroCardRef.current) return;
    const rect = heroCardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: -y * 14, // tilt X up to 14 deg
      ry: x * 16,  // tilt Y up to 16 deg
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  const brandLetters = 'GROWZEN'.split('');

  return (
    <section
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden pt-24 pb-16 px-4 sm:px-6 lg:px-8 perspective-1200"
    >
      {/* Futuristic Mesh Gradient Lighting Layers */}
      <div
        className="absolute top-1/4 -left-48 w-96 h-96 rounded-full bg-[#10f48e]/12 blur-[140px] pointer-events-none animate-pulse"
        style={{ animationDuration: '8s' }}
      />
      <div
        className="absolute bottom-1/4 -right-48 w-96 h-96 rounded-full bg-[#059669]/15 blur-[160px] pointer-events-none"
      />
      <div className="absolute inset-0 bg-grid-pattern opacity-25 pointer-events-none" />

      {/* Enhanced 3D Next-Gen Design Graphic Card */}
      <div className="absolute top-32 right-8 sm:right-20 2xl:right-28 3xl:right-48 4k:right-72 hidden lg:flex items-center gap-3.5 p-3.5 pr-5 rounded-2xl bg-[#090d12]/90 backdrop-blur-xl border border-[#10f48e]/40 shadow-[0_0_35px_rgba(16,244,142,0.25)] animate-float-3d pointer-events-none z-10 group overflow-hidden">
        {/* Glow ambient background gradient */}
        <div className="absolute -inset-1 bg-linear-to-l from-[#10f48e]/15 via-emerald-500/10 to-transparent blur-md pointer-events-none" />

        {/* Icon with glowing pulse & aura */}
        <div className="relative w-11 h-11 rounded-xl bg-linear-to-br from-[#10f48e] to-emerald-700 p-px flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,244,142,0.35)]">
          <div className="w-full h-full bg-[#070b0e] rounded-[11px] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-radial from-[#10f48e]/25 to-transparent animate-pulse" />
            <Gamepad2 className="w-5 h-5 text-[#10f48e] drop-shadow-[0_0_8px_rgba(16,244,142,0.9)]" />
          </div>
        </div>

        {/* Text & 60 FPS Performance EQ Bars */}
        <div className="relative text-left flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10f48e] animate-ping" />
            <span className="text-[10px] font-mono-tech uppercase tracking-wider text-neutral-300 font-semibold">
              Next-Gen Design
            </span>
            <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded-full bg-[#10f48e]/15 border border-[#10f48e]/30 text-[#10f48e] font-mono-tech font-bold">
              60 FPS
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-sm sm:text-base font-bold font-display text-white tracking-tight">
              Built for{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#10f48e] to-emerald-300">
                Performance
              </span>
            </span>
          </div>

          {/* Performance Equalizer Bars & Micro Stat */}
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex items-end gap-1 h-3.5">
              <span className="w-1 h-2 bg-[#10f48e]/60 rounded-full animate-pulse" />
              <span className="w-1 h-3.5 bg-[#10f48e] rounded-full animate-pulse [animation-delay:150ms]" />
              <span className="w-1 h-2.5 bg-[#10f48e]/80 rounded-full animate-pulse [animation-delay:300ms]" />
              <span className="w-1 h-3.5 bg-[#10f48e] rounded-full animate-pulse [animation-delay:450ms]" />
              <span className="w-1 h-1.5 bg-[#10f48e]/50 rounded-full animate-pulse [animation-delay:200ms]" />
            </div>
            <span className="text-[9px] font-mono-tech text-neutral-400">
              WebGL · Ultra Low Latency
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced 3D ROI Impact Graphic Card */}
      <div className="absolute bottom-32 left-6 sm:left-16 2xl:left-24 3xl:left-40 4k:left-64 hidden lg:flex items-center gap-3.5 p-3.5 pr-5 rounded-2xl bg-[#090d12]/90 backdrop-blur-xl border border-[#10f48e]/40 shadow-[0_0_35px_rgba(16,244,142,0.25)] animate-float-slow pointer-events-none z-10 group overflow-hidden">
        {/* Glow ambient background gradient */}
        <div className="absolute -inset-1 bg-linear-to-r from-[#10f48e]/15 via-emerald-500/10 to-transparent blur-md pointer-events-none" />

        {/* Icon with glowing pulse & aura */}
        <div className="relative w-11 h-11 rounded-xl bg-linear-to-br from-[#10f48e] to-emerald-700 p-px flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,244,142,0.35)]">
          <div className="w-full h-full bg-[#070b0e] rounded-[11px] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-radial from-[#10f48e]/25 to-transparent animate-pulse" />
            <Zap className="w-5 h-5 text-[#10f48e] fill-[#10f48e]/30 drop-shadow-[0_0_8px_rgba(16,244,142,0.9)]" />
          </div>
        </div>

        {/* Text & Dynamic Graph Sparkline */}
        <div className="relative text-left flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10f48e] animate-ping" />
            <span className="text-[10px] font-mono-tech uppercase tracking-wider text-neutral-300 font-semibold">
              ROI Impact
            </span>
            <span className="ml-1 text-[9px] px-1.5 py-0.2 rounded-full bg-[#10f48e]/15 border border-[#10f48e]/30 text-[#10f48e] font-mono-tech font-bold">
              VERIFIED
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-sm sm:text-base font-black font-display text-transparent bg-clip-text bg-linear-to-r from-white via-[#10f48e] to-emerald-300 tracking-tight">
              +380%
            </span>
            <span className="text-xs font-semibold text-neutral-300">
              Client Growth
            </span>
          </div>

          {/* Mini SVG Growth Sparkline Curve */}
          <div className="flex items-center gap-2 mt-0.5">
            <svg className="w-20 h-3.5 text-[#10f48e] overflow-visible" viewBox="0 0 80 14" fill="none">
              <path
                d="M 2 12 Q 20 11, 32 8 T 56 6 T 74 2 L 78 2"
                stroke="#10f48e"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="78" cy="2" r="2.5" fill="#10f48e" className="animate-ping origin-center" />
              <circle cx="78" cy="2" r="2" fill="#10f48e" />
            </svg>
            <span className="text-[9px] font-mono-tech text-[#10f48e] font-bold flex items-center">
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +4.2x
            </span>
          </div>
        </div>
      </div>

      {/* Content Container with 3D Dynamic Tilt */}
      <div
        ref={heroCardRef}
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.15s ease-out',
        }}
        className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center mt-2 sm:mt-6 will-change-transform px-4 sm:px-6 box-border"
      >
        {/* Award/Status Top Pill in 3D Space */}
        <div
          style={{ transform: 'translateZ(35px)' }}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/5 border border-[#10f48e]/30 backdrop-blur-xl mb-4 sm:mb-6 shadow-[0_0_20px_rgba(16,244,142,0.2)] max-w-[95%]"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#10f48e] animate-ping shrink-0" />
          <span className="text-[10px] sm:text-xs font-mono-tech tracking-wider uppercase text-neutral-300 truncate">
            Creative & Digital Growth Studio
          </span>
        </div>

        {/* Kinetic Hero Title with 3D Letter Rotation */}
        <div
          id="hero-brand-container"
          className="w-full max-w-full overflow-visible px-4 sm:px-8 py-2 sm:py-3 flex justify-center items-center box-border transform-none sm:[transform:translateZ(40px)]"
        >
          <h1
            id="hero-brand-title"
            className="font-black text-[clamp(2.2rem,10vw,107px)] sm:text-[clamp(4rem,8.5vw,107px)] lg:text-[107px] tracking-tight sm:tracking-normal text-white uppercase flex items-center justify-center select-none leading-none max-w-full text-center whitespace-nowrap overflow-visible"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {brandLetters.map((char, index) => (
              <span
                key={index}
                className="inline-block transform sm:hover:scale-115 sm:hover:text-[#10f48e] transition-all duration-300 sm:hover:rotate-3 cursor-default sm:hover:drop-shadow-[0_0_30px_rgba(16,244,142,0.8)] px-[0.015em]"
                style={{
                  fontFamily: 'Georgia, serif',
                  textShadow: '0 10px 30px rgba(0,0,0,0.85), 0 0 20px rgba(16,244,142,0.2)',
                }}
              >
                {char}
              </span>
            ))}
          </h1>
        </div>

        {/* Animated Subtitle / Dynamic Tagline */}
        <div
          style={{ transform: 'translateZ(30px)' }}
          className="mt-3 sm:mt-4 flex flex-col items-center w-full"
        >
          <p className="text-xs min-[380px]:text-sm sm:text-lg md:text-xl font-mono-tech text-neutral-400 max-w-2xl px-2 sm:px-4 min-h-[38px] flex items-center justify-center gap-1.5 sm:gap-2 text-center">
            <span className="text-[#10f48e] shrink-0">/&gt;</span>
            <span
              key={taglineIndex}
              className="inline-block transition-all duration-500 animate-in fade-in slide-in-from-bottom-2 text-neutral-200"
            >
              {taglines[taglineIndex]}
            </span>
          </p>

          <p className="text-xs sm:text-sm md:text-base text-neutral-300 max-w-2xl mt-2.5 sm:mt-3 px-3 sm:px-4 font-normal leading-relaxed text-center">
            From high-converting <strong className="font-semibold text-white">Shopify Stores</strong> and modern <strong className="font-semibold text-white">Website Development</strong> to scroll-stopping <strong className="font-semibold text-white">Graphic Design</strong>, <strong className="font-semibold text-white">Meta Ads</strong>, and <strong className="font-semibold text-white">UI/UX</strong> — we build digital solutions tailored for startups, restaurants, and ambitious creators.
          </p>
        </div>

        {/* Hero CTAs */}
        <div
          style={{ transform: 'translateZ(45px)' }}
          className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 max-w-md sm:max-w-none"
        >
          <MagneticButton
            id="hero-book-btn"
            onClick={onOpenBooking}
            className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 sm:py-4 rounded-full bg-linear-to-r from-[#10f48e] via-[#00e676] to-[#00c853] text-[#060709] font-bold text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_35px_rgba(16,244,142,0.45)] hover:shadow-[0_0_55px_rgba(16,244,142,0.7)] transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
          >
            <Sparkles className="w-4 h-4" />
            <span>Book Consultation</span>
            <ChevronRight className="w-4 h-4" />
          </MagneticButton>

          <MagneticButton
            onClick={() => {
              const servicesEl = document.getElementById('services');
              if (servicesEl) {
                const navOffset = 80;
                const elementPosition = servicesEl.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navOffset;
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
                });
              } else {
                onExploreWork();
              }
            }}
            glow={false}
            className="w-full sm:w-auto min-h-[48px] px-7 py-3.5 sm:py-4 rounded-full bg-[#0d1017]/80 hover:bg-[#151b26] border border-white/15 text-white font-medium text-xs sm:text-sm tracking-wider hover:border-[#10f48e]/50 transition-all backdrop-blur-lg flex items-center justify-center gap-2 transform hover:-translate-y-1"
          >
            <span>Explore Services</span>
            <span className="text-[#10f48e]">↓</span>
          </MagneticButton>
        </div>

        {/* Micro Credibility Bar with 3D Cubes */}
        <div
          style={{ transform: 'translateZ(25px)' }}
          className="mt-8 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-6 w-full max-w-3xl px-2 sm:px-4"
        >
          {AGENCY_INFO.stats.map((stat, idx) => (
            <div
              key={idx}
              className="p-3 sm:p-4 rounded-2xl bg-[#0b0e14]/70 border border-white/5 backdrop-blur-md flex flex-col items-center justify-center group hover:border-[#10f48e]/50 hover:shadow-[0_0_30px_rgba(16,244,142,0.2)] transition-all duration-300 transform hover:-translate-y-1.5 hover:rotate-1"
            >
              <div className="font-display font-bold text-lg min-[380px]:text-xl sm:text-2xl text-transparent bg-clip-text bg-linear-to-r from-white to-[#10f48e] group-hover:scale-110 transition-transform">
                {stat.value}
                <span className="text-[#10f48e] text-xs sm:text-sm">{stat.suffix}</span>
              </div>
              <span className="text-[10px] sm:text-xs text-neutral-400 font-mono-tech text-center mt-1 leading-tight">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle Scroll Down Indicator with 3D Float */}
      <a
        href="#about"
        aria-label="Scroll to About section"
        className="mt-10 sm:mt-12 relative z-10 flex flex-col items-center gap-2 group cursor-pointer text-neutral-400 hover:text-[#10f48e] transition-colors"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 group-hover:border-[#10f48e] p-1 flex justify-center transition-colors shadow-[0_0_15px_rgba(16,244,142,0.2)]">
          <div className="w-1.5 h-2.5 rounded-full bg-[#10f48e] animate-bounce" />
        </div>
        <span className="text-[10px] font-mono-tech uppercase tracking-widest opacity-60 group-hover:opacity-100">
          Scroll To Discover
        </span>
      </a>
    </section>
  );
};
