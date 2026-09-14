import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  useEffect(() => {
    // Check touch device
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);
    if (isTouch) return;

    let targetX = -100;
    let targetY = -100;
    let currentTrailX = -100;
    let currentTrailY = -100;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      setPos({ x: targetX, y: targetY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest('button, a, input, textarea, select, [data-interactive="true"], .interactive-card');
      setIsHovered(!!interactive);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);

    let animId: number;
    const updateTrail = () => {
      currentTrailX += (targetX - currentTrailX) * 0.18;
      currentTrailY += (targetY - currentTrailY) * 0.18;
      setTrailingPos({ x: currentTrailX, y: currentTrailY });
      animId = requestAnimationFrame(updateTrail);
    };
    animId = requestAnimationFrame(updateTrail);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, [isVisible]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-9999 overflow-hidden">
      {/* Center sharp dot */}
      <div
        className="fixed w-2 h-2 rounded-full bg-[#10f48e] transition-transform duration-75 ease-out shadow-[0_0_10px_#10f48e]"
        style={{
          transform: `translate3d(${pos.x - 4}px, ${pos.y - 4}px, 0) scale(${isHovered ? 0 : 1})`,
        }}
      />
      {/* Outer glowing follower ring */}
      <div
        className={`fixed rounded-full border transition-all duration-300 ease-out flex items-center justify-center ${
          isHovered
            ? 'w-12 h-12 border-[#10f48e] bg-[#10f48e]/15 backdrop-blur-[2px] shadow-[0_0_24px_rgba(16,244,142,0.4)] scale-110'
            : 'w-8 h-8 border-[#10f48e]/50 bg-transparent scale-100'
        }`}
        style={{
          transform: `translate3d(${trailingPos.x - (isHovered ? 24 : 16)}px, ${
            trailingPos.y - (isHovered ? 24 : 16)
          }px, 0)`,
        }}
      >
        {isHovered && (
          <div className="w-1.5 h-1.5 rounded-full bg-[#10f48e] animate-ping" />
        )}
      </div>
    </div>
  );
};
