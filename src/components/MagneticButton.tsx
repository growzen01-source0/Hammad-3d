import React, { useRef, useState } from 'react';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number;
  className?: string;
  glow?: boolean;
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  strength = 0.35,
  className = '',
  glow = true,
  onClick,
  ...props
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    // Magnetic pull
    setPosition({
      x: deltaX * strength,
      y: deltaY * strength,
    });

    // 3D tilt
    setTilt({
      x: -(deltaY / (rect.height / 2)) * 12,
      y: (deltaX / (rect.width / 2)) * 12,
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
    setTilt({ x: 0, y: 0 });
  };

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0) perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: position.x === 0 ? 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)' : 'transform 0.1s ease-out',
      }}
      className={`relative inline-flex items-center justify-center font-medium select-none cursor-pointer group ${
        glow ? 'hover:shadow-[0_0_28px_rgba(139,92,246,0.45)]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
