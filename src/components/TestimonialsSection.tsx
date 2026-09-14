import React, { useState, useEffect, useRef } from 'react';
import { TESTIMONIALS_DATA } from '../data/agencyData';
import { Star, ChevronLeft, ChevronRight, Quote, Sparkles, TrendingUp } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [starsAnimated, setStarsAnimated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarsAnimated(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const total = TESTIMONIALS_DATA.length;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      setTouchStart(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null || !e.changedTouches[0]) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    setTouchStart(null);
  };

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden w-full"
    >
      {/* Glow */}
      <div className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full bg-[#10f48e]/8 blur-[160px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col items-center text-center mb-10 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10f48e]/10 border border-[#10f48e]/20 text-[#10f48e] text-xs font-mono-tech uppercase tracking-widest mb-3">
          ✦ TRUSTED BY REAL BRANDS
        </div>
        <h2 className="font-display font-black text-2xl min-[400px]:text-3xl sm:text-5xl md:text-6xl tracking-tight text-white">
          Client Feedback &{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-[#10f48e] to-emerald-400">
            Trust
          </span>
        </h2>
        <p className="mt-3 sm:mt-4 text-neutral-400 text-xs sm:text-sm md:text-base max-w-xl px-2">
          Real results, real voices — see why brands trust Growzen to bring their vision to life.
        </p>
      </div>

      {/* 3D Curved Carousel Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full max-w-4xl mx-auto min-h-[380px] sm:h-[420px] flex items-center justify-center perspective-1200 overflow-hidden sm:overflow-visible py-4"
      >
        {TESTIMONIALS_DATA.map((item, idx) => {
          // Calculate offset relative to activeIndex
          let offset = idx - activeIndex;
          if (offset < -Math.floor(total / 2)) offset += total;
          if (offset > Math.floor(total / 2)) offset -= total;

          const isActive = offset === 0;
          const isLeft = offset === -1;
          const isRight = offset === 1;

          let transformStyle = '';
          let opacity = 0;
          let zIndex = 1;

          if (isMobile) {
            if (isActive) {
              transformStyle = 'translateX(0%) scale(1)';
              opacity = 1;
              zIndex = 20;
            } else {
              transformStyle = `translateX(${offset > 0 ? 100 : -100}%) scale(0.9)`;
              opacity = 0;
              zIndex = 0;
            }
          } else {
            if (isActive) {
              transformStyle = 'translateX(0%) scale(1) rotateY(0deg)';
              opacity = 1;
              zIndex = 20;
            } else if (isLeft) {
              transformStyle = 'translateX(-50%) scale(0.85) rotateY(25deg)';
              opacity = 0.55;
              zIndex = 10;
            } else if (isRight) {
              transformStyle = 'translateX(50%) scale(0.85) rotateY(-25deg)';
              opacity = 0.55;
              zIndex = 10;
            } else {
              transformStyle = `translateX(${offset * 65}%) scale(0.7) rotateY(${offset > 0 ? -40 : 40}deg)`;
              opacity = 0;
              zIndex = 0;
            }
          }

          return (
            <div
              key={item.id}
              onClick={() => {
                if (!isActive) setActiveIndex(idx);
              }}
              style={{
                transform: transformStyle,
                opacity,
                zIndex,
                pointerEvents: isActive ? 'auto' : isMobile ? 'none' : 'auto',
                transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
              className={`absolute w-[92vw] min-[400px]:w-[88vw] max-w-[350px] sm:w-[460px] md:w-[540px] rounded-2xl sm:rounded-3xl p-5 sm:p-8 glass-panel border transition-all duration-500 cursor-pointer ${
                isActive
                  ? 'border-[#10f48e]/60 shadow-[0_0_40px_rgba(16,244,142,0.25)]'
                  : 'border-white/10 hover:border-white/25'
              }`}
            >
              {/* Quote Mark & Growth Metric */}
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#10f48e]/15 text-[#10f48e] flex items-center justify-center">
                  <Quote className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0d1612] border border-[#10f48e]/30 text-[11px] sm:text-xs font-mono-tech text-[#10f48e]">
                  <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{item.growthMetric}</span>
                </div>
              </div>

              {/* Star Rating with Animated Fill */}
              <div className="flex items-center gap-1 mb-3 sm:mb-4">
                {[...Array(5)].map((_, starIdx) => (
                  <Star
                    key={starIdx}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-500 ${
                      starsAnimated && starIdx < item.rating
                        ? 'fill-[#10f48e] text-[#10f48e] scale-100'
                        : 'text-neutral-600 scale-75'
                    }`}
                    style={{ transitionDelay: `${starIdx * 100}ms` }}
                  />
                ))}
                <span className="text-[11px] sm:text-xs font-mono-tech text-neutral-400 ml-2">
                  {item.ratingScore || '5.0'} Verified Review
                </span>
              </div>

              {/* Review Content */}
              <p className="text-neutral-200 text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6 font-normal italic">
                "{item.content}"
              </p>

              {/* Client Info */}
              <div className="flex items-center gap-3 pt-3.5 sm:pt-4 border-t border-white/10">
                <img
                  src={item.avatar}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-[#10f48e]/40 shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <h4 className="font-display font-bold text-xs sm:text-sm text-white truncate">
                    {item.name}
                  </h4>
                  <span className="text-[11px] sm:text-xs text-neutral-400 truncate">
                    {item.role}, {item.company}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Carousel Controls */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
        <button
          onClick={handlePrev}
          aria-label="Previous testimonial"
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full glass-panel flex items-center justify-center text-white hover:text-[#10f48e] hover:border-[#10f48e]/40 transition-all cursor-pointer shadow-md active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Indicators */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {TESTIMONIALS_DATA.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setActiveIndex(dotIdx)}
              aria-label={`Go to slide ${dotIdx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === dotIdx
                  ? 'w-6 sm:w-8 bg-[#10f48e] shadow-[0_0_10px_#10f48e]'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          aria-label="Next testimonial"
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full glass-panel flex items-center justify-center text-white hover:text-[#10f48e] hover:border-[#10f48e]/40 transition-all cursor-pointer shadow-md active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
