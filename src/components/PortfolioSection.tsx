import React, { useRef, useState } from 'react';
import { PORTFOLIO_PROJECTS } from '../data/agencyData';
import { PortfolioProject } from '../types';
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles, TrendingUp, X, Eye } from 'lucide-react';

interface ProjectCardProps {
  project: PortfolioProject;
  onSelect: (p: PortfolioProject) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect }) => {
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
      onClick={() => onSelect(project)}
      className="snap-start shrink-0 w-[82vw] min-[400px]:w-[78vw] max-w-[340px] sm:w-[380px] md:w-[420px] rounded-2xl sm:rounded-3xl glass-panel p-4 sm:p-5 border border-white/10 hover:border-[#8B5CF6]/60 transition-all duration-300 group cursor-pointer perspective-1000 relative overflow-hidden select-none"
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(${
          isHovered ? 20 : 0
        }px)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Visual Image Container with 3D Depth */}
      <div
        style={{ transform: isHovered ? 'translateZ(20px)' : 'translateZ(0px)', transition: 'transform 0.2s ease-out' }}
        className="relative w-full h-44 sm:h-56 md:h-64 rounded-xl sm:rounded-2xl overflow-hidden bg-neutral-900 mb-4 sm:mb-5 shadow-lg"
      >
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0D0D14] via-transparent to-transparent opacity-80" />

        {/* Floating Metric Badge */}
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[#0D0D14]/85 border border-[#8B5CF6]/40 backdrop-blur-md flex items-center gap-1.5 shadow-xl">
          <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8B5CF6]" />
          <span className="font-display font-bold text-[11px] sm:text-xs text-[#8B5CF6]">
            {project.impactMetric}
          </span>
        </div>

        <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 text-[10px] sm:text-[11px] font-mono-tech text-white/90 bg-black/70 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg backdrop-blur-sm border border-white/15">
          {project.category}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
          <span className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#8B5CF6] text-white text-xs font-bold font-mono-tech flex items-center gap-1.5 shadow-[0_0_20px_#8B5CF6]">
            <Eye className="w-3.5 h-3.5" />
            Inspect Case Study
          </span>
        </div>
      </div>

      {/* Content Details */}
      <div style={{ transform: isHovered ? 'translateZ(15px)' : 'translateZ(0px)', transition: 'transform 0.2s ease-out' }}>
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono-tech text-neutral-400 mb-1">
          <span>{project.client}</span>
          <span>{project.year}</span>
        </div>

        <h3 className="font-display font-bold text-lg sm:text-xl text-white group-hover:text-[#8B5CF6] transition-colors mb-1.5 sm:mb-2">
          {project.title}
        </h3>

        <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2 leading-relaxed mb-3 sm:mb-4">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-3 border-t border-white/10">
          {project.tags.map((tag, tagIdx) => (
            <span
              key={tagIdx}
              className="px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-mono-tech bg-white/5 text-neutral-300 border border-white/10 group-hover:border-[#8B5CF6]/20"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PortfolioSection: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeft(trackRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (!trackRef.current) return;
    const scrollAmount = window.innerWidth < 640 ? 300 : 420;
    trackRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="portfolio"
      className="relative py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden perspective-1200 w-full"
    >
      {/* Glow lighting */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-[#059669]/10 blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 text-[#8B5CF6] text-xs font-mono-tech uppercase tracking-widest mb-3 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Agency Showcase
          </div>
          <h2 className="font-display font-black text-2xl min-[400px]:text-3xl sm:text-5xl md:text-6xl tracking-tight text-white">
            Proof of Craft &{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#8B5CF6] via-[#A78BFA] to-[#22D3EE]">
              Commercial Growth
            </span>
          </h2>
          <p className="mt-2 sm:mt-3 text-neutral-400 text-xs sm:text-sm md:text-base max-w-xl">
            Take a look at our recent work across visual identities, digital menus, e-commerce stores, and high-conversion ad funnels.
          </p>
        </div>

        {/* Navigation Arrow Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-end">
          <button
            onClick={() => scrollByAmount('left')}
            aria-label="Previous portfolio project"
            className="w-10 h-10 sm:w-12 sm:h-12 min-w-[40px] min-h-[40px] rounded-full glass-panel flex items-center justify-center text-white hover:text-[#8B5CF6] hover:border-[#8B5CF6]/50 transition-all cursor-pointer shadow-lg transform active:scale-95 hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scrollByAmount('right')}
            aria-label="Next portfolio project"
            className="w-10 h-10 sm:w-12 sm:h-12 min-w-[40px] min-h-[40px] rounded-full glass-panel flex items-center justify-center text-white hover:text-[#8B5CF6] hover:border-[#8B5CF6]/50 transition-all cursor-pointer shadow-lg transform active:scale-95 hover:scale-105"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 3D Gallery Scroll Track */}
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeaveOrUp}
        onMouseUp={handleMouseLeaveOrUp}
        onMouseMove={handleMouseMove}
        className={`flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory py-4 sm:py-6 px-1 sm:px-2 no-scrollbar cursor-grab w-full max-w-full touch-pan-x overscroll-x-contain ${
          isDragging ? 'cursor-grabbing select-none' : ''
        }`}
      >
        {PORTFOLIO_PROJECTS.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={(p) => setSelectedProject(p)}
          />
        ))}
      </div>

      {/* Case Study Modal Dialog */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl sm:rounded-3xl glass-panel p-5 sm:p-8 border border-[#8B5CF6]/40 shadow-[0_0_60px_rgba(139,92,246,0.25)] relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProject(null)}
              aria-label="Close Case Study Details"
              className="absolute top-4 right-4 sm:top-5 sm:right-5 min-w-[44px] min-h-[44px] rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full h-48 sm:h-64 rounded-xl sm:rounded-2xl overflow-hidden mb-5 sm:mb-6 relative shadow-xl">
              <img
                src={selectedProject.image}
                alt={selectedProject.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#0D0D14] via-transparent to-transparent opacity-60" />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono-tech text-[#8B5CF6] uppercase tracking-wider mb-2">
              <span>{selectedProject.category}</span>
              <span>•</span>
              <span>{selectedProject.year}</span>
            </div>

            <h3 className="font-display font-bold text-xl sm:text-2xl md:text-3xl text-white mb-3 pr-10">
              {selectedProject.title}
            </h3>

            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 mb-4 sm:mb-5 flex items-center gap-3">
              <div className="font-display font-black text-xl sm:text-2xl text-[#8B5CF6]">
                {selectedProject.impactMetric}
              </div>
              <div className="text-xs text-neutral-300">
                {selectedProject.metricLabel}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-5 sm:mb-6 font-normal">
              {selectedProject.description}
            </p>

            <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-4 border-t border-white/10">
              {selectedProject.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono-tech bg-white/5 text-neutral-200 border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
