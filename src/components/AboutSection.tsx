import React, { useEffect, useRef, useState } from 'react';
import { ThreeGrowthModel } from './ThreeGrowthModel';
import { MapPin, Target, Sparkles, Cpu, Award, CheckCircle2 } from 'lucide-react';
import { AGENCY_INFO } from '../data/agencyData';

export const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [rightTilt, setRightTilt] = useState({ rx: 0, ry: 0 });

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

  const handleMouseMoveRight = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setRightTilt({ rx: -y * 10, ry: x * 10 });
  };

  const handleMouseLeaveRight = () => {
    setRightTilt({ rx: 0, ry: 0 });
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden perspective-1200"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-[#8B5CF6]/8 blur-[130px] pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] text-xs font-mono-tech uppercase tracking-widest mb-3 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
          <Sparkles className="w-3.5 h-3.5" />
          About Growzen
        </div>
        <h2 className="font-display font-black text-2xl min-[400px]:text-3xl sm:text-5xl md:text-6xl tracking-tight text-white">
          Creative Artistry{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-[#8B5CF6] via-[#A78BFA] to-[#22D3EE]">
            Powered by Modern Digital Engineering
          </span>
        </h2>
        <div className="flex items-center gap-2 mt-4 text-xs sm:text-sm font-mono-tech text-neutral-400 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
          <MapPin className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>Location: {AGENCY_INFO.location}</span>
        </div>
      </div>

      {/* 2-Column Content Grid: 3D Growth Sculpture + Perspective Flip Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
        {/* Left Column: Interactive 3D Growth Sculpture with 3D Depth Frame */}
        <div
          className={`lg:col-span-5 flex flex-col items-center transition-all duration-1000 ${
            inView
              ? 'opacity-100 translate-y-0 rotate-0 scale-100'
              : 'opacity-0 translate-y-16 rotate-2 scale-95'
          }`}
        >
          <div className="w-full glass-panel holo-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 relative border border-white/10 hover:border-[#8B5CF6]/60 transition-all duration-500 shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(139,92,246,0.15)] group transform hover:-translate-y-2">
            {/* Card Header with Live Status & Metric Pill */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] animate-ping" />
                <span
                  id="about-growth-matrix-title"
                  className="text-xs font-mono-tech text-neutral-200 uppercase tracking-wider"
                >
                  Growth That Speaks For Itself
                </span>
              </div>
              <span
                id="about-growth-badge"
                className="text-[10px] font-mono-tech text-[#8B5CF6] bg-[#8B5CF6]/15 px-2.5 py-1 rounded-full border border-[#8B5CF6]/40 font-bold flex items-center gap-1.5 shrink-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
                Live Performance
              </span>
            </div>

            {/* Quick Summary Telemetry Bar */}
            <div className="grid grid-cols-3 gap-2 mb-3.5 p-2 rounded-xl bg-black/40 border border-white/5 font-mono-tech text-center">
              <div className="border-r border-white/10 pr-1">
                <div className="text-[10px] text-neutral-400">Peak ARR</div>
                <div className="text-xs sm:text-sm font-bold text-white">$850K+</div>
              </div>
              <div className="border-r border-white/10 px-1">
                <div className="text-[10px] text-neutral-400">Peak ROAS</div>
                <div className="text-xs sm:text-sm font-bold text-[#8B5CF6]">14.8x</div>
              </div>
              <div className="pl-1">
                <div className="text-[10px] text-neutral-400">Net Surge</div>
                <div className="text-xs sm:text-sm font-bold text-[#38bdf8]">+450%</div>
              </div>
            </div>

            {/* 3D Canvas / Multi-View Growth Terminal */}
            <ThreeGrowthModel />

            {/* Micro Caption */}
            <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between gap-2 text-xs font-mono-tech text-neutral-400">
              <span
                id="about-model-caption"
                className="flex items-center gap-1.5 text-neutral-300"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] shrink-0 animate-pulse" />
                Interactive Terminal — Toggle Spline, Bars & Mix
              </span>
              <span className="text-[#22D3EE] font-medium hidden sm:inline-block">60 FPS Live</span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Perspective Card Content with Cursor Tilt */}
        <div
          onMouseMove={handleMouseMoveRight}
          onMouseLeave={handleMouseLeaveRight}
          style={{
            transform: `rotateX(${rightTilt.rx}deg) rotateY(${rightTilt.ry}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.2s ease-out',
          }}
          className={`lg:col-span-7 flex flex-col gap-6 transition-all duration-1000 ${
            inView
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-16'
          }`}
        >
          {/* Main Manifesto Box with 3D Depth */}
          <div
            style={{ transform: 'translateZ(30px)' }}
            className="glass-panel p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-white/10 relative overflow-hidden group hover:border-[#8B5CF6]/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none" />

            <h3
              id="about-manifesto-heading"
              className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-white mb-3 sm:mb-4"
            >
              Great Brands Aren't Born.{' '}
              <span className="text-[#8B5CF6]">They're Built.</span>
            </h3>

            <p
              id="about-manifesto-paragraph"
              className="text-neutral-300 text-xs sm:text-sm md:text-base leading-relaxed mb-6 font-normal"
            >
              Most businesses lose customers before they even get a chance to speak — a slow website, a lifeless design, an ad that no one remembers. <strong className="text-white font-semibold">Growzen exists to fix that.</strong> We build fast, striking, conversion-focused digital experiences that make people stop, look, and act. No templates. No shortcuts. Just work that performs.
            </p>

            {/* Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-white/10">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 hover:bg-[#8B5CF6]/10 transition-colors">
                <div className="p-2.5 rounded-xl bg-[#8B5CF6]/15 text-[#8B5CF6] mt-0.5 shadow-[0_0_15px_rgba(139,92,246,0.3)] shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 id="about-pillar-heading-1" className="text-sm font-semibold text-white">
                    Great Brands Aren't Born. They're Built.
                  </h4>
                  <p id="about-pillar-desc-1" className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    From 3D visuals to ad creatives, every element we design is tested and calibrated with one goal in mind — turning attention into real conversions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 hover:bg-[#8B5CF6]/10 transition-colors">
                <div className="p-2.5 rounded-xl bg-[#8B5CF6]/15 text-[#8B5CF6] mt-0.5 shadow-[0_0_15px_rgba(139,92,246,0.3)] shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 id="about-pillar-heading-2" className="text-sm font-semibold text-white">
                    Every Detail, Data-Driven
                  </h4>
                  <p id="about-pillar-desc-2" className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                    Every 3D render, ad hook, and layout is strictly calibrated for maximum ROAS.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Agency Metrics Row with 3D Pop */}
          <div
            style={{ transform: 'translateZ(20px)' }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
          >
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 hover:border-[#8B5CF6]/50 flex flex-col transform hover:-translate-y-2 hover:rotate-1 transition-all duration-300 shadow-lg">
              <span className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-[#8B5CF6] drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                100%
              </span>
              <span className="text-[11px] sm:text-xs font-mono-tech text-neutral-400 mt-1">
                Custom Tailored Solutions
              </span>
            </div>

            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 hover:border-[#8B5CF6]/50 flex flex-col transform hover:-translate-y-2 hover:-rotate-1 transition-all duration-300 shadow-lg">
              <span className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-white">
                48h
              </span>
              <span className="text-[11px] sm:text-xs font-mono-tech text-neutral-400 mt-1">
                Rapid Sprint Turnaround
              </span>
            </div>

            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 hover:border-[#8B5CF6]/50 flex flex-col col-span-2 sm:col-span-1 transform hover:-translate-y-2 transition-all duration-300 shadow-lg">
              <span className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-[#8B5CF6] drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                3-Day
              </span>
              <span className="text-[11px] sm:text-xs font-mono-tech text-neutral-400 mt-1">
                Free Social Media Trial
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
