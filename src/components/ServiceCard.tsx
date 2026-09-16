import React, { useRef, useState } from 'react';
import { ServiceItem } from '../types';
import {
  Palette,
  Layout,
  Search,
  Zap,
  Code,
  ShoppingBag,
  Utensils,
  Share2,
  ArrowRight,
  Sparkles,
  Check,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Palette,
  Layout,
  Search,
  Zap,
  Code,
  ShoppingBag,
  Utensils,
  Share2,
};

interface ServiceCardProps {
  service: ServiceItem;
  index: number;
  onBook: (serviceId: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, index, onBook }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = iconMap[service.icon] || Sparkles;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -14;
    const rotateY = ((x - centerX) / centerX) * 14;

    setRotate({ x: rotateX, y: rotateY });
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative perspective-1000 select-none group cursor-pointer"
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        className={`w-full rounded-2xl sm:rounded-3xl p-5 sm:p-7 transition-all duration-300 glass-panel relative flex flex-col justify-between min-h-[360px] sm:min-h-[400px] border overflow-hidden ${
          isHovered
            ? 'border-[#8B5CF6]/70 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(139,92,246,0.35)] bg-[#0d131a]/95'
            : 'border-white/10 hover:border-white/20'
        }`}
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(${
            isHovered ? 28 : 0
          }px)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Holographic Dynamic Cursor Glare */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
          style={{
            opacity: isHovered ? 0.25 : 0,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(139, 92, 246, 0.8), transparent 60%)`,
          }}
        />

        {/* Ambient Top Glow Layer */}
        <div
          className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 bg-linear-to-br ${service.gradient} ${
            isHovered ? 'opacity-100 scale-125' : 'opacity-30'
          }`}
        />

        {/* Card Header: Icon + Badge (Elevated in 3D Z-Space) */}
        <div style={{ transform: isHovered ? 'translateZ(35px)' : 'translateZ(0px)', transition: 'transform 0.2s ease-out' }}>
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div
              className={`w-11 h-11 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
                isHovered
                  ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-[0_0_25px_#8B5CF6] rotate-6 scale-110'
                  : 'bg-white/5 text-[#8B5CF6] border-white/10'
              }`}
            >
              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            {service.badge && (
              <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-mono-tech uppercase tracking-wider font-bold bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                {service.badge}
              </span>
            )}
          </div>

          {service.category ? (
            <div
              id={`service-category-${service.id}`}
              className="text-[11px] font-mono-tech uppercase text-neutral-400 mb-1"
            >
              {service.category}
            </div>
          ) : null}

          <h3 className="font-display font-bold text-lg sm:text-2xl text-white group-hover:text-[#8B5CF6] transition-colors mb-1.5 sm:mb-2">
            {service.title}
          </h3>

          <p
            id={`service-shortdesc-${service.id}`}
            className="text-xs sm:text-sm text-neutral-300 leading-relaxed line-clamp-2"
          >
            {service.shortDesc}
          </p>

          {/* Features Checklist */}
          <div
            id={`service-features-${service.id}`}
            className="mt-4 sm:mt-5 space-y-2 sm:space-y-2.5 border-t border-white/10 pt-3.5 sm:pt-4"
          >
            {service.features.map((feat, idx) => (
              <div
                key={idx}
                id={`service-feature-${service.id}-${idx}`}
                className="flex items-start gap-2 text-xs text-neutral-300 group-hover:text-white transition-colors"
              >
                <div className="w-4 h-4 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center shrink-0 mt-0.5 shadow-[0_0_8px_rgba(139,92,246,0.3)]">
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span className="leading-snug">{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card Footer: Starting Price Reveal + Action (Elevated in 3D Z-Space) */}
        <div
          style={{ transform: isHovered ? 'translateZ(40px)' : 'translateZ(0px)', transition: 'transform 0.2s ease-out' }}
          className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-white/10 flex items-center justify-between z-20"
        >
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-mono-tech uppercase tracking-wider text-neutral-300 font-semibold">
              Starting at
            </span>
            <span
              id={`service-price-${service.id}`}
              className="font-display font-bold text-base sm:text-xl text-[#8B5CF6] drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]"
            >
              {service.startingPrice.replace(/^Starting at\s*/i, '').trim()}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onBook(service.id)}
            className="min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-[#8B5CF6] hover:text-white text-white text-xs font-bold transition-all duration-300 flex items-center gap-1.5 shadow-sm group-hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] cursor-pointer transform hover:scale-105"
          >
            <span>Book Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
