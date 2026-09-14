import React, { useEffect, useRef } from 'react';

export const Global3DCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Mouse and scroll tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let curMouseX = 0;
    let curMouseY = 0;
    let scrollY = window.scrollY;

    const onMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / width) * 2 - 1;
      targetMouseY = (e.clientY / height) * 2 - 1;
    };

    const onScroll = () => {
      scrollY = window.scrollY;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // 3D Geometric floating objects
    const objects = Array.from({ length: 14 }, (_, i) => {
      const isRing = i % 3 === 0;
      const isOcta = i % 3 === 1;
      return {
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 1200,
        z: Math.random() * 800 + 200,
        rx: Math.random() * Math.PI,
        ry: Math.random() * Math.PI,
        rz: Math.random() * Math.PI,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vrx: (Math.random() - 0.5) * 0.015,
        vry: (Math.random() - 0.5) * 0.015,
        size: 20 + Math.random() * 35,
        type: isRing ? 'ring' : isOcta ? 'octa' : 'tetra',
        color: i % 2 === 0 ? 'rgba(16, 244, 142, 0.45)' : 'rgba(52, 211, 153, 0.3)',
      };
    });

    // 3D Starfield Particles
    const particleCount = 70;
    const particles = Array.from({ length: particleCount }, () => ({
      x: (Math.random() - 0.5) * 2000,
      y: (Math.random() - 0.5) * 2000,
      z: Math.random() * 1200 + 50,
      radius: 1 + Math.random() * 1.5,
      alpha: 0.15 + Math.random() * 0.5,
    }));

    let time = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      time += 0.015;

      curMouseX += (targetMouseX - curMouseX) * 0.03;
      curMouseY += (targetMouseY - curMouseY) * 0.03;

      ctx.clearRect(0, 0, width, height);

      const fov = 650;
      const cx = width / 2 + curMouseX * 40;
      const cy = height / 2 + curMouseY * 40;

      // Render 3D floating particles
      particles.forEach((p) => {
        // Scroll parallax
        const effectiveY = p.y - (scrollY * 0.15) % 1500;
        const scale = fov / (fov + p.z);
        const px = cx + p.x * scale;
        const py = cy + effectiveY * scale;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          ctx.globalAlpha = p.alpha * Math.min(scale * 1.2, 1);
          ctx.fillStyle = '#10f48e';
          ctx.beginPath();
          ctx.arc(px, py, p.radius * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Render 3D geometric wireframes
      objects.forEach((obj) => {
        obj.rx += obj.vrx;
        obj.ry += obj.vry;
        obj.x += obj.vx;
        obj.y += obj.vy;

        if (obj.x > 900) obj.x = -900;
        if (obj.x < -900) obj.x = 900;
        if (obj.y > 700) obj.y = -700;
        if (obj.y < -700) obj.y = 700;

        const effectiveY = obj.y - (scrollY * 0.2) % 1400;
        const scale = fov / (fov + obj.z);
        const px = cx + obj.x * scale;
        const py = cy + effectiveY * scale;

        if (px < -100 || px > width + 100 || py < -100 || py > height + 100) return;

        ctx.save();
        ctx.translate(px, py);
        ctx.scale(scale, scale);
        ctx.rotate(obj.rx);

        ctx.strokeStyle = obj.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = Math.min(scale * 0.85, 0.6);

        if (obj.type === 'ring') {
          ctx.beginPath();
          ctx.ellipse(0, 0, obj.size, obj.size * 0.45, obj.ry, 0, Math.PI * 2);
          ctx.stroke();
        } else if (obj.type === 'octa') {
          // 3D diamond projection
          const s = obj.size;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.8, 0);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.8, 0);
          ctx.closePath();
          ctx.stroke();

          // Internal cross axis
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(0, s);
          ctx.moveTo(-s * 0.8, 0);
          ctx.lineTo(s * 0.8, 0);
          ctx.stroke();
        } else {
          // Prism tetrahedron
          const s = obj.size;
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.86, s * 0.5);
          ctx.lineTo(-s * 0.86, s * 0.5);
          ctx.closePath();
          ctx.stroke();
        }

        ctx.restore();
      });
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="global-3d-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-80"
      aria-hidden="true"
    />
  );
};
