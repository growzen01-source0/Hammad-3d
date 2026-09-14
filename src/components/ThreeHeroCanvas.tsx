import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { checkWebGLSupport } from '../utils/webgl';

export const ThreeHeroCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackCanvasRef = useRef<HTMLCanvasElement>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // First check WebGL support
    if (!checkWebGLSupport()) {
      setUseFallback(true);
      return;
    }

    const isMobile = window.innerWidth < 768;
    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let isCleanedUp = false;

    // Safely attempt WebGL initialization
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMobile,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false,
      });

      // Handle context lost gracefully
      const domElement = renderer.domElement;
      domElement.addEventListener('webglcontextlost', (e) => {
        e.preventDefault();
        console.warn('WebGL context lost, switching to 2D canvas fallback.');
        setUseFallback(true);
      });

      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.2 : 1.5));
      container.appendChild(domElement);

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x060709, 0.035);

      const camera = new THREE.PerspectiveCamera(
        55,
        container.clientWidth / container.clientHeight,
        0.1,
        100
      );
      camera.position.z = isMobile ? 8.5 : 7;

      // Lights
      const ambientLight = new THREE.AmbientLight(0x0a140f, 2.5);
      scene.add(ambientLight);

      const mainLight = new THREE.PointLight(0x10f48e, 4.5, 25);
      mainLight.position.set(4, 5, 4);
      scene.add(mainLight);

      const rimLight = new THREE.PointLight(0x059669, 3, 20);
      rimLight.position.set(-5, -3, 2);
      scene.add(rimLight);

      // Objects Group
      const group = new THREE.Group();
      scene.add(group);

      // Core faceted icosahedron
      const coreGeo = new THREE.IcosahedronGeometry(isMobile ? 1.6 : 2.0, 1);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0x0a1f14,
        emissive: 0x052e16,
        emissiveIntensity: 0.4,
        roughness: 0.3,
        metalness: 0.8,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      group.add(coreMesh);

      // Wireframe overlay
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x10f48e,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      const wireMesh = new THREE.Mesh(coreGeo, wireMat);
      wireMesh.scale.setScalar(1.02);
      coreMesh.add(wireMesh);

      // Torus Rings
      const torusGeo = new THREE.TorusGeometry(isMobile ? 2.4 : 3.2, 0.06, 12, isMobile ? 36 : 60);
      const torusMat = new THREE.MeshStandardMaterial({
        color: 0x10f48e,
        emissive: 0x10f48e,
        emissiveIntensity: 0.6,
      });
      const torusMesh = new THREE.Mesh(torusGeo, torusMat);
      torusMesh.rotation.x = Math.PI / 3;
      group.add(torusMesh);

      const torusGeo2 = new THREE.TorusGeometry(isMobile ? 3.0 : 4.0, 0.03, 8, isMobile ? 24 : 48);
      const torusMat2 = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        wireframe: true,
        transparent: true,
        opacity: 0.4,
      });
      const torusMesh2 = new THREE.Mesh(torusGeo2, torusMat2);
      torusMesh2.rotation.y = Math.PI / 4;
      group.add(torusMesh2);

      // Floating Satellites
      const floatingShapes: THREE.Mesh[] = [];
      const shapeCount = isMobile ? 4 : 8;

      for (let i = 0; i < shapeCount; i++) {
        const radius = 0.25 + Math.random() * 0.3;
        const geom = new THREE.OctahedronGeometry(radius, 0);
        const mat = new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0x10f48e : 0x059669,
          emissive: 0x064e3b,
          roughness: 0.3,
          metalness: 0.8,
        });

        const mesh = new THREE.Mesh(geom, mat);
        const angle = (i / shapeCount) * Math.PI * 2;
        const dist = (isMobile ? 2.8 : 3.8) + Math.random() * 1.5;
        const height = (Math.random() - 0.5) * 4;

        mesh.position.set(Math.cos(angle) * dist, height, Math.sin(angle) * dist);
        mesh.userData = {
          rotSpeedX: Math.random() * 0.02,
          rotSpeedY: Math.random() * 0.02,
          origY: height,
          floatFreq: 1 + Math.random() * 2,
        };

        group.add(mesh);
        floatingShapes.push(mesh);
      }

      // Particles
      const particleCount = isMobile ? 180 : 450;
      const particleGeo = new THREE.BufferGeometry();
      const posArray = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 20;
        posArray[i + 1] = (Math.random() - 0.5) * 15;
        posArray[i + 2] = (Math.random() - 0.5) * 12;
      }

      particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      const particleMat = new THREE.PointsMaterial({
        size: 0.045,
        color: 0x10f48e,
        transparent: true,
        opacity: 0.6,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // Mouse tracking
      let targetMouseX = 0;
      let targetMouseY = 0;
      let curMouseX = 0;
      let curMouseY = 0;

      const handleMouseMove = (e: MouseEvent) => {
        targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });

      const handleResize = () => {
        if (!container || !renderer) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener('resize', handleResize);

      // Render loop
      const animate = () => {
        if (isCleanedUp) return;
        animationFrameId = requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        curMouseX += (targetMouseX - curMouseX) * 0.045;
        curMouseY += (targetMouseY - curMouseY) * 0.045;

        group.rotation.y = elapsedTime * 0.18 + curMouseX * 0.5;
        group.rotation.x = Math.sin(elapsedTime * 0.15) * 0.15 - curMouseY * 0.35;
        group.position.x = curMouseX * 0.3;
        group.position.y = curMouseY * 0.2;

        coreMesh.rotation.y += 0.005;
        coreMesh.rotation.x += 0.003;
        torusMesh.rotation.z += 0.008;
        torusMesh2.rotation.x += 0.005;

        floatingShapes.forEach((shape) => {
          shape.rotation.x += shape.userData.rotSpeedX;
          shape.rotation.y += shape.userData.rotSpeedY;
          shape.position.y = shape.userData.origY + Math.sin(elapsedTime * shape.userData.floatFreq) * 0.3;
        });

        particles.rotation.y = elapsedTime * 0.03;

        renderer.render(scene, camera);
      };

      animate();

      return () => {
        isCleanedUp = true;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);

        coreGeo.dispose();
        coreMat.dispose();
        wireMat.dispose();
        torusGeo.dispose();
        torusMat.dispose();
        torusGeo2.dispose();
        torusMat2.dispose();
        particleGeo.dispose();
        particleMat.dispose();
        floatingShapes.forEach((s) => s.geometry.dispose());

        renderer.dispose();
        if (domElement && container.contains(domElement)) {
          container.removeChild(domElement);
        }
      };
    } catch (err) {
      console.warn('Three.js WebGL initialization failed, activating 2D canvas fallback:', err);
      setUseFallback(true);
    }
  }, []);

  // 2D Canvas Fallback with 3D wireframe math and glowing particle physics
  useEffect(() => {
    if (!useFallback) return;

    const canvas = fallbackCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const onResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', onResize);

    // Particle nodes
    const particleCount = 60;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: 1 + Math.random() * 2,
      opacity: 0.2 + Math.random() * 0.5,
    }));

    let angle = 0;
    let mouseX = width / 2;
    let mouseY = height / 2;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Mathematical 3D Octahedron vertices
    const vertices = [
      [0, 120, 0],
      [0, -120, 0],
      [120, 0, 0],
      [-120, 0, 0],
      [0, 0, 120],
      [0, 0, -120],
    ];

    const edges = [
      [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 4], [4, 3], [3, 5], [5, 2],
    ];

    const render2D = () => {
      animId = requestAnimationFrame(render2D);
      ctx.clearRect(0, 0, width, height);

      angle += 0.01;

      // Draw floating glowing particles with network lines
      ctx.fillStyle = '#10f48e';
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw 3D Core Octahedron
      const cx = width / 2 + (mouseX - width / 2) * 0.05;
      const cy = height / 2 + (mouseY - height / 2) * 0.05;

      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const cosB = Math.cos(angle * 0.7);
      const sinB = Math.sin(angle * 0.7);

      const projected = vertices.map(([x, y, z]) => {
        // Rotate Y
        const x1 = x * cosA - z * sinA;
        const z1 = x * sinA + z * cosA;
        // Rotate X
        const y2 = y * cosB - z1 * sinB;
        const z2 = y * sinB + z1 * cosB;

        const fov = 400;
        const scale = fov / (fov + z2);
        return {
          x: cx + x1 * scale,
          y: cy + y2 * scale,
          scale,
        };
      });

      // Draw outer glowing rings
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = '#10f48e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 180, 70, angle * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = '#34d399';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 240, 90, -angle * 0.3, 0, Math.PI * 2);
      ctx.stroke();

      // Draw Edges
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = '#10f48e';
      ctx.lineWidth = 1.2;
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projected[i].x, projected[i].y);
        ctx.lineTo(projected[j].x, projected[j].y);
        ctx.stroke();
      });

      // Draw Vertex nodes
      projected.forEach((pt) => {
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#10f48e';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3 * pt.scale, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    render2D();

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [useFallback]);

  return (
    <div
      ref={containerRef}
      id="three-hero-container"
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {useFallback && (
        <canvas
          ref={fallbackCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}
    </div>
  );
};
