import React, { useState } from 'react';
import { Global3DBackground } from './components/Global3DBackground';
import { CustomCursor } from './components/CustomCursor';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { PortfolioSection } from './components/PortfolioSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { PricingSection } from './components/PricingSection';
import { BookingSection } from './components/BookingSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { PromoModal } from './components/PromoModal';
import { FloatingActions } from './components/FloatingActions';
import { VoiceCallingAgent } from './components/VoiceCallingAgent';

export default function App() {
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);

  const scrollToBooking = (serviceId?: string) => {
    if (serviceId) {
      setSelectedService(serviceId);
    }
    const bookingEl = document.getElementById('booking');
    if (bookingEl) {
      const navOffset = 80;
      const elementPosition = bookingEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const scrollToPortfolio = () => {
    const portfolioEl = document.getElementById('portfolio');
    if (portfolioEl) {
      const navOffset = 80;
      const elementPosition = portfolioEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#060709] text-[#e5e7eb] relative selection:bg-[#10f48e]/25 selection:text-[#10f48e]">
      {/* Continuous 3D Animated Background Across ALL Sections & Pages */}
      <Global3DBackground />

      {/* Custom Animated Cursor */}
      <CustomCursor />

      {/* Sticky Blurred Header */}
      <Navbar onOpenBooking={() => scrollToBooking()} />

      {/* Main Content Sections */}
      <main className="relative z-10 w-full max-w-full overflow-x-hidden">
        {/* 1. Hero Section (Immersive 3D Intro) */}
        <HeroSection
          onOpenBooking={() => scrollToBooking()}
          onExploreWork={scrollToPortfolio}
        />

        {/* 2. About Section (3D Perspective Flip & Rotating Growth Sculpture) */}
        <AboutSection />

        {/* 3. Services Section (Interactive 3D Cards) */}
        <ServicesSection onSelectService={(serviceId) => scrollToBooking(serviceId)} />

        {/* 4. Portfolio/Work Showcase (3D Gallery) */}
        <PortfolioSection />

        {/* 5. Testimonials Section (3D Coverflow Carousel) */}
        <TestimonialsSection />

        {/* 6. Pricing/Packages Section (3D Lift & Glow) */}
        <PricingSection onSelectPackage={(packageId) => scrollToBooking(packageId)} />

        {/* 7. Booking Consultation Section */}
        <BookingSection preselectedService={selectedService} />

        {/* 8. Contact Section */}
        <ContactSection />
      </main>

      {/* 9. Footer */}
      <Footer />

      {/* Floating WhatsApp and Back to Top Buttons */}
      <FloatingActions />

      {/* Voice-Based AI Calling Agent Widget */}
      <VoiceCallingAgent onOpenBooking={(serviceId) => scrollToBooking(serviceId)} />

      {/* Promotional Pop-up (Free 3-Day Trial) */}
      <PromoModal
        onClaimTrial={() => scrollToBooking('social-media-management')}
      />
    </div>
  );
}
