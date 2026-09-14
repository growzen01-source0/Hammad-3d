import React, { useEffect, useRef, useState } from 'react';

export const ThreeGrowthModel: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = container.clientWidth || 300);
    let height = (canvas.height = container.clientHeight || 300);

    const updateSize = () => {
      if (!container || !canvas) return;
      const newW = container.clientWidth || 300;
      const newH = container.clientHeight || 300;
      if (width !== newW || height !== newH) {
        width = canvas.width = newW;
        height = canvas.height = newH;
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    // Interactive mouse & touch tracking
    let targetRotY = 0;
    let targetRotX = 0;
    let curRotY = 0;
    let curRotX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 1.2;
      targetRotX = -y * 0.6;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      const touch = e.touches[0];
      const rect = container.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / rect.width - 0.5;
      const y = (touch.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 1.2;
      targetRotX = -y * 0.6;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });

    // 7 ascending growth bars with responsive spacing
    const barCount = 7;
    const spacing = width < 360 ? 26 : 34;
    const barData = Array.from({ length: barCount }, (_, i) => {
      const progress = i / (barCount - 1);
      const h = 35 + Math.pow(progress, 1.6) * 130;
      const x = (i - (barCount - 1) / 2) * spacing;
      return { x, h, isApex: i === barCount - 1 };
    });

    let time = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      time += 0.02;

      // Smooth damping
      curRotY += (targetRotY - curRotY) * 0.08;
      curRotX += (targetRotX - curRotX) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 30;

      // Auto-float rotation when not hovered
      const autoRotY = Math.sin(time * 0.8) * 0.35 + curRotY;
      const autoRotX = Math.cos(time * 0.6) * 0.15 + curRotX - 0.3; // slight isometric tilt

      const cosY = Math.cos(autoRotY);
      const sinY = Math.sin(autoRotY);
      const cosX = Math.cos(autoRotX);
      const sinX = Math.sin(autoRotX);

      // Function to project 3D point (x, y, z) to 2D
      const project = (x: number, y: number, z: number) => {
        // Rotate Y
        const x1 = x * cosY - z * sinY;
        const z1 = x * sinY + z * cosY;
        // Rotate X
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const fov = 450;
        const scale = fov / (fov + z2);
        return {
          x: cx + x1 * scale,
          y: cy - y2 * scale, // invert Y for screen coords
          scale,
          depth: z2,
        };
      };

      // Draw Grid Base
      ctx.strokeStyle = 'rgba(16, 244, 142, 0.12)';
      ctx.lineWidth = 1;
      for (let g = -3; g <= 3; g++) {
        const p1 = project(g * 36, 0, -80);
        const p2 = project(g * 36, 0, 80);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const p3 = project(-110, 0, g * 26);
        const p4 = project(110, 0, g * 26);
        ctx.beginPath();
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.stroke();
      }

      // Draw Trajectory curve points
      const trajectoryPoints: { x: number; y: number; scale: number }[] = [];

      // Sort bars by depth to render back-to-front
      const sortedBars = [...barData].sort((a, b) => {
        const pA = project(a.x, 0, 0);
        const pB = project(b.x, 0, 0);
        return pA.depth - pB.depth;
      });

      // Render 3D Bars
      sortedBars.forEach((bar) => {
        const w = 18;
        const d = 18;
        const h = bar.h;

        // 8 vertices of cuboid
        const v000 = project(bar.x - w, 0, -d);
        const v100 = project(bar.x + w, 0, -d);
        const v101 = project(bar.x + w, 0, d);
        const v001 = project(bar.x - w, 0, d);

        const v010 = project(bar.x - w, h, -d);
        const v110 = project(bar.x + w, h, -d);
        const v111 = project(bar.x + w, h, d);
        const v011 = project(bar.x - w, h, d);

        // Front face (Z+)
        ctx.fillStyle = bar.isApex ? 'rgba(16, 244, 142, 0.45)' : 'rgba(10, 35, 25, 0.85)';
        ctx.strokeStyle = bar.isApex ? '#10f48e' : 'rgba(16, 244, 142, 0.3)';
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(v001.x, v001.y);
        ctx.lineTo(v101.x, v101.y);
        ctx.lineTo(v111.x, v111.y);
        ctx.lineTo(v011.x, v011.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Right face (X+)
        ctx.fillStyle = bar.isApex ? 'rgba(16, 244, 142, 0.65)' : 'rgba(6, 46, 30, 0.9)';
        ctx.beginPath();
        ctx.moveTo(v101.x, v101.y);
        ctx.lineTo(v100.x, v100.y);
        ctx.lineTo(v110.x, v110.y);
        ctx.lineTo(v111.x, v111.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Top face (Y+) - glowing neon
        ctx.fillStyle = bar.isApex ? '#10f48e' : 'rgba(16, 244, 142, 0.7)';
        ctx.beginPath();
        ctx.moveTo(v011.x, v011.y);
        ctx.lineTo(v111.x, v111.y);
        ctx.lineTo(v110.x, v110.y);
        ctx.lineTo(v010.x, v010.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Save top center for trajectory line
        const topCenter = project(bar.x, h, 0);
        trajectoryPoints.push(topCenter);
      });

      // Draw Glowing Ascending Vector Line
      ctx.sort
      const sortedTraj = barData.map((b) => project(b.x, b.h + 8, 0));
      ctx.strokeStyle = '#10f48e';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#10f48e';
      ctx.shadowBlur = 12;

      ctx.beginPath();
      sortedTraj.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow

      // Draw glowing nodes on apex of each bar
      sortedTraj.forEach((pt, i) => {
        const isLast = i === sortedTraj.length - 1;
        ctx.fillStyle = isLast ? '#ffffff' : '#10f48e';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, isLast ? 5 : 3, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    render();

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="three-growth-model-container"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full h-72 sm:h-80 md:h-96 relative flex items-center justify-center cursor-pointer group select-none"
      title="Interactive 3D Exponential Growth Vector"
    >
      <div className="absolute inset-0 bg-radial from-[#10f48e]/10 to-transparent pointer-events-none rounded-2xl blur-xl" />
      <canvas
        ref={canvasRef}
        className="w-full h-full relative z-10 block"
      />
      <div
        id="three-growth-model-badge"
        className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#0a0d12]/80 border border-[#10f48e]/20 text-[11px] font-mono-tech text-[#10f48e] backdrop-blur-md opacity-75 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap"
      >
        ✦ Real Growth, Real Results {hovered ? '(Interactive)' : ''}
      </div>
    </div>
  );
};
