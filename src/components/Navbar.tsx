import React, { useState, useEffect } from 'react';
import { MagneticButton } from './MagneticButton';
import { Menu, X, ArrowUpRight, Sparkles } from 'lucide-react';
import { AGENCY_INFO } from '../data/agencyData';

interface NavbarProps {
  onOpenBooking: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenBooking }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      // Section tracker
      const sections = ['hero', 'about', 'services', 'portfolio', 'reviews', 'pricing', 'contact'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Services', href: '#services' },
    { name: 'About', href: '#about' },
    { name: 'Work', href: '#portfolio' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      const navOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'py-3 bg-[#060709]/85 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, '#hero')}
          className="flex items-center gap-2 group cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-linear-to-br from-[#10f48e] to-[#059669] p-px flex items-center justify-center shadow-[0_0_20px_rgba(16,244,142,0.35)] group-hover:shadow-[0_0_30px_rgba(16,244,142,0.6)] transition-all">
            <div className="w-full h-full bg-[#07090e] rounded-[11px] flex items-center justify-center">
              <span className="font-display font-black text-lg sm:text-xl text-transparent bg-clip-text bg-linear-to-br from-white to-[#10f48e]">
                G
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span
                className="font-sans font-black text-xl sm:text-2xl tracking-tight text-white group-hover:text-[#10f48e] transition-colors leading-none"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {AGENCY_INFO.name}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10f48e] shadow-[0_0_8px_#10f48e] animate-pulse" />
            </div>
            <span className="text-[10px] font-mono-tech text-neutral-400 tracking-wider uppercase -mt-0.5 hidden sm:block">
              Creative & Digital Growth Studio
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-[#0d1017]/70 border border-white/10 backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.replace('#', '');
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#10f48e]/15 text-[#10f48e] border border-[#10f48e]/30 shadow-[0_0_15px_rgba(16,244,142,0.2)]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* CTA & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3">
          <MagneticButton
            onClick={onOpenBooking}
            className="hidden sm:inline-flex relative overflow-hidden px-4 sm:px-5 py-2.5 rounded-full bg-linear-to-r from-[#10f48e] via-[#45ffb0] to-[#00d075] text-[#060709] text-xs font-bold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 animate-cta-glow group cursor-pointer"
          >
            {/* Ambient Energy Glow Sweep / Shimmer Glare */}
            <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/60 to-transparent w-3/4 h-full pointer-events-none animate-cta-shimmer" />

            {/* Inner Content with Twinkling Sparkle and Live Status Indicator */}
            <span className="relative z-10 flex items-center gap-1.5 font-mono-tech">
              <span className="relative flex h-2 w-2 mr-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black/60 opacity-80" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-black" />
              </span>
              <Sparkles className="w-3.5 h-3.5 text-black animate-icon-twinkle" />
              <span className="tracking-wider">Book Now</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-black transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </span>
          </MagneticButton>

          {/* Hamburger button with compliant 44px touch target */}
          <button
            id="mobile-menu-toggle"
            aria-label="Toggle Navigation Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-xl bg-white/5 border border-white/10 text-white hover:text-[#10f48e] transition-colors flex items-center justify-center cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu & Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 top-[60px] bg-black/75 backdrop-blur-sm z-40 animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="md:hidden fixed inset-x-0 top-[60px] max-h-[calc(100vh-60px)] overflow-y-auto bg-[#07090e]/98 backdrop-blur-2xl border-b border-white/10 p-5 flex flex-col gap-4 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-1.5">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="px-4 py-3 min-h-[44px] rounded-xl text-sm font-medium text-neutral-200 hover:text-[#10f48e] hover:bg-white/5 active:bg-white/10 transition-all flex items-center justify-between"
                >
                  <span>{link.name}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-50" />
                </a>
              ))}
            </nav>
            <div className="pt-3 border-t border-white/10 flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
                className="relative overflow-hidden w-full min-h-[48px] py-3.5 rounded-xl bg-linear-to-r from-[#10f48e] via-[#45ffb0] to-[#00d075] text-[#060709] text-xs font-bold uppercase font-mono-tech tracking-wider flex items-center justify-center gap-2 animate-cta-glow cursor-pointer active:scale-[0.98] transition-transform group"
              >
                <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/60 to-transparent w-3/4 h-full pointer-events-none animate-cta-shimmer" />
                <span className="relative z-10 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black/60 opacity-80" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-black" />
                  </span>
                  <Sparkles className="w-4 h-4 animate-icon-twinkle" />
                  <span>Book a Consultation</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </button>
              <p className="text-center text-[11px] font-mono-tech text-neutral-400">
                {AGENCY_INFO.location}
              </p>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
