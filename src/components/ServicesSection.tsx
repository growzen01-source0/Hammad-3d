import React, { useState, useEffect, useRef } from 'react';
import { SERVICES_DATA } from '../data/agencyData';
import { ServiceCard } from './ServiceCard';
import { Sparkles, Layers, Zap } from 'lucide-react';

interface ServicesSectionProps {
  onSelectService: (serviceId: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const categories = ['All', 'Creative & Identity', 'Digital Experience', 'Organic Growth', 'Paid Acquisition', 'Engineering', 'E-Commerce', 'Brand Scaling'];

  const filteredServices = selectedCategory === 'All'
    ? SERVICES_DATA
    : SERVICES_DATA.filter((s) => s.category === selectedCategory);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-[#10f48e]/8 blur-[160px] pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col items-center text-center mb-10 sm:mb-12">
        <div
          id="services-capabilities-badge"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10f48e]/10 border border-[#10f48e]/20 text-[#10f48e] text-xs font-mono-tech uppercase tracking-widest mb-3"
        >
          <Layers className="w-3.5 h-3.5" />
          Growth-Focused Capabilities
        </div>

        <h2
          id="services-heading"
          className="font-display font-black text-2xl min-[400px]:text-3xl sm:text-5xl md:text-6xl tracking-tight text-white"
        >
          Comprehensive Services.{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-[#10f48e] to-emerald-400">
            Transparent Value.
          </span>
        </h2>

        <p
          id="services-subheading"
          className="mt-3 sm:mt-4 text-neutral-300 text-xs sm:text-sm md:text-base max-w-2xl px-2 leading-relaxed"
        >
          Every service is tailored to maximize visual impact and business ROI, scaling seamlessly with your brand's unique requirements.
        </p>

        {/* Category Pills Filter */}
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-4xl px-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-mono-tech transition-all duration-200 cursor-pointer min-h-[36px] flex items-center justify-center ${
                selectedCategory === cat
                  ? 'bg-[#10f48e] text-[#060709] font-bold shadow-[0_0_15px_rgba(16,244,142,0.4)]'
                  : 'bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 8 Services Grid with staggered 3D entrance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {filteredServices.map((service, index) => (
          <div
            key={service.id}
            className={`transition-all duration-700 ease-out`}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.95)',
              transitionDelay: `${index * 60}ms`,
            }}
          >
            <ServiceCard
              service={service}
              index={index}
              onBook={onSelectService}
            />
          </div>
        ))}
      </div>

      {/* Bottom Promo Note */}
      <div className="mt-14 p-6 rounded-3xl glass-panel border border-[#10f48e]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-2xl bg-[#10f48e]/20 text-[#10f48e] flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Need a custom multi-service bundle?</h4>
            <p id="services-custom-bundle-desc" className="text-xs text-neutral-400">
              Let's build a package tailored exactly to your brand's goals and budget.
            </p>
          </div>
        </div>
        <button
          onClick={() => onSelectService('bundle')}
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-[#10f48e] hover:text-[#060709] text-white text-xs font-bold font-mono-tech uppercase tracking-wider transition-all shrink-0 cursor-pointer"
        >
          Request Custom Bundle →
        </button>
      </div>
    </section>
  );
};
